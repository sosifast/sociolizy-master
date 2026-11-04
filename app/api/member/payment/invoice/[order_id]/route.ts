import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { getCryptomusPaymentInfo } from "@/lib/cryptomus";
import { sendDepositSuccessEmail } from "@/lib/resend";
import { pusherServer } from "@/lib/pusher";

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

    // Fail-safe auto-sync: If status is still pending/check/process,
    // automatically query Cryptomus status if last checked > 10 seconds ago
    const isPending = ["pending", "check", "process", "confirm_check"].includes(
      tx.payment_status.toLowerCase()
    );
    const secondsSinceUpdate = (Date.now() - new Date(tx.update_at).getTime()) / 1000;

    if (isPending && secondsSinceUpdate > 10) {
      const setting = await prisma.cryptomusSetting.findFirst({
        orderBy: { id: "asc" },
      });

      if (setting?.merchant_id && setting?.payment_key) {
        try {
          const info = await getCryptomusPaymentInfo({
            orderId: tx.order_id,
            merchantId: setting.merchant_id,
            paymentKey: setting.payment_key,
          });

          if (info.success && info.status) {
            const newStatus = info.status.toLowerCase();
            const willBePaid = newStatus === "paid" || newStatus === "paid_over";
            const depositFiatAmount = info.amount || Number(tx.amount);

            if (newStatus !== tx.payment_status.toLowerCase()) {
              let newBalance = Number(user.balance);

              await prisma.$transaction(async (txPrisma) => {
                await txPrisma.cryptomusTransaction.update({
                  where: { id: tx.id },
                  data: {
                    payment_status: newStatus,
                    txid: info.txid ? String(info.txid) : tx.txid,
                    crypto_amount:
                      info.cryptoAmount !== undefined
                        ? String(info.cryptoAmount)
                        : tx.crypto_amount,
                    raw_response: JSON.stringify(info.raw),
                  },
                });

                if (willBePaid) {
                  const updatedUser = await txPrisma.user.update({
                    where: { id: user.id },
                    data: { balance: { increment: depositFiatAmount } },
                    select: { balance: true },
                  });
                  newBalance = Number(updatedUser.balance);
                  user.balance = updatedUser.balance;

                  if (user.email) {
                    try {
                      await sendDepositSuccessEmail({
                        email: user.email,
                        username: user.username,
                        orderId: tx.order_id,
                        amount: depositFiatAmount,
                        currency: tx.currency,
                        newBalance,
                        txid: info.txid ? String(info.txid) : tx.txid,
                      });
                    } catch (e) {
                      console.warn("[Resend] Invoice auto-sync email error:", e);
                    }
                  }
                }
              });

              // Broadcast Pusher
              try {
                const payload = {
                  order_id: tx.order_id,
                  status: newStatus,
                  payment_status: newStatus,
                  amount: Number(tx.amount),
                  currency: tx.currency,
                  txid: info.txid || tx.txid,
                  username: user.username,
                  new_balance: newBalance,
                };
                await pusherServer.trigger(`member-${user.uuid}`, "deposit-status-updated", payload);
                if (willBePaid) {
                  await pusherServer.trigger(`member-${user.uuid}`, "balance-updated", {
                    balance: newBalance,
                  });
                }
              } catch (pErr) {
                console.warn("[Pusher] Auto-sync broadcast error:", pErr);
              }

              tx.payment_status = newStatus;
              if (info.txid) tx.txid = info.txid;
              if (info.raw) rawData = info.raw;
            }
          }
        } catch (syncErr) {
          console.warn("[Auto-Sync] Error querying Cryptomus status:", syncErr);
        }
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

