import crypto from "crypto";

export interface CryptomusCreatePaymentParams {
  amount: number | string;
  currency?: string;
  orderId: string;
  merchantId: string;
  paymentKey: string;
  urlCallback: string;
  urlReturn: string;
  isTestMode?: boolean;
}

export interface CryptomusCreatePaymentResult {
  success: boolean;
  orderId: string;
  invoiceUrl: string;
  amount: number;
  currency: string;
  status: string;
  rawResponse?: any;
  error?: string;
}

/**
 * Generate MD5 Cryptomus signature:
 * MD5( base64_encode( json_encode(data) ) + payment_key )
 */
export function generateCryptomusSignature(data: Record<string, any>, paymentKey: string): string {
  const jsonStr = JSON.stringify(data);
  const base64Str = Buffer.from(jsonStr).toString("base64");
  return crypto.createHash("md5").update(base64Str + paymentKey).digest("hex");
}

/**
 * Verify incoming webhook signature from Cryptomus:
 * Takes the raw payload object, extracts 'sign', computes MD5 on the remaining fields, and compares.
 */
export function verifyCryptomusWebhookSignature(
  body: Record<string, any>,
  paymentKey: string
): boolean {
  if (!body || !body.sign || !paymentKey) {
    return false;
  }

  const { sign, ...dataWithoutSign } = body;
  const calculatedSign = generateCryptomusSignature(dataWithoutSign, paymentKey);
  return calculatedSign.toLowerCase() === String(sign).toLowerCase();
}

/**
 * Call Cryptomus API to create a payment invoice:
 * POST https://api.cryptomus.com/v1/payment
 */
export async function createCryptomusInvoice({
  amount,
  currency = "USD",
  orderId,
  merchantId,
  paymentKey,
  urlCallback,
  urlReturn,
  isTestMode = false,
}: CryptomusCreatePaymentParams): Promise<CryptomusCreatePaymentResult> {
  const formattedAmount = Number(amount).toFixed(2);

  const payload: Record<string, any> = {
    amount: formattedAmount,
    currency: currency.toUpperCase(),
    order_id: orderId,
    url_callback: urlCallback,
    url_return: urlReturn,
    is_payment_multiple: false,
    lifetime: 3600, // 1 hour expiration
  };

  if (isTestMode) {
    payload.is_test = true;
  }

  const sign = generateCryptomusSignature(payload, paymentKey);

  const response = await fetch("https://api.cryptomus.com/v1/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant: merchantId,
      sign: sign,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.state !== 0 || !json.result?.url) {
    const errorMsg =
      json?.message ||
      json?.errors?.[0]?.message ||
      `Cryptomus API error (HTTP ${response.status})`;
    return {
      success: false,
      orderId,
      invoiceUrl: "",
      amount: Number(formattedAmount),
      currency: currency.toUpperCase(),
      status: "failed",
      rawResponse: json,
      error: errorMsg,
    };
  }

  return {
    success: true,
    orderId,
    invoiceUrl: json.result.url,
    amount: Number(json.result.amount || formattedAmount),
    currency: json.result.currency || currency.toUpperCase(),
    status: json.result.payment_status || "check",
    rawResponse: json,
  };
}

