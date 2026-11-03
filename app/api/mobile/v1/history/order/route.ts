import { NextResponse } from "next/server";
import { authenticateMobileUser } from "@/lib/mobile-auth";
import { getOrdersFromMongo } from "@/lib/mongodb";

/**
 * GET /api/mobile/v1/history/order
 * Fetches member's order history from their assigned MongoDB server
 * Fields: target, qty/jumlah order, remain dan start, status order, price sale, invoice
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const orders = await getOrdersFromMongo(user.uuid, limit, user.server_area);

    const formattedOrders = orders.map((o) => ({
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
      refill: o.refill,
      server_area: o.server_area || user.server_area,
      created_at: o.create_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      total: formattedOrders.length,
    });
  } catch (error) {
    console.error("GET /api/mobile/v1/history/order error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil riwayat pesanan" },
      { status: 500 }
    );
  }
}

