import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Sparkles, Percent, ArrowRight, ChevronRight } from "lucide-react";
import starlightLogo from "../assets/brand/starlight-logo-90.webp";
import offerSunsetImg from "../assets/offer_popup.webp";
import offerMobileImg from "../assets/offer_popup_mobile.webp";

/**
 * Storage key for session-level dismissal
 */
const SESSION_DISMISS_KEY = "starlight_offer_dismissed";

/**
 * Routes where the floating offer widget and promo modal must NEVER appear
 */
const EXCLUDED_ROUTES = [
  "/bookings",
  "/booking",
  "/my-bookings",
  "/profile",
  "/login",
  "/signup",
  "/reset-password",
  "/terms",
  "/terms-conditions",
  "/terms-and-conditions",
  "/privacy",
  "/privacy-policy",
];

export default function LoginOfferPromo({ delayMs = 4500, enabled = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_DISMISS_KEY) === "true";
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const timerRef = useRef(null);
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // -------------------------------------------------------------
  // 1. Supabase Auth Session Tracking (deferred to unblock critical path)
  // -------------------------------------------------------------
  useEffect(() => {
    let unsubscribe = () => {};
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { supabase } = await import("../lib/supabase");
        if (!isMounted) return;

        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setUser(data.session?.user ?? null);
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isMounted) {
            setUser(session?.user ?? null);
            if (session?.user) {
              setIsOpen(false);
            }
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        console.error("LoginOfferPromo auth error:", err);
      }
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const handle = requestIdleCallback(() => initAuth(), { timeout: 3000 });
        return () => {
          isMounted = false;
          cancelIdleCallback(handle);
          unsubscribe();
        };
      } else {
        const timer = setTimeout(initAuth, 200);
        return () => {
          isMounted = false;
          clearTimeout(timer);
          unsubscribe();
        };
      }
    }
  }, []);

  // -------------------------------------------------------------
  // 2. 4 to 5 Second Timer for Homepage Auto-Popup
  // -------------------------------------------------------------
  useEffect(() => {
    // Only enabled on public homepage, for unauthenticated visitors, if not yet dismissed
    const isHomePage = location.pathname === "/";
    const isEligible = enabled && isHomePage && !user && !isDismissed;

    if (!isEligible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Schedule auto-popup
    timerRef.current = setTimeout(() => {
      const existingModal = document.querySelector('[role="dialog"]');
      const alreadyDismissed = sessionStorage.getItem(SESSION_DISMISS_KEY) === "true";

      if (!existingModal && !alreadyDismissed && !user) {
        setIsOpen(true);
      }
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [location.pathname, user, isDismissed, delayMs, enabled]);

  // Listen for open event from unified FloatingActions widget
  useEffect(() => {
    const handleOpenEvent = () => {
      const isExcluded = EXCLUDED_ROUTES.some((route) =>
        location.pathname.startsWith(route)
      );
      if (!isExcluded) {
        setIsOpen(true);
      }
    };
    window.addEventListener("open-special-offer", handleOpenEvent);
    return () => window.removeEventListener("open-special-offer", handleOpenEvent);
  }, [location.pathname]);

  // Immediately close modal if user navigates to an excluded route
  useEffect(() => {
    const isExcluded = EXCLUDED_ROUTES.some((route) =>
      location.pathname.startsWith(route)
    );
    if (isExcluded && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, isOpen]);

  // -------------------------------------------------------------
  // 3. Focus Management, Escape Key & Body Scroll Lock
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (modalRef.current) {
      modalRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement.current && previouslyFocusedElement.current.focus) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  // -------------------------------------------------------------
  // 4. Modal Action Handlers
  // -------------------------------------------------------------
  const recordDismissal = () => {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "true");
    } catch {
      // Ignore sessionStorage errors
    }
    setIsDismissed(true);
  };

  const handleClose = () => {
    recordDismissal();
    setIsOpen(false);
  };

  const handleContinueWithoutLogin = () => {
    recordDismissal();
    setIsOpen(false);
  };

  const handleLoginNow = () => {
    recordDismissal();
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("starlight:open-auth", {
        detail: { mode: "login" },
      })
    );
  };

  const handleOpenFromWidget = () => {
    setIsOpen(true);
  };

  // -------------------------------------------------------------
  // 5. Visibility Checks
  // -------------------------------------------------------------
  const isExcludedRoute = EXCLUDED_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  if (isExcludedRoute || !isOpen) {
    return null;
  }

  return (
    <>
      {/* ============================================================
          PROMOTIONAL MODAL DIALOG
          Compact, professional small card with minimal, high-impact content.
          Responsive image: Uses converted webp (offer_popup_mobile.webp) on mobile,
          and desktop webp (offer_popup.webp) on tablet/desktop.
      ============================================================ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-offer-title"
            aria-describedby="promo-offer-desc"
            className="relative w-full max-w-[380px] sm:max-w-[400px] bg-[#0d1017] border border-[#D7A441]/40 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(215,164,65,0.18)] overflow-hidden flex flex-col focus:outline-none animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close promotion"
              className="absolute top-3 right-3 z-30 flex items-center justify-center h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/20 hover:border-[#D7A441]/60 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D7A441]"
            >
              <X size={16} />
            </button>

            {/* Top Visual Banner: Mobile vs Desktop Image via <picture> */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900 shrink-0">
              <picture>
                <source media="(max-width: 639px)" srcSet={offerMobileImg} type="image/webp" />
                <source media="(min-width: 640px)" srcSet={offerSunsetImg} type="image/webp" />
                <img
                  src={offerMobileImg}
                  alt="Starlight Exclusive Stay Offer"
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </picture>

              {/* Gradient overlay blending image into card */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-black/30 pointer-events-none" />

              {/* Special Offer Pill Badge */}
              <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full border border-[#D7A441]/40 bg-[#0d1017]/85 px-3 py-1 backdrop-blur-md shadow-md">
                <Sparkles size={11} className="text-[#D7A441] fill-[#D7A441]" />
                <span className="text-[10px] font-bold tracking-widest text-[#F5D485] uppercase">
                  Special Offer
                </span>
              </div>
            </div>

            {/* Card Content - Clean, minimal & standard */}
            <div className="p-5 sm:p-6 flex flex-col items-center text-center">
              {/* Brand Header */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <img
                  src={starlightLogo}
                  alt="Starlight Hotels"
                  className="h-5 w-5 object-contain"
                />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">
                  Starlight Hotels
                </span>
              </div>

              {/* Core Offer */}
              <span className="text-xs font-bold tracking-wider text-[#D7A441] uppercase">
                Login &amp; Get
              </span>

              <h2
                id="promo-offer-title"
                className="text-4xl sm:text-5xl font-black tracking-tight leading-tight my-1 bg-gradient-to-r from-[#FFF0BD] via-[#D7A441] to-[#B88428] bg-clip-text text-transparent drop-shadow-sm font-sans"
              >
                10% OFF
              </h2>

              <p
                id="promo-offer-desc"
                className="text-sm sm:text-base font-semibold text-white/90 tracking-wide mb-1"
              >
                on your Total Booking
              </p>

              <p className="text-xs text-white/55 max-w-[290px] leading-relaxed mb-5">
                Sign in to instantly unlock member rates on every stay with Starlight.
              </p>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleLoginNow}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-[#F5D485] via-[#D7A441] to-[#B88428] hover:brightness-105 active:scale-[0.98] transition shadow-[0_4px_22px_rgba(215,164,65,0.4)] flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D7A441] focus:ring-offset-2 focus:ring-offset-[#0d1017]"
                >
                  <span>Login to Claim</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleContinueWithoutLogin}
                  className="w-full py-2 text-xs font-medium text-white/50 hover:text-white/80 transition-colors text-center cursor-pointer focus:outline-none"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
