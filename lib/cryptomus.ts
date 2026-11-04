import crypto from "crypto";

export interface CryptomusCreatePaymentParams {
  amount: number | string;
  currency?: string;
  to_currency?: string;
  network?: string;
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
  address?: string | null;
  network?: string | null;
  cryptoAmount?: string | number | null;
  cryptoCurrency?: string | null;
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
 * Handles both standard JSON and PHP json_encode (which escapes slashes \/ by default).
 */
export function verifyCryptomusWebhookSignature(
  body: Record<string, any>,
  paymentKey: string
): boolean {
  if (!body || !body.sign || !paymentKey) {
    return false;
  }

  const { sign, ...dataWithoutSign } = body;
  const receivedSign = String(sign).toLowerCase();

  // Try 1: Standard JSON stringify
  const jsonStandard = JSON.stringify(dataWithoutSign);
  const hashStandard = crypto
    .createHash("md5")
    .update(Buffer.from(jsonStandard).toString("base64") + paymentKey)
    .digest("hex")
    .toLowerCase();

  if (hashStandard === receivedSign) {
    return true;
  }

  // Try 2: PHP json_encode style with escaped slashes (\/)
  const jsonEscapedSlashes = jsonStandard.replace(/\//g, "\\/");
  const hashEscaped = crypto
    .createHash("md5")
    .update(Buffer.from(jsonEscapedSlashes).toString("base64") + paymentKey)
    .digest("hex")
    .toLowerCase();

  if (hashEscaped === receivedSign) {
    return true;
  }

  return false;
}

/**
 * Call Cryptomus API to create a payment invoice:
 * POST https://api.cryptomus.com/v1/payment
 */
export async function createCryptomusInvoice({
  amount,
  currency = "USD",
  to_currency,
  network,
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

  if (to_currency) {
    payload.to_currency = to_currency.toUpperCase();
  }
  if (network) {
    payload.network = network;
  }

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

  // Extract address and network if returned directly by Cryptomus
  const address = json.result?.address || null;
  const returnedNetwork = json.result?.network || network || null;
  const payerAmount = json.result?.payer_amount || null;
  const payerCurrency = json.result?.payer_currency || to_currency || null;

  return {
    success: true,
    orderId,
    invoiceUrl: json.result.url,
    amount: Number(json.result.amount || formattedAmount),
    currency: json.result.currency || currency.toUpperCase(),
    status: json.result.payment_status || "check",
    address,
    network: returnedNetwork,
    cryptoAmount: payerAmount,
    cryptoCurrency: payerCurrency,
    rawResponse: json,
  };
}

/**
 * Call Cryptomus API to get payment details / status:
 * POST https://api.cryptomus.com/v1/payment/info
 */
export async function getCryptomusPaymentInfo({
  orderId,
  merchantId,
  paymentKey,
}: {
  orderId: string;
  merchantId: string;
  paymentKey: string;
}): Promise<{
  success: boolean;
  status?: string;
  isFinal?: boolean;
  txid?: string;
  amount?: number;
  cryptoAmount?: number;
  paymentAmountUsd?: number;
  raw?: any;
  error?: string;
}> {
  try {
    const payload = { order_id: orderId };
    const sign = generateCryptomusSignature(payload, paymentKey);

    const response = await fetch("https://api.cryptomus.com/v1/payment/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: merchantId,
        sign,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok || !json || json.state !== 0 || !json.result) {
      return {
        success: false,
        error: json?.message || `Cryptomus info error (${response.status})`,
      };
    }

    // payment_amount_usd: USD equivalent calculated by Cryptomus
    // amount: original invoice amount in invoice currency (USD)
    // payment_amount: raw coin amount transferred on blockchain (e.g. 0.000105 BTC)
    const fiatAmount = json.result.payment_amount_usd
      ? parseFloat(json.result.payment_amount_usd)
      : json.result.amount
      ? parseFloat(json.result.amount)
      : undefined;

    return {
      success: true,
      status: json.result.payment_status || json.result.status,
      isFinal: Boolean(json.result.is_final),
      txid: json.result.txid,
      amount: fiatAmount,
      cryptoAmount: json.result.payment_amount ? parseFloat(json.result.payment_amount) : undefined,
      paymentAmountUsd: json.result.payment_amount_usd ? parseFloat(json.result.payment_amount_usd) : undefined,
      raw: json.result,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Connection timeout" };
  }
}


