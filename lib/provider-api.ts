/**
 * SMM Provider API Client based on DOC-API.md specification
 * 
 * Supports:
 * - action: 'add' (Order placement)
 * - action: 'status' (Order status check)
 * - action: 'balance' (Provider balance check)
 * - Automatic fallback between multipart/form-data and application/x-www-form-urlencoded
 */

export interface CreateOrderParams {
  url: string;
  apiKey: string;
  serviceId: string | number;
  target: string;
  quantity: number;
  customComments?: string;
  runs?: number;
  interval?: number;
}

export interface ProviderOrderResult {
  success: boolean;
  orderId?: string | number;
  error?: string;
  rawResponse?: any;
}

export async function submitOrderToProvider(
  params: CreateOrderParams
): Promise<ProviderOrderResult> {
  const { url, apiKey, serviceId, target, quantity, customComments, runs, interval } = params;

  if (!url || !apiKey) {
    return {
      success: false,
      error: "URL Provider atau API Key tidak terkonfigurasi.",
    };
  }

  const cleanUrl = url.trim();
  const cleanKey = apiKey.trim();

  // Try multipart/form-data first (DOC-API.md specification)
  const formData = new FormData();
  formData.append("key", cleanKey);
  formData.append("action", "add");
  formData.append("service", String(serviceId));
  formData.append("link", target.trim());
  formData.append("quantity", String(quantity));

  if (customComments) {
    formData.append("comments", customComments);
  }
  if (runs !== undefined) {
    formData.append("runs", String(runs));
  }
  if (interval !== undefined) {
    formData.append("interval", String(interval));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  let response: Response | null = null;
  let errorMsg = "";

  try {
    response = await fetch(cleanUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: {
        "User-Agent": "Master-SMM-Engine/1.0",
      },
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Fallback to application/x-www-form-urlencoded if multipart was rejected by server
    try {
      const urlParams = new URLSearchParams();
      urlParams.append("key", cleanKey);
      urlParams.append("action", "add");
      urlParams.append("service", String(serviceId));
      urlParams.append("link", target.trim());
      urlParams.append("quantity", String(quantity));

      if (customComments) urlParams.append("comments", customComments);
      if (runs !== undefined) urlParams.append("runs", String(runs));
      if (interval !== undefined) urlParams.append("interval", String(interval));

      response = await fetch(cleanUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Master-SMM-Engine/1.0",
        },
        body: urlParams.toString(),
      });
    } catch (fallbackErr: any) {
      errorMsg = err?.message || fallbackErr?.message || "Koneksi ke server provider terputus";
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response) {
    return {
      success: false,
      error: errorMsg || "Gagal menghubungi server provider.",
    };
  }

  const text = await response.text();
  let json: any = null;

  try {
    json = JSON.parse(text);
  } catch {
    return {
      success: false,
      error: `Respon provider bukan JSON valid (HTTP ${response.status}): ${text.substring(0, 150)}`,
      rawResponse: text,
    };
  }

  // Parse result according to DOC-API.md:
  // e.g.: { "status": "success", "order": 32 } or { "order": 32 } or { "error": "..." }
  if (json.error) {
    const msg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
    return {
      success: false,
      error: msg,
      rawResponse: json,
    };
  }

  const orderId = json.order || json.order_id || json.id;

  if (orderId !== undefined && orderId !== null) {
    return {
      success: true,
      orderId,
      rawResponse: json,
    };
  }

  // If status is success but no explicit orderId returned
  if (json.status === "success" || json.status === true) {
    return {
      success: true,
      orderId: orderId ?? "OK",
      rawResponse: json,
    };
  }

  return {
    success: false,
    error: json.message || json.msg || "Respon provider tidak mengandung order ID.",
    rawResponse: json,
  };
}

export interface CheckOrderStatusParams {
  url: string;
  apiKey: string;
  orderId: string | number;
}

export interface ProviderOrderStatusResult {
  success: boolean;
  status?: string;
  charge?: number | string;
  startCount?: number;
  remains?: number;
  currency?: string;
  error?: string;
  rawResponse?: any;
}

/**
 * Checks single or multi-order status from SMM Provider API.
 * Uses FormData (multipart/form-data) with fallback to application/x-www-form-urlencoded.
 * Sends key, action (status/add), order, and orders ($order_id) as per provider specification.
 */
export async function checkOrderStatusFromProvider(
  params: CheckOrderStatusParams
): Promise<ProviderOrderStatusResult> {
  const { url, apiKey, orderId } = params;

  if (!url || !apiKey || orderId === undefined || orderId === null || String(orderId).trim() === "") {
    return {
      success: false,
      error: "URL Provider, API Key, atau Order ID belum lengkap.",
    };
  }

  const cleanUrl = url.trim();
  const cleanKey = apiKey.trim();
  const cleanOrderId = String(orderId).trim();

  // Helper to make request with a given action name
  async function makeRequest(actionName: string) {
    // 1. Try FormData (multipart/form-data)
    try {
      const formData = new FormData();
      formData.append("key", cleanKey);
      formData.append("action", actionName);
      formData.append("order", cleanOrderId);
      formData.append("orders", cleanOrderId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(cleanUrl, {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            "User-Agent": "Master-SMM-Engine/1.0",
          },
        });
        clearTimeout(timeoutId);
        const text = await response.text();
        return { ok: response.ok, status: response.status, text };
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }
    } catch {
      // 2. Fallback to application/x-www-form-urlencoded
      const urlParams = new URLSearchParams();
      urlParams.append("key", cleanKey);
      urlParams.append("action", actionName);
      urlParams.append("order", cleanOrderId);
      urlParams.append("orders", cleanOrderId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(cleanUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Master-SMM-Engine/1.0",
          },
          body: urlParams.toString(),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const text = await response.text();
        return { ok: response.ok, status: response.status, text };
      } catch (fallbackErr: any) {
        clearTimeout(timeoutId);
        return { ok: false, status: 0, text: "", error: fallbackErr?.message || "Koneksi terputus" };
      }
    }
  }

  // 1. Try with standard SMM action: 'status'
  let rawResult = await makeRequest("status");

  let json: any = null;
  if (rawResult?.text) {
    try {
      json = JSON.parse(rawResult.text);
    } catch {
      // Not JSON
    }
  }

  // 2. If provider returns error indicating unknown action, fallback to action: 'add'
  if (
    !json ||
    (json.error &&
      typeof json.error === "string" &&
      (json.error.toLowerCase().includes("action") || json.error.toLowerCase().includes("unknown")))
  ) {
    const fallbackResult = await makeRequest("add");
    if (fallbackResult?.text) {
      try {
        const fallbackJson = JSON.parse(fallbackResult.text);
        if (fallbackJson && !fallbackJson.error) {
          json = fallbackJson;
        }
      } catch {
        // ignore
      }
    }
  }

  if (!json) {
    return {
      success: false,
      error: `Respon provider bukan JSON yang valid (HTTP ${rawResult?.status || 0}): ${
        rawResult?.text?.substring(0, 150) || rawResult?.error || "Tidak ada respon dari server"
      }`,
      rawResponse: rawResult?.text,
    };
  }

  // Handle direct provider error
  if (json.error) {
    const msg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
    return {
      success: false,
      error: msg,
      rawResponse: json,
    };
  }

  // Extract order status object:
  // Can be { "32": { status: "Completed", ... } } or { status: "Completed", remains: "0", ... }
  let parsedItem: any = null;
  if (json[cleanOrderId] && typeof json[cleanOrderId] === "object") {
    parsedItem = json[cleanOrderId];
  } else if (json.status !== undefined || json.remains !== undefined) {
    parsedItem = json;
  } else if (Array.isArray(json) && json.length > 0) {
    parsedItem =
      json.find((i: any) => String(i.order || i.order_id || i.id) === cleanOrderId) || json[0];
  } else if (typeof json === "object" && json !== null) {
    const values = Object.values(json);
    if (values.length > 0 && typeof values[0] === "object" && values[0] !== null) {
      parsedItem = values[0];
    }
  }

  if (!parsedItem) {
    return {
      success: false,
      error: json.message || json.msg || "Respon provider tidak memuat data status pesanan.",
      rawResponse: json,
    };
  }

  if (parsedItem.error) {
    return {
      success: false,
      error:
        typeof parsedItem.error === "string"
          ? parsedItem.error
          : JSON.stringify(parsedItem.error),
      rawResponse: json,
    };
  }

  const rawStatus = String(parsedItem.status || "").trim();
  const rawRemains = parsedItem.remains !== undefined ? Number(parsedItem.remains) : 0;
  const rawStart =
    parsedItem.start_count !== undefined
      ? Number(parsedItem.start_count)
      : parsedItem.start !== undefined
      ? Number(parsedItem.start)
      : 0;

  return {
    success: true,
    status: rawStatus || "Pending",
    remains: isNaN(rawRemains) ? 0 : rawRemains,
    startCount: isNaN(rawStart) ? 0 : rawStart,
    charge: parsedItem.charge,
    currency: parsedItem.currency || "USD",
    rawResponse: json,
  };
}

/**
 * Normalizes various provider status strings to the standard Master SMM statuses
 */
export function normalizeOrderStatus(statusStr: string): string {
  const s = (statusStr || "").toLowerCase().trim().replace(/[-_]/g, " ");
  if (s.includes("complete") || s === "done" || s === "success" || s === "sukses") {
    return "Completed";
  }
  if (
    s.includes("cancel") ||
    s.includes("batal") ||
    s.includes("refund") ||
    s.includes("fail") ||
    s.includes("gagal") ||
    s === "rejected"
  ) {
    return "Canceled";
  }
  if (s.includes("partial")) {
    return "Partial";
  }
  if (s.includes("progress")) {
    return "In progress";
  }
  if (s.includes("process")) {
    return "Processing";
  }
  if (s.includes("pend") || s.includes("wait") || s.includes("queue") || s.includes("tunggu")) {
    return "Pending";
  }
  return statusStr || "Pending";
}

export interface RefundCalculation {
  shouldRefund: boolean;
  refundAmount: number;     // Saldo yang ditambahkan ke balance user saat ini
  alreadyRefunded: number;  // Saldo yang sudah pernah di-refund sebelumnya pada order ini
  totalRefundDue: number;   // Total kumulatif refund untuk order ini
  usedAmount: number;       // Saldo yang terpakai untuk bagian pesanan yang sukses/selesai
  completedQuantity: number;
  remainsQuantity: number;
  reason: string;
}

/**
 * Calculates user balance refund when order status changes to Canceled/Failed or Partial.
 * - Canceled/Failed: 100% refund of price_sale (minus any previously refunded amount)
 * - Partial: Proportionate refund for uncompleted quantity (remains / totalAmount * price_sale)
 * - Tracks cumulative refund_amount to prevent duplicate refunds.
 */
export function calculateOrderRefund(
  order: {
    amount: number;
    price_sale: number;
    refund_amount?: number;
    status?: string;
  },
  newStatus: string,
  newRemains?: number
): RefundCalculation {
  const priceSale = Number(order.price_sale || 0);
  const totalAmount = Number(order.amount || 0);
  const alreadyRefunded = Number(order.refund_amount || 0);
  const normStatus = normalizeOrderStatus(newStatus);

  if (priceSale <= 0 || totalAmount <= 0) {
    return {
      shouldRefund: false,
      refundAmount: 0,
      alreadyRefunded,
      totalRefundDue: 0,
      usedAmount: 0,
      completedQuantity: 0,
      remainsQuantity: 0,
      reason: "Harga atau jumlah pesanan 0.",
    };
  }

  // 1. CANCELED / GAGAL
  if (normStatus === "Canceled") {
    const totalRefundDue = priceSale;
    const refundToGive = Math.max(0, Number((totalRefundDue - alreadyRefunded).toFixed(4)));
    return {
      shouldRefund: refundToGive > 0,
      refundAmount: refundToGive,
      alreadyRefunded,
      totalRefundDue,
      usedAmount: 0,
      completedQuantity: 0,
      remainsQuantity: totalAmount,
      reason: `Pesanan dibatalkan/gagal. Refund penuh: $${refundToGive.toFixed(4)}.`,
    };
  }

  // 2. PARTIAL
  if (normStatus === "Partial") {
    const remains =
      typeof newRemains === "number" && !isNaN(newRemains) ? Math.max(0, newRemains) : 0;
    const cappedRemains = Math.min(totalAmount, remains);
    const completed = Math.max(0, totalAmount - cappedRemains);

    // Saldo terpakai sesuai jumlah yang dikerjakan: (completed / totalAmount) * priceSale
    const usedAmount = Number(((completed / totalAmount) * priceSale).toFixed(4));
    // Saldo yang dikembalikan sesuai sisa yang belum dikerjakan: (remains / totalAmount) * priceSale
    const totalRefundDue = Number(((cappedRemains / totalAmount) * priceSale).toFixed(4));
    const refundToGive = Math.max(0, Number((totalRefundDue - alreadyRefunded).toFixed(4)));

    return {
      shouldRefund: refundToGive > 0,
      refundAmount: refundToGive,
      alreadyRefunded,
      totalRefundDue,
      usedAmount,
      completedQuantity: completed,
      remainsQuantity: cappedRemains,
      reason: `Pesanan partial (${completed.toLocaleString()}/${totalAmount.toLocaleString()} selesai). Saldo terpakai $${usedAmount.toFixed(4)}, refund sisa: $${refundToGive.toFixed(4)}.`,
    };
  }

  // 3. COMPLETED / PROCESSING / PENDING / DLL
  return {
    shouldRefund: false,
    refundAmount: 0,
    alreadyRefunded,
    totalRefundDue: alreadyRefunded,
    usedAmount: priceSale,
    completedQuantity: totalAmount,
    remainsQuantity: 0,
    reason: `Status ${normStatus}, tidak ada pengembalian dana.`,
  };
}


