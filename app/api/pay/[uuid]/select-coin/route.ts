import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createCryptomusDirectPayment,
  generateQrDataUrl,
} from "@/lib/merchant-gateway";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const body = await req.json().catch(() => ({}));
    const { coin, network } = body;

    if (!coin || !network) {
      return NextResponse.json(
        { success: false, message: "Coin and network must be specified." },
        { status: 400 }
      );
    }

    const tx = await prisma.merchantTransaction.findUnique({
      where: { uuid },
      include: {
        website: true,
        merchant: true,
      },
    });

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Invoice not found." },
        { status: 404 }
      );
    }

    if (tx.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        data: {
          status: "PAID",
          paidAt: tx.paidAt,
          returnUrl: tx.returnUrl || tx.website?.returnUrl,
        },
      });
    }

    // Check if expired
    if (tx.expiresAt && new Date() > tx.expiresAt) {
      return NextResponse.json(
        { success: false, message: "This invoice has expired." },
        { status: 410 }
      );
    }

    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      `http://${req.headers.get("host")}`;

    const internalWebhook = `${appBaseUrl}/api/gateway/cryptomus/webhook`;

    // Call Cryptomus to generate dynamic address for the chosen coin & network
    const directResult = await createCryptomusDirectPayment({
      amountUsd: Number(tx.amountUsd),
      orderId: tx.uuid,
      cryptoCurrency: coin,
      cryptoNetwork: network,
      callbackUrl: internalWebhook,
      returnUrl: tx.returnUrl || tx.website?.returnUrl || undefined,
    });

    const qrText = directResult.payAddress
      ? `${directResult.payAddress}`
      : "";

    const qrCodeUrl = qrText ? await generateQrDataUrl(qrText) : "";

    // Update transaction with selected crypto details
    const updated = await prisma.merchantTransaction.update({
      where: { id: tx.id },
      data: {
        cryptoCurrency: directResult.cryptoCurrency,
        cryptoNetwork: directResult.cryptoNetwork,
        cryptoAmount: directResult.cryptoAmount,
        payAddress: directResult.payAddress,
        cryptomusOrderId: directResult.cryptomusOrderId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: updated.uuid,
        orderId: updated.orderId,
        amountUsd: Number(updated.amountUsd),
        cryptoCurrency: updated.cryptoCurrency,
        cryptoNetwork: updated.cryptoNetwork,
        cryptoAmount: Number(updated.cryptoAmount),
        payAddress: updated.payAddress,
        qrCodeUrl,
        expiresAt: updated.expiresAt,
        status: updated.paymentStatus,
      },
    });
  } catch (err: any) {
    console.error("Select coin error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to generate crypto payment address" },
      { status: 500 }
    );
  }
}

