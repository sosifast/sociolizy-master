import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMobileUser } from "@/lib/mobile-auth";
import { getOrdersFromMongo } from "@/lib/mongodb";

/**
 * GET /api/mobile/v1/dashboard
 * Aggregated dashboard payload for mobile app:
 * - balance
 * - platform list
 * - history order & deposit
 * - account info
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    const { user } = auth;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 1. Fetch Platforms with categories and service count
    const platforms = await prisma.platform.findMany({
      orderBy: { id: "asc" },
      include: {
        categories: {
          include: {
            _count: {
              select: { services: true },
            },
          },
        },
      },
    });

    const formattedPlatforms = platforms.map((p) => {
      const totalServices = p.categories.reduce((acc, cat) => acc + cat._count.services, 0);
      return {
        id: p.id,
        uuid: p.uuid,
        name: p.name,
        slug: p.slug,
        icon: p.icon,
        categories_count: p.categories.length,
        services_count: totalServices,
      };
    });

    // 2. Fetch Recent Orders from MongoDB in user's region
    let recentOrders: any[] = [];
    try {
      const orders = await getOrdersFromMongo(user.uuid, 5, user.server_area);
      recentOrders = orders.map((o) => ({
        id: o.id,
        invoice: o.invoice,
        order_id: o.order_id,
        service_id: o.service_id,
        target: o.target,
        qty: o.amount,
        remain: o.remains,
        start: o.start,
        status: o.status,
        price_sale: o.price_sale,
        created_at: o.create_at,
      }));
    } catch (orderErr) {
      console.warn("Failed to fetch recent orders for mobile dashboard:", orderErr);
    }

    // 3. Fetch Recent Deposits from PostgreSQL
    let recentDeposits: any[] = [];
    try {
      const deposits = await prisma.cryptomusTransaction.findMany({
        where: { user_id: user.id },
        orderBy: { create_at: "desc" },
        take: 5,
      });

      recentDeposits = deposits.map((d) => ({
        id: d.id,
        invoice: d.order_id,
        status: d.payment_status,
        jumlah: Number(d.amount),
        crypto_amount: d.crypto_amount ? Number(d.crypto_amount) : null,
        crypto_currency: d.crypto_currency,
        currency: d.currency,
        waktu: d.create_at,
        detail: {
          txid: d.txid,
          invoice_url: d.invoice_url,
        },
      }));
    } catch (depErr) {
      console.warn("Failed to fetch recent deposits for mobile dashboard:", depErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: user.balance,
        account: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          name: user.name,
          level: user.level,
          server_area: user.server_area,
          api_key: user.api_key,
          created_at: user.create_at,
        },
        platform: formattedPlatforms,
        history: {
          orders: recentOrders,
          deposits: recentDeposits,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/mobile/v1/dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data dashboard mobile" },
      { status: 500 }
    );
  }
}

