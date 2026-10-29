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

