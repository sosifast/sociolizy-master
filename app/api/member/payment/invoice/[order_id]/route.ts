import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  await connection();

  try {
    const { order_id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { id: true, uuid: true, username: true, email: true, balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Support both order_id (e.g. DEP-20261103-12345) and numeric ID
    const isNumeric = /^\d+$/.test(order_id);
    const tx = await prisma.cryptomusTransaction.findFirst({
      where: {
        user_id: user.id,
        OR: [
          { order_id },
          ...(isNumeric ? [{ id: parseInt(order_id, 10) }] : []),
        ],
      },
    });

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Transaksi deposit tidak ditemukan." },
        { status: 404 }
      );
    }

    // Try parsing raw_response if present
    let rawData: any = null;
    if (tx.raw_response) {
      try {
        rawData = JSON.parse(tx.raw_response);
      } catch {
        rawData = null;
      }
    }

    const depositAddress = rawData?.address || rawData?.result?.address || null;
    const depositNetwork = rawData?.network || rawData?.result?.network || "tron";

    return NextResponse.json({
      success: true,
      data: {
        id: tx.id,
        order_id: tx.order_id,
        amount: Number(tx.amount),
        currency: tx.currency,
        crypto_amount: tx.crypto_amount ? Number(tx.crypto_amount) : (rawData?.payer_amount || rawData?.result?.payer_amount || null),
        crypto_currency: tx.crypto_currency || rawData?.payer_currency || rawData?.result?.payer_currency || "USDT",
        payment_status: tx.payment_status,
        address: depositAddress,
        network: depositNetwork,
        invoice_url: tx.invoice_url,
        txid: tx.txid || rawData?.txid || null,
        from_address: rawData?.from || null,
        create_at: tx.create_at.toISOString(),
        update_at: tx.update_at.toISOString(),
        user: {
          username: user.username,
          email: user.email,
          uuid: user.uuid,
          current_balance: Number(user.balance),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/member/payment/invoice/[order_id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat detail invoice." },
      { status: 500 }
    );
  }
}

