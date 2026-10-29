"use client";

import { posthog } from "posthog-js";
import config from "@/app/data/posthog.json";

let isInitialized = false;

/**
 * Initializes PostHog in the browser using credentials from app/data/posthog.json.
 */
export function initPostHogClient() {
  if (typeof window === "undefined" || isInitialized) {
    return posthog;
  }

  const apiKey =
    process.env.NEXT_PUBLIC_POSTHOG_KEY || config.apiKey || "";
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || config.host || "https://us.i.posthog.com";

  if (!apiKey) {
    console.warn("[PostHog] API key not found in app/data/posthog.json");
    return posthog;
  }

  try {
    posthog.init(apiKey, {
      api_host: host,
      // Disable default pageview to avoid duplicate events on SPA navigation;
      // route transitions are tracked manually via PostHogRouteTracker
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      capture_performance: {
        network_timing: true,
        web_vitals: true,
      },
      enable_recording_console_log: true,
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: true,
      },
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      loaded: () => {
        isInitialized = true;
      },
    });

    isInitialized = true;
  } catch (error) {
    console.error("[PostHog] Client initialization failed:", error);
  }

  return posthog;
}

/**
 * Returns current PostHog Session ID or null.
 */
export function getPostHogSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return posthog.get_session_id?.() || null;
  } catch {
    return null;
  }
}

/**
 * Categorizes current path into page section (landing, page, auth, member, admin).
 */
export function getPageSection(pathname: string): string {
  if (!pathname || pathname === "/") return "landing";
  if (pathname.startsWith("/auth")) return "auth";
  if (pathname.startsWith("/member")) return "member";
  if (pathname.startsWith("/admin")) return "admin";
  if (
    pathname.startsWith("/page") ||
    pathname === "/about-us" ||
    pathname === "/contact-us" ||
    pathname === "/policy" ||
    pathname === "/privacy" ||
    pathname === "/service"
  ) {
    return "page";
  }
  return "other";
}

/**
 * Captures $pageview event with rich route details.
 */
export function capturePostHogPageView(
  url: string,
  pathname: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  const section = getPageSection(pathname);
  const sessionId = getPostHogSessionId();

  try {
    posthog.capture("$pageview", {
      $current_url: url,
      pathname,
      section,
      title: typeof document !== "undefined" ? document.title : "",
      session_id: sessionId,
      ...properties,
    });
  } catch (err) {
    console.warn("[PostHog] Error capturing $pageview:", err);
  }
}

/**
 * Captures $pageleave event with duration and scroll properties.
 */
export function capturePostHogPageLeave(
  url: string,
  pathname: string,
  durationMs: number,
  maxScrollPercentage: number,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  try {
    posthog.capture("$pageleave", {
      $current_url: url,
      pathname,
      section: getPageSection(pathname),
      duration_ms: Math.round(durationMs),
      duration_seconds: Math.round(durationMs / 1000),
      max_scroll_percentage: maxScrollPercentage,
      session_id: getPostHogSessionId(),
      ...properties,
    });
  } catch (err) {
    console.warn("[PostHog] Error capturing $pageleave:", err);
  }
}

/**
 * Captures scroll depth milestone reached (25%, 50%, 75%, 90%, 100%).
 */
export function capturePostHogScrollDepth(
  depthPercent: number,
  pathname: string,
  scrollPx: number,
  totalHeightPx: number
) {
  if (typeof window === "undefined") return;

  try {
    posthog.capture("scroll_depth", {
      depth_percent: depthPercent,
      depth_label: `${depthPercent}%`,
      pathname,
      section: getPageSection(pathname),
      scroll_px: Math.round(scrollPx),
      total_height_px: Math.round(totalHeightPx),
      session_id: getPostHogSessionId(),
    });
  } catch (err) {
    console.warn("[PostHog] Error capturing scroll_depth:", err);
  }
}

export interface WebVitalMetric {
  name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  pathname?: string;
  id?: string;
}

/**
 * Captures Web Vitals performance metric ($web_vitals).
 */
export function capturePostHogWebVital(metric: WebVitalMetric) {
  if (typeof window === "undefined") return;

  const currentPath =
    metric.pathname || (typeof window !== "undefined" ? window.location.pathname : "");

  try {
    posthog.capture("$web_vitals", {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      metric_id: metric.id,
      pathname: currentPath,
      section: getPageSection(currentPath),
      session_id: getPostHogSessionId(),
    });
  } catch (err) {
    console.warn("[PostHog] Error capturing $web_vitals:", err);
  }
}

/**
 * Captures unhandled client exception / error with stack details and session ID.
 */
export function capturePostHogException(
  error: Error | unknown,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const sessionId = getPostHogSessionId();

  try {
    const errObj = error instanceof Error ? error : new Error(String(error));

    posthog.captureException(errObj, {
      pathname: currentPath,
      section: getPageSection(currentPath),
      session_id: sessionId,
      ...properties,
    });

    posthog.capture("$exception", {
      $exception_message: errObj.message,
      $exception_type: errObj.name || "Error",
      $exception_stack: errObj.stack,
      pathname: currentPath,
      section: getPageSection(currentPath),
      session_id: sessionId,
      ...properties,
    });
  } catch (err) {
    console.warn("[PostHog] Error capturing exception:", err);
  }
}

/**
 * Captures structured client log message to PostHog.
 */
export function capturePostHogLog(
  level: "log" | "info" | "warn" | "error",
  message: string,
  data?: any
) {
  if (typeof window === "undefined") return;

  try {
    posthog.capture("client_log", {
      level,
      message,
      data: data ? (typeof data === "object" ? JSON.stringify(data).slice(0, 1000) : String(data)) : null,
      pathname: window.location.pathname,
      section: getPageSection(window.location.pathname),
      session_id: getPostHogSessionId(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[PostHog] Error capturing client log:", err);
  }
}

/**
 * Identifies a logged-in user in PostHog.
 */
export function identifyPostHogUser(user: {
  id: number | string;
  username?: string;
  email?: string;
  level?: string;
  server_area?: string;
}) {
  if (typeof window === "undefined") return;

  try {
    posthog.identify(`user_${user.id}`, {
      user_id: user.id,
      username: user.username,
      email: user.email,
      role: user.level,
      server_area: user.server_area,
    });
  } catch (err) {
    console.warn("[PostHog] Failed to identify user:", err);
  }
}

/**
 * Resets PostHog user session upon logout.
 */
export function resetPostHogUser() {
  if (typeof window === "undefined") return;

  try {
    posthog.reset();
  } catch (err) {
    console.warn("[PostHog] Failed to reset user:", err);
  }
}

export { posthog };
