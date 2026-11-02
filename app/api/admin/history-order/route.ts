import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import {
  getAllOrdersAcrossAllServers,
  updateOrderInAllServers,
  getOrderByInvoiceAcrossServers,
} from "@/lib/mongodb";
import {
  checkOrderStatusFromProvider,
  normalizeOrderStatus,
  calculateOrderRefund,
} from "@/lib/provider-api";

/**
 * GET /api/admin/history-order
 * Aggregates all orders across all configured MongoDB cluster servers.
 */
export async function GET(request: Request) {
  await connection();

  try {
    // 1. Admin Authentication Check
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session || session.level !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Memerlukan hak akses Admin." },
        { status: 403 }
      );
    }

    // 2. Parse Query Params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const serverNode = searchParams.get("serverNode") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").trim();

    // 3. If searching by username or email, find matching user UUIDs in PostgreSQL
    let matchingUserUuids: string[] = [];
    if (search.length >= 2) {
      try {
        const foundUsers = await prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
          select: { uuid: true },
          take: 50,
        });
        matchingUserUuids = foundUsers.map((u) => u.uuid);
      } catch (dbErr) {
        console.warn("[Admin History-Order] User search failed:", dbErr);
      }
    }

    // 4. Query All MongoDB Clusters in Parallel
    const result = await getAllOrdersAcrossAllServers({
      serverNode,
      status,
      search,
      userUuids: matchingUserUuids,
      page,
      limit,
    });

    // 5. Enrich with PostgreSQL User and Service Information
    const uniqueUserUuids = Array.from(
      new Set(result.orders.map((o) => o.uuid_user).filter(Boolean))
    );
    const uniqueServiceIds = Array.from(
      new Set(result.orders.map((o) => o.service_id).filter(Boolean))
    );
    const uniqueProviderUuids = Array.from(
      new Set(result.orders.map((o) => o.uuid_api_provider).filter(Boolean) as string[])
    );

    const [users, services, providers] = await Promise.all([
      uniqueUserUuids.length > 0
        ? prisma.user.findMany({
            where: { uuid: { in: uniqueUserUuids } },
            select: {
              id: true,
              uuid: true,
              username: true,
              email: true,
              level: true,
              server_area: true,
            },
          })
        : [],
      uniqueServiceIds.length > 0
        ? prisma.service.findMany({
            where: {
              OR: [
                { service_id: { in: uniqueServiceIds } },
                ...uniqueServiceIds
                  .filter((id) => !isNaN(parseInt(id, 10)))
                  .map((id) => ({ id: parseInt(id, 10) })),
              ],
            },
            select: {
              id: true,
              service_id: true,
              service_name: true,
              category: { select: { id: true, name: true } },
            },
          })
        : [],
      uniqueProviderUuids.length > 0
        ? prisma.apiProvider.findMany({
            where: { uuid: { in: uniqueProviderUuids } },
            select: { id: true, uuid: true, name: true, slug: true },
          })
        : [],
    ]);

    const userMap = new Map(users.map((u) => [u.uuid, u]));
    const serviceMap = new Map();
    services.forEach((s) => {
      serviceMap.set(String(s.service_id), s);
      serviceMap.set(String(s.id), s);
    });
    const providerMap = new Map(providers.map((p) => [p.uuid, p]));

    const enrichedOrders = result.orders.map((ord) => {
      const user = userMap.get(ord.uuid_user);
      const service = serviceMap.get(String(ord.service_id));
      const provider = ord.uuid_api_provider ? providerMap.get(ord.uuid_api_provider) : null;
      const priceSale = Number(ord.price_sale || 0);
      const priceApi = Number(ord.price_api || 0);

      return {
        ...ord,
        user_username: user?.username || "Unknown",
        user_email: user?.email || null,
        user_level: user?.level || null,
        user_server_area: user?.server_area || ord.server_area,
        service_name: service?.service_name || `Layanan #${ord.service_id}`,
        category_name: service?.category?.name || "Kategori Umum",
        provider_name: provider?.name || null,
        profit: Number((priceSale - priceApi).toFixed(4)),
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedOrders,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      metrics: {
        totalOrders: result.total,
        totalOmset: result.totalOmset,
        totalModal: result.totalModal,
        totalProfit: result.totalProfit,
        serverCounts: result.serverCounts,
        statusCounts: result.statusCounts,
      },
      activeServers: result.activeServers,
    });
  } catch (error) {
    console.error("GET /api/admin/history-order error:", error);
    const message = error instanceof Error ? error.message : "Gagal memuat transaksi";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/**
 * POST /api/admin/history-order
 * Syncs order status directly with the API Provider using FormData / SMM API standard.
 * Automatically refunds user balance in PostgreSQL if status becomes Canceled or Partial.
 */
export async function POST(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session || session.level !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Memerlukan hak akses Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { invoice, invoices, server_area } = body;

    // Support single invoice or list of invoices
    const targetInvoices: string[] = [];
    if (invoice && typeof invoice === "string") {
      targetInvoices.push(invoice.trim());
    } else if (Array.isArray(invoices)) {
      targetInvoices.push(...invoices.filter((i: any) => typeof i === "string" && i.trim()));
    }

    if (targetInvoices.length === 0) {
      return NextResponse.json(
        { success: false, message: "Nomor Invoice pesanan wajib disertakan." },
        { status: 400 }
      );
    }

    const syncResults: any[] = [];

    for (const inv of targetInvoices) {
      // 1. Find order in MongoDB across configured clusters
      const found = await getOrderByInvoiceAcrossServers(inv, server_area);
      if (!found) {
        syncResults.push({
          invoice: inv,
          success: false,
          error: "Pesanan tidak ditemukan di klaster database MongoDB.",
        });
        continue;
      }

      const { order, serverNode } = found;

      if (!order.order_id) {
        syncResults.push({
          invoice: inv,
          success: false,
          error: "Pesanan ini belum memiliki Order ID dari provider API.",
        });
        continue;
      }

      // 2. Find API Provider credentials
      let provider: any = null;
      if (order.uuid_api_provider) {
        provider = await prisma.apiProvider.findUnique({
          where: { uuid: order.uuid_api_provider },
        });
      }

      if (!provider) {
        // Fallback: look up provider through service
        const service = await prisma.service.findFirst({
          where: {
            OR: [
              { service_id: order.service_id },
              ...(!isNaN(Number(order.service_id)) ? [{ id: Number(order.service_id) }] : []),
            ],
          },
          include: { api_provider: true },
        });
        if (service?.api_provider) {
          provider = service.api_provider;
        }
      }

      if (!provider || !provider.url || !provider.api_key) {
        syncResults.push({
          invoice: inv,
          success: false,
          error: "Provider API untuk pesanan ini tidak ditemukan atau belum memiliki API Key.",
        });
        continue;
      }

      // 3. Query status from Provider API (FormData with key, action: status, orders, order)
      const providerRes = await checkOrderStatusFromProvider({
        url: provider.url,
        apiKey: provider.api_key,
        orderId: order.order_id,
      });

      if (!providerRes.success || !providerRes.status) {
        syncResults.push({
          invoice: inv,
          success: false,
          error: providerRes.error || "Gagal mendapatkan status dari server provider.",
          rawResponse: providerRes.rawResponse,
        });
        continue;
      }

      const rawStatus = providerRes.status;
      const normalizedStatus = normalizeOrderStatus(rawStatus);
      const remains =
        providerRes.remains !== undefined ? Number(providerRes.remains) : order.remains;
      const startCount =
        providerRes.startCount !== undefined ? Number(providerRes.startCount) : order.start;

      // 4. Calculate Refund if Canceled or Partial
      const refundCalc = calculateOrderRefund(order, normalizedStatus, remains);

      // 5. If refund is due, increment user balance in PostgreSQL
      let refundApplied = false;
      let userUsername = "";
      if (refundCalc.shouldRefund && refundCalc.refundAmount > 0 && order.uuid_user) {
        try {
          const updatedUser = await prisma.user.update({
            where: { uuid: order.uuid_user },
            data: {
              balance: {
                increment: refundCalc.refundAmount,
              },
            },
            select: { username: true, balance: true },
          });
          refundApplied = true;
          userUsername = updatedUser.username;
        } catch (uErr) {
          console.error(`[Refund Error] Failed to update balance for user ${order.uuid_user}:`, uErr);
        }
      }

      // 6. Update order in MongoDB
      const updateData: any = {
        status: normalizedStatus,
        remains,
        start: startCount,
        refund_amount: refundCalc.totalRefundDue,
        refunded: refundCalc.totalRefundDue > 0,
        update_at: new Date(),
      };

      await updateOrderInAllServers(inv, updateData, serverNode.id);

      syncResults.push({
        invoice: inv,
        success: true,
        order_id: order.order_id,
        provider_name: provider.name,
        oldStatus: order.status,
        newStatus: normalizedStatus,
        remains,
        start: startCount,
        refund: {
          ...refundCalc,
          refundApplied,
          userUsername,
        },
        rawResponse: providerRes.rawResponse,
      });
    }

    if (targetInvoices.length === 1) {
      const single = syncResults[0];
      if (!single.success) {
        return NextResponse.json(
          { success: false, message: single.error || "Gagal memperbarui status dari provider." },
          { status: 400 }
        );
      }

      let message = `Status pesanan ${single.invoice} diperbarui ke "${single.newStatus}".`;
      if (single.refund?.refundApplied && single.refund.refundAmount > 0) {
        message += ` Saldo $${single.refund.refundAmount.toFixed(4)} berhasil dikembalikan ke pengguna @${single.refund.userUsername || ""}.`;
      }

      return NextResponse.json({
        success: true,
        message,
        data: single,
      });
    }

    const successCount = syncResults.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      message: `Sinkronisasi selesai: ${successCount} dari ${syncResults.length} pesanan berhasil diperbarui.`,
      results: syncResults,
    });
  } catch (error) {
    console.error("POST /api/admin/history-order error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan sinkronisasi status";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/history-order
 * Manually update order status or fields in MongoDB.
 * Also calculates and refunds user balance if status is set to Canceled or Partial.
 */
export async function PATCH(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session || session.level !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Memerlukan hak akses Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { invoice, status, remains, start, server_area } = body;

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Nomor Invoice wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Fetch current order to check previous state & refund eligibility
    const found = await getOrderByInvoiceAcrossServers(invoice, server_area);
    if (!found) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan di klaster MongoDB." },
        { status: 404 }
      );
    }

    const { order, serverNode } = found;

    const updates: any = {};
    const newStatus = status ? String(status).trim() : order.status;
    const normStatus = normalizeOrderStatus(newStatus);
    const newRemains = remains !== undefined ? Number(remains) : order.remains;
    const newStart = start !== undefined ? Number(start) : order.start;

    updates.status = normStatus;
    if (remains !== undefined) updates.remains = newRemains;
    if (start !== undefined) updates.start = newStart;

    // 2. Calculate Refund
    const refundCalc = calculateOrderRefund(order, normStatus, newRemains);
    let refundMessage = "";

    if (refundCalc.shouldRefund && refundCalc.refundAmount > 0 && order.uuid_user) {
      try {
        const updatedUser = await prisma.user.update({
          where: { uuid: order.uuid_user },
          data: {
            balance: {
              increment: refundCalc.refundAmount,
            },
          },
          select: { username: true },
        });
        updates.refund_amount = refundCalc.totalRefundDue;
        updates.refunded = true;
        refundMessage = ` Saldo sebesar $${refundCalc.refundAmount.toFixed(4)} telah dikembalikan ke akun @${updatedUser.username}.`;
      } catch (uErr) {
        console.error(`[Manual Refund Error] Failed to update balance for user ${order.uuid_user}:`, uErr);
      }
    } else if (refundCalc.totalRefundDue > 0) {
      updates.refund_amount = refundCalc.totalRefundDue;
      updates.refunded = true;
    }

    const success = await updateOrderInAllServers(invoice, updates, serverNode.id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui pesanan di server database MongoDB." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status pesanan ${invoice} berhasil diperbarui ke "${normStatus}".${refundMessage}`,
      data: {
        invoice,
        status: normStatus,
        remains: newRemains,
        start: newStart,
        refund: refundCalc,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/history-order error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui pesanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


