import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PaymentView from "./payment-view";
import {
  DEFAULT_SUPPORTED_COINS,
  generateQrDataUrl,
} from "@/lib/merchant-gateway";
import { Metadata } from "next";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const tx = await prisma.merchantTransaction.findUnique({
    where: { uuid },
    include: { merchant: true },
  });

  return {
    title: tx ? `Payment #${tx.orderId} - ${tx.merchant.name}` : "Secure Crypto Checkout",
    description: "Complete your cryptocurrency payment securely and directly.",
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  const tx = await prisma.merchantTransaction.findUnique({
    where: { uuid },
    include: {
      merchant: true,
      website: true,
    },
  });

  if (!tx) {
    notFound();
  }

  // Get site settings
  const siteSetting = await prisma.setting.findFirst();
  const siteName = siteSetting?.site_name || "Payment Gateway";
  const logo = siteSetting?.logo || "/logo/logo.png";

  // Filter supported coins according to merchant configuration (Requirement A.8)
  const allowed = (tx.merchant.allowedCoins as string[]) || [];
  const supportedCoins = DEFAULT_SUPPORTED_COINS.filter((c) => {
    if (!allowed || allowed.length === 0) return true;
    return (
      allowed.includes(c.symbol) ||
      allowed.includes(`${c.symbol}_${c.network}`) ||
      allowed.includes(`${c.symbol}_${c.network.toUpperCase()}`)
    );
  });

  // Pre-generate QR code if address already exists
  let initialQrCode = "";
  if (tx.payAddress) {
    initialQrCode = await generateQrDataUrl(tx.payAddress);
  }

  return (
    <PaymentView
      initialTx={{
        uuid: tx.uuid,
        orderId: tx.orderId,
        amountUsd: Number(tx.amountUsd),
        description: tx.description,
        paymentStatus: tx.paymentStatus,
        cryptoCurrency: tx.cryptoCurrency,
        cryptoNetwork: tx.cryptoNetwork,
        cryptoAmount: tx.cryptoAmount ? Number(tx.cryptoAmount) : null,
        payAddress: tx.payAddress,
        expiresAt: tx.expiresAt ? tx.expiresAt.toISOString() : null,
        returnUrl: tx.returnUrl || tx.website?.returnUrl || null,
        merchantName: tx.merchant.name,
      }}
      supportedCoins={supportedCoins.length > 0 ? supportedCoins : DEFAULT_SUPPORTED_COINS}
      initialQrCode={initialQrCode}
      siteName={siteName}
      logo={logo}
    />
  );
}
