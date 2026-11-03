import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMobileUser } from "@/lib/mobile-auth";
import { submitOrderToProvider } from "@/lib/provider-api";
import { createOrderInMongo, getOrdersFromMongo } from "@/lib/mongodb";
import { sendOrderCreatedEmail } from "@/lib/resend";

function generateInvoice(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${dateStr}-${rand}`;
}

/**
 * GET /api/mobile/v1/order
 * Fetches user's orders from MongoDB
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

    return NextResponse.json({
      success: true,
      data: orders,
      user_balance: user.balance,
      server_area: user.server_area,
    });
  } catch (error) {
    console.error("GET /api/mobile/v1/order error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar pesanan" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mobile/v1/order
 * Creates an order, calculates transaction, deducts user balance,
 * sends to provider API, and saves to MongoDB in user's region cluster.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    const { user } = auth;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { service_id, target, amount, refill = false, custom_comments } = body;

    // 1. Basic validation
    if (!service_id) {
      return NextResponse.json(
        { success: false, message: "Layanan wajib dipilih." },
        { status: 400 }
      );
    }

    if (!target || typeof target !== "string" || !target.trim()) {
      return NextResponse.json(
        { success: false, message: "Target / URL / username wajib diisi." },
        { status: 400 }
      );
    }

    const orderQuantity = Number(amount);
    if (!Number.isSafeInteger(orderQuantity) || orderQuantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah pemesanan harus berupa angka bulat positif." },
        { status: 400 }
      );
    }

    const userRegion = user.server_area || "SG";

    // 2. Find service with its provider & category
    const serviceNumericId = parseInt(String(service_id), 10);
    const service = await prisma.service.findFirst({
      where: isNaN(serviceNumericId)
        ? { service_id: String(service_id) }
        : { OR: [{ id: serviceNumericId }, { service_id: String(service_id) }] },
      include: {
        api_provider: true,
        category: {
          include: {
            platform: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Layanan yang dipilih tidak ditemukan atau nonaktif." },
        { status: 404 }
      );
    }

    // 3. Validate min & max
    if (service.min > 0 && orderQuantity < service.min) {
      return NextResponse.json(
        {
          success: false,
          message: `Jumlah pemesanan (${orderQuantity.toLocaleString()}) di bawah batas minimum layanan (${service.min.toLocaleString()}).`,
        },
        { status: 400 }
      );
    }

    if (service.max > 0 && orderQuantity > service.max) {
      return NextResponse.json(
        {
          success: false,
          message: `Jumlah pemesanan (${orderQuantity.toLocaleString()}) melebihi batas maksimum layanan (${service.max.toLocaleString()}).`,
        },
        { status: 400 }
      );
    }

    // 4. Calculate transaction price
    const rateSale = Number(service.rate_sale);
    const rateApi = Number(service.rate_api);
    const priceSale = (orderQuantity / 1000) * rateSale;
    const priceApi = (orderQuantity / 1000) * rateApi;

    if (
      !Number.isFinite(rateSale) ||
      !Number.isFinite(rateApi) ||
      rateSale < 0 ||
      rateApi < 0 ||
      !Number.isFinite(priceSale) ||
      !Number.isFinite(priceApi)
    ) {
      return NextResponse.json(
        { success: false, message: "Harga layanan tidak valid." },
        { status: 400 }
      );
    }

    // Atomically reserve the order cost so overlapping requests cannot overspend.
    const debit = await prisma.user.updateMany({
      where: {
        id: user.id,
        balance: { gte: priceSale },
      },
      data: {
        balance: { decrement: priceSale },
      },
    });

    if (debit.count !== 1) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });
      const currentBalance = Number(currentUser?.balance ?? 0);

      return NextResponse.json(
        {
          success: false,
          message: `Saldo tidak mencukupi. Total biaya $${priceSale.toFixed(4)}, saldo saat ini $${currentBalance.toFixed(2)}.`,
          needed: priceSale,
          currentBalance,
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { balance: true },
    });

    const invoice = generateInvoice();

    // 5. Submit to provider API if configured
    let providerOrderId: string | null = null;
    let orderStatus = "Pending";

    if (service.api_provider && service.api_provider.url && service.api_provider.api_key) {
      const providerResult = await submitOrderToProvider({
        url: service.api_provider.url,
        apiKey: service.api_provider.api_key,
        serviceId: service.service_id,
        target: target.trim(),
        quantity: orderQuantity,
        customComments: custom_comments,
      });

      if (!providerResult.success) {
        await prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: priceSale } },
        });

        return NextResponse.json(
          {
            success: false,
            message: `Gagal membuat pesanan ke provider: ${providerResult.error || "Server provider menolak pesanan"}`,
            raw: providerResult.rawResponse,
          },
          { status: 400 }
        );
      }

      providerOrderId = providerResult.orderId ? String(providerResult.orderId) : null;
      orderStatus = "Processing";
    }

    // Save order directly into MongoDB in user's assigned cluster region.
    const newMongoOrder = await createOrderInMongo(
      {
        uuid_user: user.uuid,
        uuid_api_provider: service.api_provider?.uuid || null,
        service_id: service.service_id,
        invoice,
        order_id: providerOrderId,
        amount: orderQuantity,
        price_api: priceApi,
        price_sale: priceSale,
        target: target.trim(),
        remains: orderQuantity,
        start: 0,
        refill: Boolean(refill),
        status: orderStatus,
      },
      userRegion
    );

    // 8. Pusher real-time notifications
    try {
      const { pusherServer } = await import("@/lib/pusher");
      const orderPayload = {
        id: newMongoOrder.id,
        invoice: newMongoOrder.invoice,
        order_id: newMongoOrder.order_id,
        username: user.username,
        service_name: service.service_name,
        target: newMongoOrder.target,
        amount: newMongoOrder.amount,
        price_sale: newMongoOrder.price_sale,
        status: newMongoOrder.status,
        server_area: userRegion,
        create_at: newMongoOrder.create_at,
      };

      await pusherServer.trigger("admin-notifications", "order-created", orderPayload);
      await pusherServer.trigger("admin-orders", "new-order", orderPayload);
      await pusherServer.trigger(`member-${user.uuid}`, "order-created", {
        ...orderPayload,
        balance: Number(updatedUser.balance),
      });
      await pusherServer.trigger(`member-${user.uuid}`, "balance-updated", {
        balance: Number(updatedUser.balance),
      });
    } catch (pErr) {
      console.warn("Pusher broadcast error:", pErr);
    }

    // 9. Resend email notification
    try {
      if (user.email) {
        await sendOrderCreatedEmail({
          email: user.email,
          username: user.username,
          invoice: newMongoOrder.invoice,
          orderId: newMongoOrder.order_id,
          serviceName: service.service_name,
          target: newMongoOrder.target,
          quantity: newMongoOrder.amount,
          price: newMongoOrder.price_sale,
          status: newMongoOrder.status,
          remainingBalance: Number(updatedUser.balance),
        });
      }
    } catch (emailErr) {
      console.warn("Resend email error:", emailErr);
    }

    // 10. Return detailed response
    return NextResponse.json({
      success: true,
      message: `Pesanan berhasil dibuat di server cluster ${userRegion}!`,
      data: {
        id: newMongoOrder.id,
        invoice: newMongoOrder.invoice,
        order_id: newMongoOrder.order_id,
        service: {
          id: service.id,
          service_id: service.service_id,
          name: service.service_name,
          platform: service.category?.platform?.name || "General",
          category: service.category?.name || "General",
          rate_sale: rateSale,
        },
        target: newMongoOrder.target,
        amount: newMongoOrder.amount,
        price_sale: newMongoOrder.price_sale,
        status: newMongoOrder.status,
        remaining_balance: Number(updatedUser.balance),
        server_area: userRegion,
        created_at: newMongoOrder.create_at,
      },
    });
  } catch (error) {
    console.error("POST /api/mobile/v1/order error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal saat membuat pesanan." },
      { status: 500 }
    );
  }
}
