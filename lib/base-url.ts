import { headers } from "next/headers";

/**
 * Dynamically resolves the base URL of the application.
 *
 * Priority order:
 * 1. Incoming Request Headers (Host / X-Forwarded-Host & Protocol)
 *    - Perfectly works with any domain (custom domain, staging, localhost, ngrok, etc.)
 * 2. Environment Variables:
 *    - NEXT_PUBLIC_SITE_URL
 *    - NEXT_PUBLIC_APP_URL
 *    - VERCEL_PROJECT_PRODUCTION_URL
 *    - VERCEL_URL
 * 3. Default Fallback ("https://sociolizy.com")
 */
export async function getBaseUrl(): Promise<string> {
  // 1. Dynamic Request Headers check
  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const forwardedProto = headerList.get("x-forwarded-proto");
    const proto =
      forwardedProto ||
      (host && (host.startsWith("localhost") || host.startsWith("127.0.0.1"))
        ? "http"
        : "https");

    if (host) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // Handled silently when called outside request context or during static generation
  }

  // 2. Environment Variables check
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  // 3. Fallback
  return "https://sociolizy.com";
}

/**
 * Synchronous fallback for places where async/await cannot be used.
 */
export function getStaticBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  return "https://sociolizy.com";
}

