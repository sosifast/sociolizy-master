import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey =
      req.headers.get("x-api-key") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Missing API Key header (x-api-key)" },
        { status: 401 }
      );
    }

    const website = await prisma.merchantWebsite.findUnique({
      where: { apiKey },
    });

    if (!website) {
      return NextResponse.json(
        { success: false, message: "Invalid API Key." },
        { status: 401 }
      );
    }

    const tx = await prisma.merchantTransaction.findFirst({
      where: {
        OR: [{ uuid: id }, { orderId: id }],
        websiteId: website.id,
      },
    });

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Invoice not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        invoice_id: tx.uuid,
        order_id: tx.orderId,
        amount_usd: Number(tx.amountUsd),
        net_amount_usd: Number(tx.netAmountUsd),
        admin_fee: Number(tx.adminFee),
        status: tx.paymentStatus,
        crypto_currency: tx.cryptoCurrency,
        crypto_network: tx.cryptoNetwork,
        crypto_amount: tx.cryptoAmount ? Number(tx.cryptoAmount) : null,
        pay_address: tx.payAddress,
        txid: tx.txid,
        created_at: tx.createdAt,
        expires_at: tx.expiresAt,
        paid_at: tx.paidAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

