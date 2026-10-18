/**
 * Starlight Hotels - Cookie & Tracking Consent Management Core
 * 
 * CRITICAL COMPLIANCE RULE:
 * Every optional script, tracking tool, analytics library, and marketing pixel
 * MUST start only inside `onConsentChange` when `choice === "accepted"`.
 * Never execute or initialize optional tracking scripts outside of an active
 * and affirmative "accepted" consent callback.
 */

const STORAGE_KEY = "starlight_cookie_consent";
const CURRENT_VERSION = 1;

// Internal event listeners for current tab
const listeners = new Set();

/**
 * Notify all registered in-module listeners
 * @param {string|null} choice - "accepted" | "denied" | null
 */
function notifyListeners(choice) {
  listeners.forEach((callback) => {
    try {
      callback(choice);
    } catch (err) {
      console.error("[Consent] Callback error:", err);
    }
  });
}

/**
 * Retrieve current consent choice
 * @returns {"accepted" | "denied" | null}
 */
export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.choice === "accepted" || parsed.choice === "denied")) {
      return parsed.choice;
    }
  } catch (err) {
    console.warn("[Consent] Unable to read localStorage:", err);
  }
  return null;
}

/**
 * Store user's consent choice and notify listeners
 * @param {"accepted" | "denied"} choice 
 */
export function setConsent(choice) {
  if (choice !== "accepted" && choice !== "denied") return;
  if (typeof window === "undefined") return;

  try {
    const record = {
      choice,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (err) {
    console.warn("[Consent] Unable to write localStorage:", err);
  }

  notifyListeners(choice);
}

/**
 * Reset consent choice (re-opens the banner / settings)
 */
export function resetConsent() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[Consent] Unable to clear localStorage:", err);
  }

  notifyListeners(null);
}

/**
 * Subscribe to consent changes across current tab and other tabs
 * @param {(choice: "accepted" | "denied" | null) => void} callback 
 * @returns {() => void} Unsubscribe function
 */
export function onConsentChange(callback) {
  if (typeof callback !== "function") return () => {};

  listeners.add(callback);

  // Cross-tab sync via window storage event
  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      const choice = getConsent();
      try {
        callback(choice);
      } catch (err) {
        console.error("[Consent] Storage listener callback error:", err);
      }
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}
