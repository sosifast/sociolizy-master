import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
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

    const isExpired = tx.expiresAt && new Date() > tx.expiresAt && tx.paymentStatus === "PENDING";
    const status = isExpired ? "EXPIRED" : tx.paymentStatus;

    if (isExpired && tx.paymentStatus === "PENDING") {
      await prisma.merchantTransaction.update({
        where: { id: tx.id },
        data: { paymentStatus: "EXPIRED" },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        txid: tx.txid,
        paidAt: tx.paidAt,
        returnUrl: tx.returnUrl || tx.website?.returnUrl,
        cryptoAmount: tx.cryptoAmount ? Number(tx.cryptoAmount) : null,
        cryptoCurrency: tx.cryptoCurrency,
        cryptoNetwork: tx.cryptoNetwork,
        payAddress: tx.payAddress,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

