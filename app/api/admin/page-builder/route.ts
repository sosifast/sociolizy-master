import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { generateSlug } from "@/lib/blog-utils";
import { STARTER_TEMPLATES } from "@/lib/page-builder-types";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = await verifySessionToken(token);
  return user && user.level === "Admin" ? user : null;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "16")));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [total, pages] = await Promise.all([
      prisma.customPage.count({ where }),
      prisma.customPage.findMany({
        where,
        orderBy: { update_at: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: pages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/page-builder error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, template_id, status = "DRAFT", meta_title, meta_description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Page title is required" },
        { status: 400 }
      );
    }

    // Determine initial slug
    let baseSlug = body.slug ? generateSlug(body.slug) : generateSlug(title);
    if (!baseSlug) baseSlug = "page-" + Date.now().toString(36);

    const RESERVED_SLUGS = new Set([
      "admin", "api", "auth", "blog", "member", "services", "service", "about",
      "about-us", "contact", "contact-us", "privacy", "policy", "terms", "doc",
      "docs", "documentasi", "dokumentasi", "documentation", "page", "show",
      "login", "register", "logout", "sitemap", "robots", "favicon", "icon",
    ]);

    if (RESERVED_SLUGS.has(baseSlug.toLowerCase())) {
      baseSlug = `p-${baseSlug}`;
    }

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.customPage.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Select blocks from template if selected
    let initialBlocks = body.blocks || [];
    if (template_id && (!initialBlocks || initialBlocks.length === 0)) {
      const template = STARTER_TEMPLATES.find((t) => t.id === template_id);
      if (template) {
        initialBlocks = template.blocks;
      }
    }

    // Default styles
    const defaultStyles = body.styles || {
      containerWidth: "max-w-7xl",
      bgColor: "bg-white",
      showNavbar: true,
      showFooter: true,
    };

    const newPage = await prisma.customPage.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        description: body.description?.trim() || null,
        blocks: initialBlocks,
        styles: defaultStyles,
        status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        meta_title: meta_title?.trim() || title.trim(),
        meta_description: meta_description?.trim() || body.description?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Page created successfully",
      data: newPage,
    });
  } catch (error: any) {
    console.error("POST /api/admin/page-builder error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create page" },
      { status: 500 }
    );
  }
}

