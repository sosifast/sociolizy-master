import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Dynamically resolves the base URL of the application.
 *
 * Priority order:
 * 1. Incoming Request Headers (Host / X-Forwarded-Host & Protocol)
 *    - Automatically detects the active domain (custom domain, staging, localhost, Cloudflare, reverse proxy, etc.)
 * 2. Database Setting (Setting.api_app if configured with valid domain)
 * 3. Environment Variables (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_APP_URL, VERCEL_URL, etc.)
 * 4. Default Fallback ("https://sociolizy.com")
 */
export async function getBaseUrl(): Promise<string> {
  // 1. Dynamic Request Headers check (Live domain detection)
  try {
    const headerList = await headers();
    const rawHost = headerList.get("x-forwarded-host") || headerList.get("host");

    if (rawHost) {
      // If multiple proxies are chained (e.g. "client.com, proxy.com"), pick the client-facing host
      const host = rawHost.split(",")[0].trim();

      const rawProto = headerList.get("x-forwarded-proto");
      const forwardedProto = rawProto ? rawProto.split(",")[0].trim() : null;
      const isSsl = headerList.get("x-forwarded-ssl") === "on";

      const proto =
        forwardedProto ||
        (isSsl
          ? "https"
          : host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");

      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // Handled silently when called outside request context or during static generation
  }

  // 2. Database Setting check
  try {
    const setting = await prisma.setting.findFirst({
      select: { api_app: true },
    });
    if (setting?.api_app && setting.api_app.trim().startsWith("http")) {
      return setting.api_app.trim().replace(/\/$/, "");
    }
  } catch {
    // Database check failed or tables not ready
  }

  // 3. Environment Variables check
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

  // 4. Default Fallback
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
