import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateApiKey(): string {
  return `mch_live_${crypto.randomBytes(16).toString("hex")}`;
}

function generateSecretKey(): string {
  return `mch_sec_${crypto.randomBytes(24).toString("hex")}`;
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const merchantId = searchParams.get("merchantId");

    const whereClause: any = {
      merchant: { userId: user.id },
    };

    if (merchantId) {
      whereClause.merchantId = Number(merchantId);
    }

    const websites = await prisma.merchantWebsite.findMany({
      where: whereClause,
      include: {
        merchant: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: websites,
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
    const { merchantId, name, domain, webhookUrl, returnUrl } = body;

    if (!merchantId || !name || !domain) {
      return NextResponse.json(
        { success: false, message: "Merchant ID, website name, and domain are required." },
        { status: 400 }
      );
    }

    // Verify ownership of the merchant
    const merchant = await prisma.merchantAccount.findFirst({
      where: { id: Number(merchantId), userId: user.id },
    });

    if (!merchant) {
      return NextResponse.json(
        { success: false, message: "Merchant store not found or unauthorized." },
        { status: 404 }
      );
    }

    const apiKey = generateApiKey();
    const secretKey = generateSecretKey();

    const website = await prisma.merchantWebsite.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        domain: domain.trim(),
        apiKey,
        secretKey,
        webhookUrl: webhookUrl ? webhookUrl.trim() : null,
        returnUrl: returnUrl ? returnUrl.trim() : null,
        status: "ACTIVE",
      },
      include: {
        merchant: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: website,
      message: "Website connected successfully.",
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
    const { id, name, domain, webhookUrl, returnUrl, status, regenerateKeys } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Website ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.merchantWebsite.findFirst({
      where: {
        id: Number(id),
        merchant: { userId: user.id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Website not found." },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: name ? name.trim() : existing.name,
      domain: domain ? domain.trim() : existing.domain,
      webhookUrl: webhookUrl !== undefined ? (webhookUrl ? webhookUrl.trim() : null) : existing.webhookUrl,
      returnUrl: returnUrl !== undefined ? (returnUrl ? returnUrl.trim() : null) : existing.returnUrl,
      status: status || existing.status,
    };

    if (regenerateKeys) {
      updateData.apiKey = generateApiKey();
      updateData.secretKey = generateSecretKey();
    }

    const updated = await prisma.merchantWebsite.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: regenerateKeys ? "API Keys regenerated successfully." : "Website updated successfully.",
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
        { success: false, message: "Website ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.merchantWebsite.findFirst({
      where: {
        id: Number(id),
        merchant: { userId: user.id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Website not found." },
        { status: 404 }
      );
    }

    await prisma.merchantWebsite.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: "Website deleted successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
