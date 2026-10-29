import { PostHog } from "posthog-node";
import config from "@/app/data/posthog.json";

let posthogInstance: PostHog | null = null;

/**
 * Returns a singleton PostHog Node client for server-side analytics,
 * event tracking, and feature flags.
 */
export function getPostHogClient(): PostHog {
  if (!posthogInstance) {
    const apiKey = process.env.POSTHOG_API_KEY || config.apiKey;
    const host = process.env.POSTHOG_HOST || config.host;

    posthogInstance = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogInstance;
}

/**
 * Captures an event to PostHog from server-side route handlers or actions.
 */
export function capturePostHogEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  try {
    const client = getPostHogClient();
    client.capture({
      distinctId,
      event,
      properties,
    });
  } catch (error) {
    console.warn("[PostHog] Failed to capture event:", error);
  }
}

/**
 * Shuts down the PostHog client gracefully.
 */
export async function shutdownPostHog() {
  if (posthogInstance) {
    await posthogInstance.shutdown();
    posthogInstance = null;
  }
}

