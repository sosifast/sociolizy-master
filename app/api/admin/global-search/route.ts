import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { getAllOrdersAcrossAllServers } from "@/lib/mongodb";
import { getAllTicketsAdmin } from "@/lib/ticket-db";

export async function GET(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session || session.level !== "Admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          orders: [],
          users: [],
          services: [],
          tickets: [],
        },
      });
    }

    // Run searches in parallel
    const [usersResult, servicesResult, ordersResult, ticketsResult] = await Promise.allSettled([
      // 1. Search Users
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
          balance: true,
          level: true,
          server_area: true,
        },
        take: 4,
      }),

      // 2. Search Services
      prisma.service.findMany({
        where: {
          OR: [
            { service_name: { contains: q, mode: "insensitive" } },
            { service_id: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          service_id: true,
          service_name: true,
          rate_sale: true,
          category: {
            select: { name: true },
          },
        },
        take: 4,
      }),

      // 3. Search Orders in MongoDB
      getAllOrdersAcrossAllServers({
        search: q,
        limit: 4,
      }).then((res) => res.orders || []),

      // 4. Search Tickets in MongoDB
      getAllTicketsAdmin({
        search: q,
        limit: 4,
      }).then((res) => res.tickets || []),
    ]);

    const users = usersResult.status === "fulfilled" ? usersResult.value : [];
    const services = servicesResult.status === "fulfilled" ? servicesResult.value : [];
    const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
    const tickets = ticketsResult.status === "fulfilled" ? ticketsResult.value : [];

    return NextResponse.json({
      success: true,
      data: {
        users,
        services,
        orders: orders.map((o) => ({
          invoice: o.invoice,
          order_id: o.order_id,
          target: o.target,
          amount: o.amount,
          price_sale: o.price_sale,
          status: o.status,
          server_area: o.server_area,
        })),
        tickets: tickets.map((t) => ({
          ticket_id: t.ticket_id,
          username: t.username,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          category: t.category,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/global-search error:", error);
    return NextResponse.json(
      { success: false, message: "Search error" },
      { status: 500 }
    );
  }
}

