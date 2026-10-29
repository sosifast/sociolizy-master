"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  initPostHogClient,
  capturePostHogPageView,
  capturePostHogPageLeave,
  capturePostHogScrollDepth,
  capturePostHogWebVital,
  capturePostHogException,
  identifyPostHogUser,
} from "@/lib/posthog-client";

/**
 * Inner component that listens to App Router route changes and triggers
 * PostHog events ($pageview, $pageleave, scroll depth, and web vitals).
 * Must be wrapped inside <Suspense> due to useSearchParams().
 */
function PostHogRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const prevUrlRef = useRef<string | null>(null);
  const prevPathRef = useRef<string | null>(null);
  const pageEnterTimeRef = useRef<number>(Date.now());
  const maxScrollPercentRef = useRef<number>(0);
  const reachedMilestonesRef = useRef<Set<number>>(new Set());

  // 1. Route Change Tracking: $pageview & $pageleave
  useEffect(() => {
    if (typeof window === "undefined") return;

    const queryString = searchParams?.toString();
    const currentUrl =
      window.location.origin +
      pathname +
      (queryString ? `?${queryString}` : "");

    // If previous page exists, capture $pageleave for it before tracking new pageview
    if (prevUrlRef.current && prevPathRef.current && prevUrlRef.current !== currentUrl) {
      const durationMs = Date.now() - pageEnterTimeRef.current;
      capturePostHogPageLeave(
        prevUrlRef.current,
        prevPathRef.current,
        durationMs,
        maxScrollPercentRef.current
      );
    }

    // Reset metrics for the new page
    prevUrlRef.current = currentUrl;
    prevPathRef.current = pathname;
    pageEnterTimeRef.current = Date.now();
    maxScrollPercentRef.current = 0;
    reachedMilestonesRef.current = new Set();

    // Capture $pageview
    capturePostHogPageView(currentUrl, pathname);

    // Initial check for 0-height or immediately fully visible pages
    const checkInitialScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      if (scrollHeight <= clientHeight && !reachedMilestonesRef.current.has(100)) {
        reachedMilestonesRef.current.add(100);
        capturePostHogScrollDepth(100, pathname, 0, scrollHeight);
      }
    };
    const timer = setTimeout(checkInitialScroll, 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // 2. Pageleave on tab close / reload / visibility hidden
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      if (prevUrlRef.current && prevPathRef.current) {
        const durationMs = Date.now() - pageEnterTimeRef.current;
        capturePostHogPageLeave(
          prevUrlRef.current,
          prevPathRef.current,
          durationMs,
          maxScrollPercentRef.current
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && prevUrlRef.current && prevPathRef.current) {
        const durationMs = Date.now() - pageEnterTimeRef.current;
        capturePostHogPageLeave(
          prevUrlRef.current,
          prevPathRef.current,
          durationMs,
          maxScrollPercentRef.current
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 3. Scroll Depth Tracking (25%, 50%, 75%, 90%, 100%)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const MILESTONES = [25, 50, 75, 90, 100];

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        ticking = false;

        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const maxScroll = docHeight - winHeight;

        if (maxScroll <= 0) return;

        const currentScrollY = window.scrollY;
        const currentPercent = Math.min(
          100,
          Math.round((currentScrollY / maxScroll) * 100)
        );

        if (currentPercent > maxScrollPercentRef.current) {
          maxScrollPercentRef.current = currentPercent;
        }

        MILESTONES.forEach((milestone) => {
          if (
            currentPercent >= milestone &&
            !reachedMilestonesRef.current.has(milestone)
          ) {
            reachedMilestonesRef.current.add(milestone);
            capturePostHogScrollDepth(
              milestone,
              pathname,
              currentScrollY,
              docHeight
            );
          }
        });
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return null;
}

/**
 * Top-level PostHog Provider component.
 * Mounts client-side tracking, Core Web Vitals, Error Tracking, and Log capture.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initialize PostHog client
    initPostHogClient();

    // 2. Identify authenticated user session if available
    const checkAuthSession = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Cache-Control": "no-store" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data?.user) {
            identifyPostHogUser(data.user);
          }
        }
      } catch {
        // Ignore session fetch errors
      }
    };
    checkAuthSession();

    // 3. Error Tracking: Global unhandled errors and rejections
    const handleGlobalError = (event: ErrorEvent) => {
      // Ignore extension or cross-origin script error noise
      if (!event.filename && !event.message) return;
      capturePostHogException(event.error || new Error(event.message), {
        mechanism: { handled: false, type: "window.onerror" },
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const err =
        reason instanceof Error
          ? reason
          : new Error(
              typeof reason === "string" ? reason : JSON.stringify(reason)
            );
      capturePostHogException(err, {
        mechanism: { handled: false, type: "unhandledrejection" },
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // 4. $web_vitals: PerformanceObserver for Core Web Vitals
    let observers: PerformanceObserver[] = [];
    if ("PerformanceObserver" in window) {
      // Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              const val = Math.round(entry.startTime);
              capturePostHogWebVital({
                name: "FCP",
                value: val,
                rating:
                  val <= 1800
                    ? "good"
                    : val <= 3000
                    ? "needs-improvement"
                    : "poor",
              });
            }
          }
        });
        fcpObserver.observe({ type: "paint", buffered: true });
        observers.push(fcpObserver);
      } catch {}

      // LCP (Largest Contentful Paint)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const val = Math.round(lastEntry.startTime);
            capturePostHogWebVital({
              name: "LCP",
              value: val,
              rating:
                val <= 2500
                  ? "good"
                  : val <= 4000
                  ? "needs-improvement"
                  : "poor",
            });
          }
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        observers.push(lcpObserver);
      } catch {}

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });
        observers.push(clsObserver);

        const flushCls = () => {
          if (clsValue > 0) {
            capturePostHogWebVital({
              name: "CLS",
              value: Number(clsValue.toFixed(4)),
              rating:
                clsValue <= 0.1
                  ? "good"
                  : clsValue <= 0.25
                  ? "needs-improvement"
                  : "poor",
            });
          }
        };
        window.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") flushCls();
        });
      } catch {}

      // FID / INP
      try {
        const inpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            const duration =
              entry.duration ||
              (entry.processingStart
                ? entry.processingStart - entry.startTime
                : 0);
            const val = Math.round(duration);
            capturePostHogWebVital({
              name: entry.entryType === "first-input" ? "FID" : "INP",
              value: val,
              rating:
                val <= 200
                  ? "good"
                  : val <= 500
                  ? "needs-improvement"
                  : "poor",
            });
          }
        });
        inpObserver.observe({ type: "first-input", buffered: true });
        observers.push(inpObserver);
      } catch {}

      // TTFB (Time to First Byte)
      try {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0) {
          const navEntry = navEntries[0] as PerformanceNavigationTiming;
          if (navEntry && navEntry.responseStart) {
            const ttfb = Math.round(navEntry.responseStart);
            capturePostHogWebVital({
              name: "TTFB",
              value: ttfb,
              rating:
                ttfb <= 800
                  ? "good"
                  : ttfb <= 1800
                  ? "needs-improvement"
                  : "poor",
            });
          }
        }
      } catch {}
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      observers.forEach((obs) => {
        try {
          obs.disconnect();
        } catch {}
      });
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogRouteTracker />
      </Suspense>
      {children}
    </>
  );
}

export default PostHogProvider;

