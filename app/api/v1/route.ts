import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitOrderToProvider } from "@/lib/provider-api";
import {
  createOrderInMongo,
  getOrderByIdForUser,
  getOrdersByIdsForUser,
} from "@/lib/mongodb";

/**
 * Robust parameter parser supporting:
 * - multipart/form-data
 * - application/x-www-form-urlencoded
 * - application/json
 * - URL query parameters
 */
async function parseParams(request: Request): Promise<Record<string, any>> {
  const params: Record<string, any> = {};

  // 1. URL search params fallback
  try {
    const url = new URL(request.url);
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch {}

  // 2. Parse body according to Content-Type
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const json = await request.json();
      if (json && typeof json === "object") {
        Object.assign(params, json);
      }
    } catch {}
  } else if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    try {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = typeof value === "string" ? value : value.name;
      });
    } catch {}
  } else {
    // Attempt fallback parsing
    try {
      const cloned = request.clone();
      const rawText = await cloned.text();
      if (rawText.startsWith("{")) {
        Object.assign(params, JSON.parse(rawText));
      } else if (rawText.includes("=")) {
        const urlParams = new URLSearchParams(rawText);
        urlParams.forEach((value, key) => {
          params[key] = value;
        });
      }
    } catch {}
  }

  return params;
}

/**
 * GET /api/v1
 * Returns API endpoint status and documentation link
 */
export async function GET() {
  await connection();
  return NextResponse.json({
    status: "online",
    version: "v1",
    endpoints: {
      services: { method: "POST", params: ["key", "action=services"] },
      add: { method: "POST", params: ["key", "action=add", "service", "link", "quantity|comments"] },
      status: { method: "POST", params: ["key", "action=status", "order|orders"] },
      balance: { method: "POST", params: ["key", "action=balance"] },
      callback: { method: "POST", params: ["key", "action=set_callback", "url"] },
    },
    documentation: "/documentasi",
  });
}

/**
 * POST /api/v1
 * Standard SMM API V2 Implementation
 */
export async function POST(request: Request) {
  await connection();

  try {
    const params = await parseParams(request);

    // 1. Authenticate API Key
    const apiKeyRaw = params.key || params.api_key;
    if (!apiKeyRaw || typeof apiKeyRaw !== "string" || !apiKeyRaw.trim()) {
      return NextResponse.json(
        { error: "Incorrect request: 'key' is required" },
        { status: 400 }
      );
    }

    const cleanApiKey = apiKeyRaw.trim();
    const user = await prisma.user.findFirst({
      where: { api_key: cleanApiKey },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const action = String(params.action || "").trim().toLowerCase();
    if (!action) {
      return NextResponse.json(
        { error: "Incorrect request: 'action' is required" },
        { status: 400 }
      );
    }

    // 2. Route by Action
    switch (action) {
      /**
       * ACTION: services
       * Returns array of all available active services
       */
      case "services": {
        const services = await prisma.service.findMany({
          include: {
            category: {
              include: {
                platform: true,
              },
            },
          },
          orderBy: [{ id_category: "asc" }, { id: "asc" }],
        });

        const formattedServices = services.map((s) => {
          const categoryName = s.category
            ? `${s.category.platform?.name ? s.category.platform.name + " - " : ""}${s.category.name}`
            : "General";

          const isCustomComments = s.desc?.toLowerCase().includes("comment");

          return {
            service: String(s.id),
            name: s.service_name,
            category: categoryName,
            rate: Number(s.rate_sale).toFixed(2),
            min: String(s.min || 1),
            max: String(s.max || 10000),
            type: isCustomComments ? "custom_comments" : "default",
            desc: s.desc || "",
            dripfeed: 0,
          };
        });

        return NextResponse.json(formattedServices);
      }

      /**
       * ACTION: add
       * Creates a new SMM order
       */
      case "add": {
        const serviceIdRaw = params.service;
        const target = params.link;
        const customComments = params.comments;
        let quantityRaw = params.quantity;

        if (!serviceIdRaw) {
          return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
        }

        if (!target || typeof target !== "string" || !target.trim()) {
          return NextResponse.json({ error: "Link is required" }, { status: 400 });
        }

        let orderQuantity = 0;

        // Custom Comments vs Default Quantity calculation
        if (customComments && typeof customComments === "string" && customComments.trim()) {
          const lines = customComments
            .split(/\r\n|\r|\n/)
            .map((l) => l.trim())
            .filter(Boolean);

          if (lines.length === 0) {
            return NextResponse.json({ error: "Comments list is empty" }, { status: 400 });
          }
          orderQuantity = lines.length;
        } else {
          orderQuantity = parseInt(String(quantityRaw), 10);
          if (isNaN(orderQuantity) || orderQuantity <= 0) {
            return NextResponse.json(
              { error: "Quantity must be a positive integer" },
              { status: 400 }
            );
          }
        }

        // Service lookup
        const serviceIdNum = parseInt(String(serviceIdRaw), 10);
        const service = await prisma.service.findFirst({
          where: isNaN(serviceIdNum)
            ? { service_id: String(serviceIdRaw) }
            : { OR: [{ id: serviceIdNum }, { service_id: String(serviceIdRaw) }] },
          include: {
            api_provider: true,
          },
        });

        if (!service) {
          return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        // Validate limits
        if (service.min > 0 && orderQuantity < service.min) {
          return NextResponse.json(
            { error: `Quantity is below minimum allowed (${service.min})` },
            { status: 400 }
          );
        }

        if (service.max > 0 && orderQuantity > service.max) {
          return NextResponse.json(
            { error: `Quantity exceeds maximum allowed (${service.max})` },
            { status: 400 }
          );
        }

        // Calculate Pricing
        const rateSale = Number(service.rate_sale);
        const rateApi = Number(service.rate_api);
        const priceSale = (orderQuantity / 1000) * rateSale;
        const priceApi = (orderQuantity / 1000) * rateApi;

        // Fetch user's latest balance & callback URL
        const freshUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { balance: true, server_area: true, uuid: true, username: true, callback_url: true },
        });

        const currentBalance = Number(freshUser?.balance || 0);
        if (currentBalance < priceSale) {
          return NextResponse.json(
            { error: "Not enough funds on balance" },
            { status: 400 }
          );
        }

        // Determine callback URL (per-order explicit parameter or user default fallback)
        const orderCallbackRaw =
          params.callback ||
          params.callback_url ||
          params.webhook_url ||
          freshUser?.callback_url ||
          null;
        const cleanCallbackUrl =
          orderCallbackRaw && typeof orderCallbackRaw === "string" && orderCallbackRaw.startsWith("http")
            ? orderCallbackRaw.trim()
            : null;

        // Generate Invoice
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(10000 + Math.random() * 90000);
        const invoice = `INV-${dateStr}-${rand}`;

        // Forward order to upstream API provider if configured
        let providerOrderId: string | null = null;
        let orderStatus = "Pending";

        if (service.api_provider?.url && service.api_provider?.api_key) {
          const providerResult = await submitOrderToProvider({
            url: service.api_provider.url,
            apiKey: service.api_provider.api_key,
            serviceId: service.service_id,
            target: target.trim(),
            quantity: orderQuantity,
            customComments: typeof customComments === "string" ? customComments : undefined,
            runs: params.runs ? parseInt(String(params.runs), 10) : undefined,
            interval: params.interval ? parseInt(String(params.interval), 10) : undefined,
          });

          if (!providerResult.success) {
            return NextResponse.json(
              {
                error: providerResult.error || "Provider rejected the order",
              },
              { status: 400 }
            );
          }

          providerOrderId = providerResult.orderId ? String(providerResult.orderId) : null;
          orderStatus = "Processing";
        }

        // Deduct user balance in PostgreSQL
        await prisma.user.update({
          where: { id: user.id },
          data: {
            balance: {
              decrement: priceSale,
            },
          },
        });

        // Store into user's designated region MongoDB cluster
        const userRegion = freshUser?.server_area || user.server_area || "SG";
        const newOrder = await createOrderInMongo(
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
            refill: false,
            status: orderStatus,
            callback_url: cleanCallbackUrl,
            callback_status: cleanCallbackUrl ? "pending" : null,
          },
          userRegion
        );

        // Realtime Pusher notification dispatch
        try {
          const { pusherServer } = await import("@/lib/pusher");
          pusherServer
            .trigger("admin-notifications", "new-order", {
              invoice,
              username: user.username,
              service: service.service_name,
              amount: orderQuantity,
              total: priceSale,
              time: new Date().toLocaleTimeString("id-ID"),
            })
            .catch(() => {});

          pusherServer
            .trigger("admin-orders", "order-created", {
              id: newOrder.id,
              invoice,
              username: user.username,
              service_id: service.service_id,
              status: orderStatus,
            })
            .catch(() => {});

          pusherServer
            .trigger(`member-${user.uuid}`, "balance-updated", {
              balance: Number(currentBalance - priceSale),
            })
            .catch(() => {});
        } catch {}

        // Standard SMM v2 response
        return NextResponse.json({
          status: "success",
          order: newOrder.id,
        });
      }

      /**
       * ACTION: status
       * Returns status of single or multiple orders
       */
      case "status": {
        const singleOrderId = params.order;
        const multiOrderIds = params.orders;
        const userRegion = user.server_area || "SG";

        // Single order query
        if (
          singleOrderId !== undefined &&
          singleOrderId !== null &&
          String(singleOrderId).trim() !== ""
        ) {
          const cleanId = String(singleOrderId).trim();
          const order = await getOrderByIdForUser(user.uuid, cleanId, userRegion);

          if (!order) {
            return NextResponse.json({ error: "Incorrect order ID" });
          }

          return NextResponse.json({
            order: String(order.id),
            status: (order.status || "Pending").toLowerCase(),
            charge: Number(order.price_sale || 0).toFixed(4),
            start_count: String(order.start ?? 0),
            remains: String(order.remains ?? 0),
          });
        }

        // Multiple orders query
        if (
          multiOrderIds !== undefined &&
          multiOrderIds !== null &&
          String(multiOrderIds).trim() !== ""
        ) {
          const rawIds = String(multiOrderIds)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          if (rawIds.length === 0) {
            return NextResponse.json({ error: "Incorrect order ID" });
          }

          const foundMap = await getOrdersByIdsForUser(user.uuid, rawIds, userRegion);
          const multiResponse: Record<string, any> = {};

          for (const rawId of rawIds) {
            const found = foundMap.get(rawId);
            if (found) {
              multiResponse[rawId] = {
                charge: Number(found.price_sale || 0).toFixed(4),
                start_count: String(found.start ?? 0),
                status: found.status,
                remains: String(found.remains ?? 0),
              };
            } else {
              multiResponse[rawId] = {
                error: "Incorrect order ID",
              };
            }
          }

          return NextResponse.json(multiResponse);
        }

        return NextResponse.json(
          { error: "Incorrect request: 'order' or 'orders' parameter is required" },
          { status: 400 }
        );
      }

      /**
       * ACTION: balance
       * Returns user's current account balance
       */
      case "balance": {
        const freshUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { balance: true },
        });

        return NextResponse.json({
          balance: Number(freshUser?.balance || 0).toFixed(4),
          currency: "USD",
        });
      }

      /**
       * ACTION: set_callback
       * Sets default Webhook Callback URL for the user
       */
      case "set_callback": {
        const rawUrl = params.url || params.callback || params.callback_url;
        const cleanUrl = rawUrl && typeof rawUrl === "string" ? rawUrl.trim() : null;

        if (cleanUrl && !cleanUrl.startsWith("http")) {
          return NextResponse.json(
            { error: "Callback URL must start with http:// or https://" },
            { status: 400 }
          );
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { callback_url: cleanUrl },
        });

        return NextResponse.json({
          status: "success",
          message: cleanUrl ? "Default callback URL updated" : "Default callback URL removed",
          callback_url: cleanUrl,
        });
      }

      /**
       * ACTION: get_callback
       * Gets current default Webhook Callback URL for the user
       */
      case "get_callback": {
        const freshUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { callback_url: true },
        });

        return NextResponse.json({
          callback_url: freshUser?.callback_url || null,
        });
      }

      default: {
        return NextResponse.json(
          { error: `Incorrect request: unknown action '${action}'` },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("POST /api/v1 error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

