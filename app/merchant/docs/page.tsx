"use client";

import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function MerchantApiDocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const curlCreateInvoice = `curl -X POST "https://YOUR_DOMAIN/api/v1/gateway/invoices/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: mch_live_xxxxxxxxxxxxxxxx" \\
  -H "x-secret-key: mch_sec_xxxxxxxxxxxxxxxx" \\
  -d '{
    "order_id": "ORDER-100293",
    "amount": "25.00",
    "currency": "USD",
    "to_currency": "USDT",
    "network": "tron",
    "description": "Premium Subscription #100293",
    "customer_email": "customer@example.com",
    "return_url": "https://yourstore.com/order-success",
    "callback_url": "https://yourstore.com/api/ipn-callback"
  }'`;

  const nodeJsExample = `const res = await fetch("https://YOUR_DOMAIN/api/v1/gateway/invoices/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.MERCHANT_API_KEY,
    "x-secret-key": process.env.MERCHANT_SECRET_KEY,
  },
  body: JSON.stringify({
    order_id: "ORDER-9912",
    amount: "15.00",
    description: "Account Top-up",
    return_url: "https://yourstore.com/finish",
    callback_url: "https://yourstore.com/api/payment-webhook",
  }),
});

const data = await res.json();
console.log("Direct Checkout URL:", data.data.checkout_url);
// Redirect your customer to data.data.checkout_url!`;

  const phpWebhookVerify = `<?php
// Handle inbound IPN Webhook from Payment Gateway
$payload = file_get_contents('php://input');
$signatureHeader = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
$secretKey = "mch_sec_xxxxxxxxxxxxxxxx"; // Your website's secret key

// Compute cryptographic HMAC-SHA256 signature
$expectedSignature = hash_hmac('sha256', $payload, $secretKey);

if (!hash_equals($expectedSignature, $signatureHeader)) {
    http_response_code(401);
    die(json_encode(['error' => 'Invalid signature']));
}

$data = json_decode($payload, true);
$event = $data['event']; // 'payment.completed'
$orderId = $data['data']['order_id'];
$amountUsd = $data['data']['amount_usd'];
$txid = $data['data']['txid'];

// TODO: Update your internal database order status to PAID!
echo json_encode(['status' => 'OK']);
?>`;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
            API Documentation & Developer Guide
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Merchant Payment Gateway Integration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Integrate instant cryptocurrency checkouts into your websites, Telegram bots, or applications in minutes.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <Terminal className="w-5 h-5 text-emerald-400 mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">RESTful JSON API</h3>
          <p className="text-xs text-slate-400">
            Standard HTTP POST and GET requests with clean, predictable JSON responses.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">Header Authentication</h3>
          <p className="text-xs text-slate-400">
            Pass <code className="text-emerald-400 font-mono">x-api-key</code> and <code className="text-amber-400 font-mono">x-secret-key</code> in every API call.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <Zap className="w-5 h-5 text-cyan-400 mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">100% White-Label Direct Checkout</h3>
          <p className="text-xs text-slate-400">
            Hosted entirely on your domain without third-party redirection or branding.
          </p>
        </div>
      </div>

      {/* Section 1: Create Invoice */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs px-2 py-0.5 rounded">
                POST
              </span>
              <span className="font-mono text-sm text-white font-semibold">
                /api/v1/gateway/invoices/create
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Create a new payment invoice and generate an instant direct checkout URL.
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyCode(curlCreateInvoice, "curl")}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSection === "curl" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy cURL</span>
          </button>
        </div>

        {/* Code display */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 overflow-x-auto">
          <pre className="text-xs text-slate-200 font-mono leading-relaxed">
            {curlCreateInvoice}
          </pre>
        </div>

        {/* Parameters Table */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Request Body Parameters (JSON)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Required</th>
                  <th className="p-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                <tr>
                  <td className="p-2.5 text-emerald-400">order_id</td>
                  <td className="p-2.5">string</td>
                  <td className="p-2.5 text-amber-400">Yes</td>
                  <td className="p-2.5 font-sans">Your internal unique order ID</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-400">amount</td>
                  <td className="p-2.5">number | string</td>
                  <td className="p-2.5 text-amber-400">Yes</td>
                  <td className="p-2.5 font-sans">Invoice charge amount in USD</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-400">to_currency</td>
                  <td className="p-2.5">string</td>
                  <td className="p-2.5 text-slate-500">Optional</td>
                  <td className="p-2.5 font-sans">Specific cryptocurrency to lock payment into (e.g. USDT, BTC)</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-400">network</td>
                  <td className="p-2.5">string</td>
                  <td className="p-2.5 text-slate-500">Optional</td>
                  <td className="p-2.5 font-sans">Blockchain network (tron, bsc, polygon, sol, ton)</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-400">callback_url</td>
                  <td className="p-2.5">string (URL)</td>
                  <td className="p-2.5 text-slate-500">Optional</td>
                  <td className="p-2.5 font-sans">Custom IPN Webhook URL for this specific invoice</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-400">return_url</td>
                  <td className="p-2.5">string (URL)</td>
                  <td className="p-2.5 text-slate-500">Optional</td>
                  <td className="p-2.5 font-sans">Customer redirection URL upon successful payment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Node.js Example */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Node.js / Next.js Implementation Example</h3>
            <p className="text-xs text-slate-400">Using native fetch on your backend server</p>
          </div>
          <button
            type="button"
            onClick={() => copyCode(nodeJsExample, "node")}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSection === "node" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Code</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 overflow-x-auto">
          <pre className="text-xs text-slate-200 font-mono leading-relaxed">
            {nodeJsExample}
          </pre>
        </div>
      </div>

      {/* Section 3: Webhook Verification */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              Webhook IPN Processing & Signature Verification (PHP)
            </h3>
            <p className="text-xs text-slate-400">
              Inbound notifications are delivered via HTTP POST with header <code className="text-emerald-400 font-mono">x-signature</code> (HMAC SHA-256).
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyCode(phpWebhookVerify, "php")}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSection === "php" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy PHP</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 overflow-x-auto">
          <pre className="text-xs text-slate-200 font-mono leading-relaxed">
            {phpWebhookVerify}
          </pre>
        </div>
      </div>
    </div>
  );
}
