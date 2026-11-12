import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import QRCode from "qrcode";

export interface SupportedCoin {
  symbol: string;
  network: string;
  name: string;
  iconName: string;
  isPopular?: boolean;
}

export const DEFAULT_SUPPORTED_COINS: SupportedCoin[] = [
  { symbol: "USDT", network: "tron", name: "USDT (TRC20)", iconName: "Coins", isPopular: true },
  { symbol: "USDT", network: "bsc", name: "USDT (BEP20)", iconName: "Coins", isPopular: true },
  { symbol: "USDT", network: "polygon", name: "USDT (Polygon)", iconName: "Coins" },
  { symbol: "USDC", network: "tron", name: "USDC (TRC20)", iconName: "Coins" },
  { symbol: "USDC", network: "polygon", name: "USDC (Polygon)", iconName: "Coins" },
  { symbol: "BTC", network: "btc", name: "Bitcoin (BTC)", iconName: "Bitcoin", isPopular: true },
  { symbol: "ETH", network: "eth", name: "Ethereum (ETH)", iconName: "Coins", isPopular: true },
  { symbol: "TRX", network: "tron", name: "TRON (TRX)", iconName: "Zap", isPopular: true },
  { symbol: "SOL", network: "sol", name: "Solana (SOL)", iconName: "Zap", isPopular: true },
  { symbol: "TON", network: "ton", name: "Toncoin (TON)", iconName: "Coins", isPopular: true },
  { symbol: "LTC", network: "ltc", name: "Litecoin (LTC)", iconName: "Coins" },
  { symbol: "BNB", network: "bsc", name: "BNB (BSC)", iconName: "Coins" },
];

/**
 * Get or initialize Merchant Gateway Settings
 */
export async function getMerchantGatewaySettings() {
  let settings = await prisma.merchantGatewaySetting.findFirst();
  if (!settings) {
    settings = await prisma.merchantGatewaySetting.create({
      data: {
        adminFeePercent: 1.0,
        adminFeeFixed: 0.1,
        minWithdrawal: 10.0,
        maxWithdrawal: 50000.0,
        autoWithdrawalEnabled: true,
        allowedCoins: DEFAULT_SUPPORTED_COINS.map((c) => `${c.symbol}_${c.network}`),
      },
    });
  }
  return settings;
}

/**
 * Retrieve Cryptomus credentials from CryptomusSetting or environment
 */
export async function getCryptomusCredentials() {
  const cryptomusSetting = await prisma.cryptomusSetting.findFirst({
    where: { is_active: true },
  });

  const merchantId = cryptomusSetting?.merchant_id || process.env.CRYPTOMUS_MERCHANT_ID || "";
  const paymentKey = cryptomusSetting?.payment_key || process.env.CRYPTOMUS_PAYMENT_KEY || "";
  const payoutKey = cryptomusSetting?.payout_key || process.env.CRYPTOMUS_PAYOUT_KEY || "";
  const isTestMode = cryptomusSetting?.is_test_mode ?? (process.env.CRYPTOMUS_TEST_MODE === "true");

  return {
    merchantId,
    paymentKey,
    payoutKey,
    isTestMode,
    configured: Boolean(merchantId && paymentKey),
    payoutConfigured: Boolean(merchantId && payoutKey),
  };
}

/**
 * Generate MD5 Cryptomus signature
 */
export function generateCryptomusSignature(data: Record<string, any>, apiKey: string): string {
  const jsonStr = JSON.stringify(data);
  const base64Str = Buffer.from(jsonStr).toString("base64");
  return crypto.createHash("md5").update(base64Str + apiKey).digest("hex");
}

/**
 * Verify webhook signature from Cryptomus
 */
export function verifyCryptomusSignature(body: Record<string, any>, apiKey: string): boolean {
  if (!body || !body.sign || !apiKey) return false;
  const { sign, ...dataWithoutSign } = body;
  const receivedSign = String(sign).toLowerCase();

  // Try standard JSON
  const jsonStandard = JSON.stringify(dataWithoutSign);
  const hashStandard = crypto
    .createHash("md5")
    .update(Buffer.from(jsonStandard).toString("base64") + apiKey)
    .digest("hex")
    .toLowerCase();

  if (hashStandard === receivedSign) return true;

  // Try escaped slashes (PHP style)
  const jsonEscaped = jsonStandard.replace(/\//g, "\\/");
  const hashEscaped = crypto
    .createHash("md5")
    .update(Buffer.from(jsonEscaped).toString("base64") + apiKey)
    .digest("hex")
    .toLowerCase();

  return hashEscaped === receivedSign;
}

/**
 * Ensure user has a MerchantWallet record
 */
export async function getOrCreateMerchantWallet(userId: number) {
  let wallet = await prisma.merchantWallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.merchantWallet.create({
      data: {
        userId,
        balance: 0,
        lockedBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        currency: "USD",
      },
    });
  }

  return wallet;
}

/**
 * Calculate Admin Fee and Merchant Net Amount
 */
export function calculateMerchantFees(amountUsd: number, feePercent: number, feeFixed: number) {
  const percentFee = (amountUsd * feePercent) / 100;
  const totalFee = Math.round((percentFee + feeFixed) * 100) / 100;
  const netAmount = Math.max(0, Math.round((amountUsd - totalFee) * 100) / 100);

  return {
    adminFee: totalFee,
    netAmountUsd: netAmount,
  };
}

/**
 * Call Cryptomus API to create a direct payment address (White-Label)
 */
export async function createCryptomusDirectPayment({
  amountUsd,
  orderId,
  cryptoCurrency,
  cryptoNetwork,
  callbackUrl,
  returnUrl,
}: {
  amountUsd: number;
  orderId: string;
  cryptoCurrency: string;
  cryptoNetwork: string;
  callbackUrl: string;
  returnUrl?: string;
}) {
  const creds = await getCryptomusCredentials();
  if (!creds.configured) {
    throw new Error("Cryptomus gateway credentials are not configured in system settings.");
  }

  const payload: Record<string, any> = {
    amount: Number(amountUsd).toFixed(2),
    currency: "USD",
    to_currency: cryptoCurrency.toUpperCase(),
    network: cryptoNetwork.toLowerCase(),
    order_id: orderId,
    url_callback: callbackUrl,
    url_return: returnUrl || callbackUrl,
    is_payment_multiple: false,
    lifetime: 3600, // 60 minutes
  };

  if (creds.isTestMode) {
    payload.is_test = true;
  }

  const sign = generateCryptomusSignature(payload, creds.paymentKey);

  const res = await fetch("https://api.cryptomus.com/v1/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant: creds.merchantId,
      sign,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.state !== 0 || !data.result) {
    const errMsg = data?.message || data?.errors?.[0]?.message || `Cryptomus HTTP Error (${res.status})`;
    throw new Error(errMsg);
  }

  const result = data.result;

  return {
    cryptomusOrderId: result.order_id || orderId,
    cryptomusUuid: result.uuid,
    payAddress: result.address || null,
    cryptoAmount: result.payer_amount ? parseFloat(result.payer_amount) : null,
    cryptoCurrency: result.payer_currency || cryptoCurrency.toUpperCase(),
    cryptoNetwork: result.network || cryptoNetwork.toLowerCase(),
    raw: result,
  };
}

/**
 * Generate QR code data URL (server-side)
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    return "";
  }
}

/**
 * Dispatch signed webhook notification to Merchant's website
 */
export async function dispatchMerchantWebhook(transactionId: number) {
  const tx = await prisma.merchantTransaction.findUnique({
    where: { id: transactionId },
    include: {
      website: true,
      merchant: true,
    },
  });

  if (!tx) return;

  const targetUrl = tx.callbackUrl || tx.website?.webhookUrl;
  if (!targetUrl) return;

  const secretKey = tx.website?.secretKey || "mch_default_secret";

  const payload = {
    event: "payment.completed",
    timestamp: Date.now(),
    data: {
      invoice_id: tx.uuid,
      order_id: tx.orderId,
      merchant_id: tx.merchant.uuid,
      amount_usd: Number(tx.amountUsd),
      net_amount_usd: Number(tx.netAmountUsd),
      admin_fee: Number(tx.adminFee),
      crypto_currency: tx.cryptoCurrency,
      crypto_network: tx.cryptoNetwork,
      crypto_amount: tx.cryptoAmount ? Number(tx.cryptoAmount) : null,
      pay_address: tx.payAddress,
      txid: tx.txid,
      status: tx.paymentStatus,
      paid_at: tx.paidAt ? tx.paidAt.toISOString() : null,
    },
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payloadString)
    .digest("hex");

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
        "x-merchant-id": tx.merchant.uuid,
        "User-Agent": "MasterSMM-PaymentGateway/1.0",
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000),
    });

    const respText = await res.text().catch(() => "");

    await prisma.merchantTransaction.update({
      where: { id: tx.id },
      data: {
        merchantWebhookStatus: res.ok ? "SENT" : "FAILED",
        merchantWebhookAttempts: { increment: 1 },
        merchantWebhookResponse: `[HTTP ${res.status}] ${respText.substring(0, 500)}`,
      },
    });
  } catch (err: any) {
    await prisma.merchantTransaction.update({
      where: { id: tx.id },
      data: {
        merchantWebhookStatus: "FAILED",
        merchantWebhookAttempts: { increment: 1 },
        merchantWebhookResponse: `[Error] ${err?.message || "Connection timeout"}`,
      },
    });
  }
}

/**
 * Execute or trigger Auto-Withdrawal if criteria met
 */
export async function checkAndTriggerAutoWithdraw(userId: number) {
  const settings = await getMerchantGatewaySettings();
  if (!settings.autoWithdrawalEnabled) return;

  const userSetting = await prisma.merchantWithdrawalSetting.findUnique({
    where: { userId },
  });

  if (!userSetting || !userSetting.autoWithdraw || !userSetting.address) {
    return;
  }

  const wallet = await getOrCreateMerchantWallet(userId);
  const availableBalance = Number(wallet.balance);

  const threshold = Math.max(Number(userSetting.threshold), Number(settings.minWithdrawal));

  if (availableBalance < threshold) {
    return;
  }

  // Execute withdrawal
  await executeMerchantPayout({
    userId,
    amountUsd: availableBalance,
    coin: userSetting.coin,
    network: userSetting.network,
    address: userSetting.address,
    isAuto: true,
  });
}

/**
 * Execute Crypto Payout through Cryptomus Payout API
 */
export async function executeMerchantPayout({
  userId,
  merchantId,
  amountUsd,
  coin,
  network,
  address,
  isAuto = false,
}: {
  userId: number;
  merchantId?: number;
  amountUsd: number;
  coin: string;
  network: string;
  address: string;
  isAuto?: boolean;
}) {
  const creds = await getCryptomusCredentials();
  const settings = await getMerchantGatewaySettings();

  if (amountUsd < Number(settings.minWithdrawal)) {
    throw new Error(`Minimum withdrawal amount is $${Number(settings.minWithdrawal).toFixed(2)} USD`);
  }

  if (amountUsd > Number(settings.maxWithdrawal)) {
    throw new Error(`Maximum withdrawal amount is $${Number(settings.maxWithdrawal).toFixed(2)} USD`);
  }

  const wallet = await getOrCreateMerchantWallet(userId);
  if (Number(wallet.balance) < amountUsd) {
    throw new Error("Insufficient merchant balance for this withdrawal.");
  }

  // Calculate fees if any
  const feeAdmin = 0; // Or admin fee for payouts if configured
  const netAmountUsd = amountUsd - feeAdmin;

  // Deduct from available balance, add to locked balance
  await prisma.merchantWallet.update({
    where: { userId },
    data: {
      balance: { decrement: amountUsd },
      lockedBalance: { increment: amountUsd },
    },
  });

  // Create withdrawal record
  const withdrawal = await prisma.merchantWithdrawal.create({
    data: {
      userId,
      merchantId: merchantId || null,
      amountUsd,
      feeAdmin,
      netAmountUsd,
      coin: coin.toUpperCase(),
      network: network.toLowerCase(),
      address,
      status: "PROCESSING",
      isAuto,
    },
  });

  // If Cryptomus payout credentials are not configured, keep as PROCESSING for manual admin approval
  if (!creds.payoutConfigured) {
    return {
      success: true,
      withdrawalId: withdrawal.uuid,
      status: "PROCESSING",
      message: "Withdrawal request submitted successfully and awaiting admin approval.",
    };
  }

  try {
    const payoutPayload: Record<string, any> = {
      amount: netAmountUsd.toFixed(2),
      currency: "USD",
      to_currency: coin.toUpperCase(),
      network: network.toLowerCase(),
      order_id: withdrawal.uuid,
      address: address,
      is_subtract: 1, // Deduct commission from amount
      url_callback: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/gateway/cryptomus/payout-webhook`,
    };

    const sign = generateCryptomusSignature(payoutPayload, creds.payoutKey);

    const res = await fetch("https://api.cryptomus.com/v1/payout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: creds.merchantId,
        sign,
      },
      body: JSON.stringify(payoutPayload),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.state === 0 && data.result) {
      const payoutResult = data.result;
      const isCompleted = payoutResult.status === "paid" || payoutResult.status === "completed";

      await prisma.merchantWithdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: isCompleted ? "COMPLETED" : "PROCESSING",
          cryptomusPayoutId: payoutResult.uuid || null,
          txid: payoutResult.txid || null,
          processedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted) {
        await prisma.merchantWallet.update({
          where: { userId },
          data: {
            lockedBalance: { decrement: amountUsd },
            totalWithdrawn: { increment: amountUsd },
          },
        });
      }

      return {
        success: true,
        withdrawalId: withdrawal.uuid,
        status: isCompleted ? "COMPLETED" : "PROCESSING",
        txid: payoutResult.txid || null,
      };
    } else {
      const errMsg = data?.message || data?.errors?.[0]?.message || "Failed to reach payout gateway";
      // Revert wallet balance
      await prisma.merchantWallet.update({
        where: { userId },
        data: {
          balance: { increment: amountUsd },
          lockedBalance: { decrement: amountUsd },
        },
      });

      await prisma.merchantWithdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "FAILED",
          errorMessage: errMsg,
        },
      });

      throw new Error(errMsg);
    }
  } catch (err: any) {
    // If connection failed, keep as PROCESSING for admin to review or retry
    await prisma.merchantWithdrawal.update({
      where: { id: withdrawal.id },
      data: {
        errorMessage: err?.message || "Unknown error during payout execution",
      },
    });

    return {
      success: true,
      withdrawalId: withdrawal.uuid,
      status: "PROCESSING",
      message: "Withdrawal is currently queued for processing.",
    };
  }
}

