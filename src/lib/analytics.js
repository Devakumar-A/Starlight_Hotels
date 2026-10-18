/**
 * Starlight Hotels - Privacy-Preserving Google Analytics 4 & Google Ads Integration
 *
 * CONSENT-GATED INTEGRATION:
 * - When VITE_GA_MEASUREMENT_ID and VITE_GOOGLE_ADS_ID are empty/undefined,
 *   makes ZERO network requests and performs zero operations.
 * - Default consent state: analytics_storage, ad_storage, ad_user_data,
 *   ad_personalization all set to 'denied'.
 * - External gtag.js is injected ONLY after explicit 'accepted' choice inside requestIdleCallback.
 * - On consent 'denied' or reset: updates consent state to denied and disables GA tracking.
 * - Strips all private information (names, phones, emails, queries, hashes).
 * - Excludes private routes (/login, /signup, /reset-password, /profile, /my-bookings).
 */

import { onConsentChange, getConsent } from "./consent";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || "";
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim() || "";
const ADS_BOOKING_LABEL = import.meta.env.VITE_GOOGLE_ADS_BOOKING_LABEL?.trim() || "";

const HAS_ANY_ID = Boolean(GA_ID || ADS_ID);

// Routes that must NEVER be tracked by analytics
const EXCLUDED_PRIVATE_ROUTES = [
  "/login",
  "/signup",
  "/reset-password",
  "/profile",
  "/my-bookings",
];

let isInitialized = false;
let isScriptInjected = false;
let currentConsentChoice = null;

// Ensure window.dataLayer & window.gtag exist immediately with default denied state
if (typeof window !== "undefined" && HAS_ANY_ID) {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
  // Default deny state before any user action
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function gtag() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag.apply(window, arguments);
    } catch (err) {
      console.warn("[Analytics] gtag error:", err);
    }
  }
}

/**
 * Injects https://www.googletagmanager.com/gtag/js asynchronously
 */
function injectGtagScript() {
  if (isScriptInjected || typeof document === "undefined" || !HAS_ANY_ID) return;
  isScriptInjected = true;

  const primaryId = GA_ID || ADS_ID;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`;
  document.head.appendChild(script);

  gtag("js", new Date());

  // Update consent to granted
  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });

  if (GA_ID) {
    // Enable GA tracking if previously disabled
    window[`ga-disable-${GA_ID}`] = false;
    gtag("config", GA_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }

  if (ADS_ID) {
    gtag("config", ADS_ID);
  }
}

/**
 * Handle consent acceptance
 */
function handleConsentAccepted() {
  currentConsentChoice = "accepted";
  if (!HAS_ANY_ID) return;

  if (typeof window !== "undefined") {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => injectGtagScript(), { timeout: 2000 });
    } else {
      setTimeout(() => injectGtagScript(), 100);
    }
  }
}

/**
 * Handle consent denial or reset after acceptance
 */
function handleConsentDeniedOrReset() {
  currentConsentChoice = "denied";
  if (!HAS_ANY_ID) return;

  gtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (GA_ID && typeof window !== "undefined") {
    window[`ga-disable-${GA_ID}`] = true;
  }
}

/**
 * Idempotent initializer subscribing to consent changes
 */
export function initAnalytics() {
  if (isInitialized || !HAS_ANY_ID || typeof window === "undefined") return;
  isInitialized = true;

  // Subscribe to consent changes
  onConsentChange((choice) => {
    if (choice === "accepted") {
      handleConsentAccepted();
    } else {
      handleConsentDeniedOrReset();
    }
  });

  // Check if consent was already accepted in prior session
  const initialChoice = getConsent();
  if (initialChoice === "accepted") {
    handleConsentAccepted();
  }
}

/**
 * Clean path by stripping query strings, hashes, and verifying it is not a private route
 * @param {string} rawPath 
 * @returns {string | null}
 */
function sanitizePath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return null;

  // Strip query string and hash
  const clean = rawPath.split("?")[0].split("#")[0].trim();

  // Exclude private routes
  const isExcluded = EXCLUDED_PRIVATE_ROUTES.some(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`)
  );

  if (isExcluded) return null;
  return clean || "/";
}

/**
 * Track page view on route change
 * @param {string} path 
 * @param {string} title 
 */
export function trackPageView(path, title) {
  try {
    if (!HAS_ANY_ID || currentConsentChoice !== "accepted" || !GA_ID) return;

    const cleanPath = sanitizePath(path);
    if (!cleanPath) return;

    gtag("event", "page_view", {
      page_path: cleanPath,
      page_title: title || document.title,
    });
  } catch (err) {
    console.warn("[Analytics] trackPageView error:", err);
  }
}

/**
 * Track custom event (e.g. purchase)
 * @param {string} name 
 * @param {Record<string, any>} params 
 */
export function trackEvent(name, params = {}) {
  try {
    if (!HAS_ANY_ID || currentConsentChoice !== "accepted") return;

    // Filter out potential PII keys
    const safeParams = {};
    const prohibitedKeys = ["name", "phone", "email", "guest", "address", "notes", "request"];

    Object.keys(params).forEach((key) => {
      const lower = key.toLowerCase();
      const isProhibited = prohibitedKeys.some((bad) => lower.includes(bad));
      if (!isProhibited) {
        safeParams[key] = params[key];
      }
    });

    gtag("event", name, safeParams);
  } catch (err) {
    console.warn("[Analytics] trackEvent error:", err);
  }
}

/**
 * Track Google Ads conversion
 * @param {number} value 
 * @param {string} currency 
 * @param {string} transactionId 
 */
export function trackAdsConversion(value, currency = "INR", transactionId = "") {
  try {
    if (!HAS_ANY_ID || currentConsentChoice !== "accepted" || !ADS_ID || !ADS_BOOKING_LABEL) {
      return;
    }

    gtag("event", "conversion", {
      send_to: `${ADS_ID}/${ADS_BOOKING_LABEL}`,
      value: Number(value) || 0,
      currency: currency || "INR",
      transaction_id: transactionId ? String(transactionId) : undefined,
    });
  } catch (err) {
    console.warn("[Analytics] trackAdsConversion error:", err);
  }
}
