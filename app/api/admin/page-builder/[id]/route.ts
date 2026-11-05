import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { generateSlug } from "@/lib/blog-utils";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = await verifySessionToken(token);
  return user && user.level === "Admin" ? user : null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, props: RouteParams) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid page ID" },
        { status: 400 }
      );
    }

    const page = await prisma.customPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, message: "Custom page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error("GET /api/admin/page-builder/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, props: RouteParams) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid page ID" },
        { status: 400 }
      );
    }

    const existingPage = await prisma.customPage.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.slug !== undefined) {
      let candidateSlug = generateSlug(body.slug);
      if (!candidateSlug) candidateSlug = generateSlug(body.title || existingPage.title);

      const RESERVED_SLUGS = new Set([
        "admin", "api", "auth", "blog", "member", "services", "service", "about",
        "about-us", "contact", "contact-us", "privacy", "policy", "terms", "doc",
        "docs", "documentasi", "dokumentasi", "documentation", "page", "show",
        "login", "register", "logout", "sitemap", "robots", "favicon", "icon",
      ]);

      if (RESERVED_SLUGS.has(candidateSlug.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            message: `The slug "${candidateSlug}" is reserved for system use. Please choose another slug.`,
          },
          { status: 400 }
        );
      }

      // Check collision
      const slugClash = await prisma.customPage.findFirst({
        where: {
          slug: candidateSlug,
          NOT: { id: pageId },
        },
      });

      if (slugClash) {
        return NextResponse.json(
          {
            success: false,
            message: `The slug "${candidateSlug}" is already used by another page.`,
          },
          { status: 409 }
        );
      }

      updateData.slug = candidateSlug;
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.blocks !== undefined) {
      updateData.blocks = body.blocks;
    }

    if (body.styles !== undefined) {
      updateData.styles = body.styles;
    }

    if (body.status !== undefined) {
      updateData.status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    }

    if (body.meta_title !== undefined) {
      updateData.meta_title = body.meta_title?.trim() || null;
    }

    if (body.meta_description !== undefined) {
      updateData.meta_description = body.meta_description?.trim() || null;
    }

    const updated = await prisma.customPage.update({
      where: { id: pageId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/page-builder/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: RouteParams) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await props.params;
    const pageId = parseInt(id);
    if (isNaN(pageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid page ID" },
        { status: 400 }
      );
    }

    const existingPage = await prisma.customPage.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    await prisma.customPage.delete({
      where: { id: pageId },
    });

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/page-builder/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete page" },
      { status: 500 }
    );
  }
}

