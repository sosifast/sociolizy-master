import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SUPPORTED_COINS } from "@/lib/merchant-gateway";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const merchants = await prisma.merchantAccount.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            websites: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: merchants,
      availableCoins: DEFAULT_SUPPORTED_COINS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, description, allowedCoins } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Merchant name is required." },
        { status: 400 }
      );
    }

    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = `merchant-${Date.now()}`;

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.merchantAccount.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const merchant = await prisma.merchantAccount.create({
      data: {
        userId: user.id,
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
        allowedCoins: Array.isArray(allowedCoins) && allowedCoins.length > 0
          ? allowedCoins
          : DEFAULT_SUPPORTED_COINS.map((c) => `${c.symbol}_${c.network}`),
      },
    });

    return NextResponse.json({
      success: true,
      data: merchant,
      message: "Merchant created successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, name, description, allowedCoins, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Merchant ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.merchantAccount.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Merchant not found." },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: name ? name.trim() : existing.name,
      description: description !== undefined ? description : existing.description,
      status: status || existing.status,
    };

    if (Array.isArray(allowedCoins)) {
      updateData.allowedCoins = allowedCoins;
    }

    const updated = await prisma.merchantAccount.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Merchant updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Merchant ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.merchantAccount.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Merchant not found." },
        { status: 404 }
      );
    }

    await prisma.merchantAccount.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: "Merchant deleted successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
