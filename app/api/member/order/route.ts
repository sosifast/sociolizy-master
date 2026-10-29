import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { submitOrderToProvider } from "@/lib/provider-api";
import { createOrderInMongo, getOrdersFromMongo } from "@/lib/mongodb";

/**
 * Generate a unique invoice ID: INV-YYYYMMDD-XXXXX
 */
function generateInvoice(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${dateStr}-${rand}`;
}

/**
 * GET /api/member/order
 * Fetches member's order history directly from MongoDB in their region
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau telah berakhir" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    // Fetch user profile for latest balance & cluster region
    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: {
        id: true,
        uuid: true,
        username: true,
        balance: true,
        server_area: true,
      },
    });

    const userRegion = user?.server_area || "SG";

    // Query directly from target region's MongoDB database
    const orders = await getOrdersFromMongo(session.uuid, limit, userRegion);

    return NextResponse.json({
      success: true,
      user: {
        balance: Number(user?.balance || 0),
        server_area: userRegion,
      },
      data: orders,
    });
  } catch (error) {
    console.error("GET /api/member/order error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil daftar pesanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/**
 * POST /api/member/order
 * Automatically stores the order into the member's assigned region MongoDB database
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu untuk memesan." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      service_id,
      target,
      amount,
      refill = false,
      custom_comments,
    } = body;

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

    const orderQuantity = parseInt(String(amount), 10);
    if (isNaN(orderQuantity) || orderQuantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah pemesanan harus berupa angka bulat positif." },
        { status: 400 }
      );
    }

    // 2. Fetch fresh user data from database (including server_area)
    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akun pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const userRegion = user.server_area || "SG";

    // 3. Find service with its provider
    const serviceNumericId = parseInt(String(service_id), 10);
    const service = await prisma.service.findFirst({
      where: isNaN(serviceNumericId)
        ? { service_id: String(service_id) }
        : { OR: [{ id: serviceNumericId }, { service_id: String(service_id) }] },
      include: {
        api_provider: true,
        category: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Layanan yang dipilih tidak ditemukan atau nonaktif." },
        { status: 404 }
      );
    }

    // 4. Validate quantity against service min & max
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

    // 5. Calculate prices (USD)
    const rateSale = Number(service.rate_sale);
    const rateApi = Number(service.rate_api);
    const priceSale = (orderQuantity / 1000) * rateSale;
    const priceApi = (orderQuantity / 1000) * rateApi;

    // Check user balance
    const currentBalance = Number(user.balance);
    if (currentBalance < priceSale) {
      return NextResponse.json(
        {
          success: false,
          message: `Saldo tidak mencukupi. Diperlukan $${priceSale.toFixed(4)}, saldo saat ini $${currentBalance.toFixed(2)}.`,
          needed: priceSale,
          currentBalance,
        },
        { status: 400 }
      );
    }

    // 6. Generate Invoice
    const invoice = generateInvoice();

    // 7. Process Order with Provider API (DOC-API.md) if provider exists
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

    // 8. Deduct user balance in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: priceSale,
        },
      },
    });

    // 9. Save order directly into the user's specific region MongoDB database!
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

    return NextResponse.json({
      success: true,
      message: `Pesanan berhasil dibuat di klaster region ${userRegion}!`,
      data: {
        id: newMongoOrder.id,
        invoice: newMongoOrder.invoice,
        order_id: newMongoOrder.order_id,
        uuid_api_provider: newMongoOrder.uuid_api_provider,
        server_area: userRegion,
        service_name: service.service_name,
        target: newMongoOrder.target,
        amount: newMongoOrder.amount,
        price_sale: newMongoOrder.price_sale,
        status: newMongoOrder.status,
        remaining_balance: Number(updatedUser.balance),
      },
    });
  } catch (error) {
    console.error("POST /api/member/order error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal saat membuat pesanan.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
