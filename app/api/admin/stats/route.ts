import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, getCacheHeaders, invalidateCacheKey } from "@/lib/server-cache";
import { getAllOrdersAcrossAllServers } from "@/lib/mongodb";
import { getAllTicketsAdmin } from "@/lib/ticket-db";

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const isFresh = searchParams.get("fresh") === "1" || searchParams.get("refresh") === "1";

    if (isFresh) {
      invalidateCacheKey("admin:stats");
    }

    const statsData = await getCachedData(
      "admin:stats",
      async () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 1. Parallel fetch from PostgreSQL, MongoDB multi-cluster, and Ticket store
        const [
          usersCount,
          usersTodayCount,
          userBalanceAgg,
          servicesCount,
          platformsCount,
          categoriesCount,
          providersRaw,
          platforms,
          recentUsers,
          ordersRes,
          ticketsRes,
          depositAgg,
          pendingDepositsCount,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { create_at: { gte: todayStart } } }),
          prisma.user.aggregate({ _sum: { balance: true } }),
          prisma.service.count(),
          prisma.platform.count(),
          prisma.category.count(),
          prisma.apiProvider.findMany({
            select: {
              id: true,
              uuid: true,
              name: true,
              slug: true,
              url: true,
              balance: true,
              update_at: true,
            },
            orderBy: { id: "asc" },
          }),
          prisma.platform.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              _count: { select: { categories: true } },
            },
            orderBy: { id: "desc" },
            take: 6,
          }),
          prisma.user.findMany({
            take: 6,
            orderBy: { id: "desc" },
            select: {
              id: true,
              username: true,
              email: true,
              level: true,
              balance: true,
              create_at: true,
            },
          }),
          getAllOrdersAcrossAllServers({ limit: 12 }).catch((err) => {
            console.warn("[Admin Stats] Error fetching orders:", err);
            return {
              orders: [],
              total: 0,
              page: 1,
              limit: 12,
              totalPages: 1,
              serverCounts: {} as Record<string, number>,
              statusCounts: {
                Pending: 0,
                Processing: 0,
                "In progress": 0,
                Completed: 0,
                Partial: 0,
                Canceled: 0,
              } as Record<string, number>,
              totalOmset: 0,
              totalModal: 0,
              totalProfit: 0,
              activeServers: [],
            };
          }),
          getAllTicketsAdmin({ limit: 100 }).catch((err) => {
            console.warn("[Admin Stats] Error fetching tickets:", err);
            return { tickets: [], total: 0 };
          }),
          prisma.cryptomusTransaction
            .aggregate({
              _sum: { amount: true },
              _count: { id: true },
              where: { payment_status: "paid" },
            })
            .catch(() => ({ _sum: { amount: null }, _count: { id: 0 } })),
          prisma.cryptomusTransaction
            .count({
              where: { payment_status: "pending" },
            })
            .catch(() => 0),
        ]);

        // Process Provider balances & status
        let totalProviderBalance = 0;
        let lowBalanceCount = 0;
        const providers = providersRaw.map((p) => {
          const bal = Number(p.balance || 0);
          totalProviderBalance += bal;
          let status: "healthy" | "low" | "critical" = "healthy";
          if (bal < 5) {
            status = "critical";
            lowBalanceCount++;
          } else if (bal < 15) {
            status = "low";
            lowBalanceCount++;
          }
          return {
            id: p.id,
            uuid: p.uuid,
            name: p.name,
            slug: p.slug,
            url: p.url,
            balance: bal,
            update_at: p.update_at.toISOString(),
            status,
          };
        });

        // Enrich recent orders with service names and user usernames
        const recentOrdersRaw = ordersRes.orders || [];
        const orderUserUuids = Array.from(
          new Set(recentOrdersRaw.map((o) => o.uuid_user).filter(Boolean))
        );
        const orderServiceIds = Array.from(
          new Set(recentOrdersRaw.map((o) => o.service_id).filter(Boolean))
        );

        const [orderUsers, orderServices] = await Promise.all([
          orderUserUuids.length > 0
            ? prisma.user.findMany({
              where: { uuid: { in: orderUserUuids } },
              select: { uuid: true, username: true, level: true },
            })
            : [],
          orderServiceIds.length > 0
            ? prisma.service.findMany({
              where: {
                OR: [
                  { service_id: { in: orderServiceIds } },
                  ...orderServiceIds
                    .filter((id) => !isNaN(parseInt(id, 10)))
                    .map((id) => ({ id: parseInt(id, 10) })),
                ],
              },
              select: {
                id: true,
                service_id: true,
                service_name: true,
                category: { select: { name: true } },
              },
            })
            : [],
        ]);

        const orderUserMap = new Map(orderUsers.map((u) => [u.uuid, u]));
        const orderServiceMap = new Map<string, { id: number; service_id: string; service_name: string; category?: { name: string } | null }>();
        orderServices.forEach((s) => {
          orderServiceMap.set(String(s.service_id), s);
          orderServiceMap.set(String(s.id), s);
        });

        let todayOrdersCount = 0;
        let todayOmset = 0;
        let todayProfit = 0;

        const recentOrders = recentOrdersRaw.map((o) => {
          const user = orderUserMap.get(o.uuid_user);
          const service = orderServiceMap.get(String(o.service_id));
          const pSale = Number(o.price_sale || 0);
          const pApi = Number(o.price_api || 0);
          const oDate = new Date(o.create_at);

          if (oDate >= todayStart) {
            todayOrdersCount++;
            todayOmset += pSale;
            todayProfit += pSale - pApi;
          }

          return {
            id: o.id,
            invoice: o.invoice,
            order_id: o.order_id,
            service_id: o.service_id,
            service_name: service?.service_name || `Layanan #${o.service_id}`,
            category_name: service?.category?.name || "Umum",
            user_username: user?.username || "Guest/Unknown",
            user_level: user?.level || "Member",
            target: o.target,
            amount: o.amount,
            price_sale: pSale,
            price_api: pApi,
            profit: Number((pSale - pApi).toFixed(4)),
            status: o.status || "Pending",
            server_area: o.server_area || "SG",
            create_at: o.create_at ? new Date(o.create_at).toISOString() : new Date().toISOString(),
          };
        });

        // True grand total orders across all cluster servers
        const grandTotalOrders =
          Object.values(ordersRes.serverCounts || {}).reduce((acc, count) => acc + count, 0) ||
          ordersRes.total;

        // Process Tickets
        const openTickets = ticketsRes.tickets.filter(
          (t) => t.status === "open" || t.status === "in_progress"
        );
        const urgentTicketsCount = openTickets.filter(
          (t) =>
            (t.priority === "high" || t.priority === "urgent") &&
            t.status !== "resolved" &&
            t.status !== "closed"
        ).length;

        // Build Diagnostic System Alerts
        const systemAlerts: Array<{
          type: "info" | "warning" | "danger" | "success";
          title: string;
          message: string;
          actionLink?: string;
          actionText?: string;
        }> = [];

        // Check offline servers
        const offlineServers = (ordersRes.activeServers || []).filter((s) => !s.isOnline);
        if (offlineServers.length > 0) {
          systemAlerts.push({
            type: "danger",
            title: "Cluster Node Offline",
            message: `Ada ${offlineServers.length} node MongoDB (${offlineServers.map((s) => s.id).join(", ")}) tidak merespon koneksi ping.`,
            actionLink: "/admin/server",
            actionText: "Cek Cluster",
          });
        }

        // Check low balance providers
        const criticalProviders = providers.filter((p) => p.status === "critical");
        const lowProviders = providers.filter((p) => p.status === "low");
        if (criticalProviders.length > 0) {
          systemAlerts.push({
            type: "danger",
            title: "Saldo Provider Kritis!",
            message: `Provider ${criticalProviders.map((p) => `${p.name} ($${p.balance.toFixed(2)})`).join(", ")} saldo mendekati $0. Order API berisiko tertolak.`,
            actionLink: "/admin/provider",
            actionText: "Top-Up Provider",
          });
        } else if (lowProviders.length > 0) {
          systemAlerts.push({
            type: "warning",
            title: "Saldo Provider Menipis",
            message: `Provider ${lowProviders.map((p) => `${p.name} ($${p.balance.toFixed(2)})`).join(", ")} berada di bawah $15. Disarankan segera isi saldo.`,
            actionLink: "/admin/provider",
            actionText: "Lihat Provider",
          });
        }

        // Check tickets
        if (urgentTicketsCount > 0) {
          systemAlerts.push({
            type: "warning",
            title: "Tiket Bantuan Mendesak",
            message: `Terdapat ${urgentTicketsCount} tiket bantuan berprioritas High/Urgent menunggu respon Admin.`,
            actionLink: "/admin/ticket",
            actionText: "Balas Tiket",
          });
        } else if (openTickets.length > 0) {
          systemAlerts.push({
            type: "info",
            title: "Tiket Bantuan Terbuka",
            message: `Terdapat ${openTickets.length} tiket bantuan aktif yang belum terselesaikan.`,
            actionLink: "/admin/ticket",
            actionText: "Buka Tiket",
          });
        }

        // Check pending orders backlog
        const pendingCount = ordersRes.statusCounts?.Pending || 0;
        if (pendingCount > 10) {
          systemAlerts.push({
            type: "info",
            title: "Antrian Order Pending",
            message: `Ada ${pendingCount} pesanan dalam antrian Pending menunggu proses kirim API provider.`,
            actionLink: "/admin/history-order?status=Pending",
            actionText: "Tinjau Order",
          });
        }

        // Default healthy alert if everything is green
        if (systemAlerts.length === 0) {
          systemAlerts.push({
            type: "success",
            title: "Sistem Normal & Terkoneksi",
            message: "Semua cluster server node MongoDB, provider API gateway, dan antrian pesanan beroperasi optimal.",
          });
        }

        // Calculate overall system health
        const systemStatus: "operational" | "warning" | "critical" =
          offlineServers.length > 0 || criticalProviders.length > 0
            ? "critical"
            : lowProviders.length > 0 || urgentTicketsCount > 0
              ? "warning"
              : "operational";

        return {
          // Orders & Revenue
          totalOrders: grandTotalOrders,
          todayOrdersCount,
          totalOmset: ordersRes.totalOmset,
          todayOmset: Number(todayOmset.toFixed(4)),
          totalModal: ordersRes.totalModal,
          totalProfit: ordersRes.totalProfit,
          todayProfit: Number(todayProfit.toFixed(4)),
          statusCounts: ordersRes.statusCounts,
          recentOrders,

          // Server Clusters
          activeServers: ordersRes.activeServers || [],

          // Providers
          providers,
          totalProviderBalance: Number(totalProviderBalance.toFixed(2)),
          lowBalanceCount,

          // Users
          usersCount,
          usersTodayCount,
          totalUserBalance: Number(userBalanceAgg._sum.balance || 0),
          recentUsers,

          // Platforms & Catalog
          servicesCount,
          platformsCount,
          categoriesCount,
          platforms,

          // Cryptomus / Deposits
          totalDepositsPaid: Number(depositAgg._sum?.amount || 0),
          totalDepositsCount: depositAgg._count?.id || 0,
          pendingDepositsCount,

          // Tickets
          openTicketsCount: openTickets.length,
          urgentTicketsCount,
          totalTicketsCount: ticketsRes.total,

          // Diagnostics
          systemStatus,
          systemAlerts,
          lastUpdated: new Date().toISOString(),
        };
      },
      { ttlSeconds: 15, tags: ["stats"] }
    );

    return NextResponse.json(
      {
        success: true,
        data: statsData,
      },
      { headers: getCacheHeaders(5, 15) }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil statistik";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
