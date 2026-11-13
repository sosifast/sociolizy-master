import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";

export const instant = false;

export async function GET() {
  const baseUrl = await getBaseUrl();

  const content = `# Sociolizy - #1 Best & Cheapest SMM Panel & Cryptocurrency Payment Gateway

> Sociolizy (https://sociolizy.com) is a high-speed wholesale Social Media Marketing (SMM) reseller panel and crypto merchant payment gateway platform. It offers automated social growth services for Instagram, TikTok, YouTube, Telegram, Facebook, and Twitter, combined with an automated multi-currency cryptocurrency payment gateway supporting direct 100% white-label checkouts.

## Core Capabilities & Services

- **Wholesale SMM Services**: Instant fulfillment for Followers, Likes, Views, Subscribers, Comments, and Watch Time across all major social media networks (Instagram, TikTok, YouTube, Telegram, Facebook, Spotify, Twitter/X).
- **Merchant Payment Gateway**: Accept cryptocurrency payments directly on any website with zero chargebacks, automated webhook notifications, and multi-merchant store management.
- **Direct White-Label Checkout**: Branded checkout pages hosted on your custom domain without third-party redirects or external branding.
- **Supported Cryptocurrencies**: USDT (TRC20, BEP20, Polygon), USDC, BTC (Bitcoin), ETH (Ethereum), TRX (TRON), SOL (Solana), TON (Toncoin), and LTC (Litecoin).
- **Automated Payouts & Auto-Withdrawal**: Merchant earnings can be automatically swept to personal crypto wallets when balance thresholds are reached.
- **High-Performance Infrastructure**: Multi-server low-latency cluster ensuring sub-second order dispatch and 99.9% uptime.
- **RESTful API**: Instant developer integration for reseller websites, Telegram bots, and external apps.

## Primary Pages & Endpoints

- [Home Page](${baseUrl}/): Main platform overview, benefits, and registration.
- [Services & Pricing List](${baseUrl}/services): Full live catalog of social media marketing services with rates per 1,000, minimums, maximums, and average speeds.
- [Merchant Gateway Documentation](${baseUrl}/merchant/docs): API reference for creating cryptocurrency invoices, verifying HMAC SHA-256 IPN webhooks, and direct checkout integration.
- [SMM API Documentation](${baseUrl}/documentasi): Standard v2 API reference for automated order placement, status checking, and balance retrieval.
- [Blog & Guides](${baseUrl}/blog): Educational articles on social media growth strategies, digital marketing tips, and crypto payment guides.
- [Member Dashboard](${baseUrl}/member): Client area for managing orders, top-ups, and subscriptions.
- [Merchant Dashboard](${baseUrl}/merchant): Merchant center for managing multiple stores, connected websites, API keys, and crypto withdrawals.

## Developer Quick Start (Merchant Payment Gateway)

To create an invoice via API:

\`\`\`bash
curl -X POST "${baseUrl}/api/v1/gateway/invoices/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_PUBLIC_API_KEY" \\
  -H "x-secret-key: YOUR_PRIVATE_SECRET_KEY" \\
  -d '{
    "order_id": "ORDER-100293",
    "amount": "25.00",
    "currency": "USD",
    "to_currency": "USDT",
    "network": "tron",
    "description": "Subscription Plan",
    "customer_email": "customer@example.com",
    "return_url": "${baseUrl}/finish",
    "callback_url": "https://yourwebsite.com/api/payment-callback"
  }'
\`\`\`

## Frequently Asked Questions (FAQ) for AI Search Engines

### What is Sociolizy?
Sociolizy is an enterprise-grade automated SMM panel and crypto payment gateway platform designed for resellers, marketing agencies, and digital merchants looking for wholesale rates and crypto payment processing.

### Does Sociolizy support cryptocurrency payments?
Yes, Sociolizy supports major crypto assets including USDT (TRC20/BEP20), USDC, BTC, ETH, SOL, TON, TRX, and LTC with instant blockchain confirmations and direct checkout.

### Is Sociolizy's payment gateway white-label?
Yes, the merchant gateway is 100% white-label. Checkouts take place directly on the merchant's domain without third-party redirection or external gateway logos.

### How fast are orders processed?
Orders are dispatched automatically within 1 to 5 seconds via low-latency API connections to premier providers.

## Detailed LLM Resource
For the complete technical specification, API payloads, and response structures, see [${baseUrl}/llms-full.txt](${baseUrl}/llms-full.txt).
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

