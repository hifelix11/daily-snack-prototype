"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key) return;

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
  });

  initialized = true;
}

export function identifyUser(userId: string, properties?: object) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties as Record<string, unknown>);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function setUserProperties(properties: object) {
  if (typeof window === "undefined") return;
  posthog.setPersonProperties(properties as Record<string, unknown>);
}
