import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Routes where the Special Offer floating badge must NOT appear
 */
const EXCLUDED_OFFER_ROUTES = [
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

/**
 * Unified Floating Badges (Special Offer + WhatsApp Support)
 * - Exact same width, height, and alignment on desktop and mobile.
 * - Single flex-col container guarantees they NEVER overlap.
 * - Small and sleek on mobile, refined and elegant on desktop.
 * - Special Offer is exclusively for guest users (!user).
 * - WhatsApp is for all users.
 */
export default function FloatingWhatsApp() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Track auth session for guest vs logged-in user (deferred to unblock critical path)
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
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        console.error("FloatingWhatsApp auth error:", err);
      }
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const handle = requestIdleCallback(() => initAuth(), { timeout: 2500 });
        return () => {
          isMounted = false;
          cancelIdleCallback(handle);
          unsubscribe();
        };
      } else {
        const timer = setTimeout(initAuth, 100);
        return () => {
          isMounted = false;
          clearTimeout(timer);
          unsubscribe();
        };
      }
    }
  }, []);

  const isExcludedOfferRoute = EXCLUDED_OFFER_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  const isTermsOrPrivacy =
    location.pathname.startsWith("/terms") ||
    location.pathname.startsWith("/privacy");

  const showOfferBadge = !user && !isExcludedOfferRoute;
  const showWhatsAppBadge = !isTermsOrPrivacy;

  if (!showOfferBadge && !showWhatsAppBadge) {
    return null;
  }

  const handleOpenOffer = () => {
    window.dispatchEvent(new CustomEvent("open-special-offer"));
  };

  return (
    <aside
      aria-label="Floating Actions"
      className="fixed bottom-7 right-3 sm:bottom-9 sm:right-5 z-40 flex flex-col items-end gap-1.5 sm:gap-2 print-hide floating-actions-container"
    >
      {/* 1. SPECIAL OFFER BADGE (Guest Users Alone) */}
      {showOfferBadge && (
        <button
          type="button"
          onClick={handleOpenOffer}
          className="group relative flex items-center justify-between w-[150px] sm:w-[190px] h-[34px] sm:h-[42px] px-2 sm:px-3 rounded-full bg-black border-[1.5px] border-[#D4A346] shadow-[0_6px_20px_rgba(0,0,0,0.8),0_0_12px_rgba(212,163,70,0.2)] hover:shadow-[0_8px_25px_rgba(212,163,70,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-[#D4A346] cursor-pointer select-none"
          title="Special Offer: 10% OFF"
        >
          {/* Left: Coin with Sparkles */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative shrink-0 flex items-center justify-center">
              {/* Top Sparkle */}
              <svg
                className="absolute -top-1 -left-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#F6D88E] drop-shadow-[0_0_3px_rgba(246,216,142,0.9)] fill-current pointer-events-none z-10 transition-transform duration-300 group-hover:scale-125"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9Z" />
              </svg>
              {/* Lower Sparkle */}
              <svg
                className="absolute top-1.5 -left-1.5 sm:top-2 sm:-left-2 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-[#F6D88E] drop-shadow-[0_0_2px_rgba(246,216,142,0.9)] fill-current pointer-events-none z-10 transition-transform duration-300 group-hover:scale-125"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9Z" />
              </svg>

              {/* 3D Metallic Gold Coin */}
              <div className="relative flex items-center justify-center h-5.5 w-5.5 sm:h-7.5 sm:w-7.5 rounded-full bg-gradient-to-b from-[#F7DB96] via-[#DCA849] to-[#996D1C] shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:rotate-6">
                <span className="text-[#140E02] font-black text-[10px] sm:text-xs leading-none select-none tracking-tighter" aria-hidden="true">
                  %
                </span>
              </div>
            </div>

            {/* Hairline Divider */}
            <div className="h-4 sm:h-5 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent shrink-0" />

            {/* Typography */}
            <div className="flex flex-col leading-none select-none">
              <span className="text-[6.5px] sm:text-[8px] font-bold tracking-[0.16em] uppercase text-[#D4A346] drop-shadow-sm mb-0.5">
                Special Offer
              </span>
              <span className="text-[11px] sm:text-[14px] font-black text-white tracking-tight leading-none drop-shadow">
                10% OFF
              </span>
            </div>
          </div>

          {/* Right: Gold Chevron */}
          <ChevronRight
            className="text-[#D4A346] shrink-0 h-3 w-3 sm:h-4 sm:w-4 stroke-[3] transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      )}

      {/* 2. WHATSAPP BADGE (All Users) */}
      {showWhatsAppBadge && (
        <a
          href="https://wa.me/918270660904"
          target="_blank"
          rel="noreferrer"
          className="group relative flex items-center justify-between w-[150px] sm:w-[190px] h-[34px] sm:h-[42px] px-2 sm:px-3 rounded-full bg-gradient-to-r from-[#0E6C32] via-[#0B5C2A] to-[#084920] border-[1.5px] border-[#25D366]/50 shadow-[0_6px_20px_rgba(0,0,0,0.7),0_0_12px_rgba(37,211,102,0.2)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-[#25D366] cursor-pointer select-none"
        >
          {/* Left: 3D WhatsApp Green Coin */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="relative shrink-0 flex items-center justify-center h-5.5 w-5.5 sm:h-7.5 sm:w-7.5 rounded-full bg-gradient-to-b from-[#2FE26F] via-[#25D366] to-[#128C44] shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:rotate-6">
              <svg viewBox="0 0 448 512" className="h-3 w-3 sm:h-4 sm:w-4 fill-white" aria-hidden="true">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
            </div>

            {/* Hairline Divider */}
            <div className="h-4 sm:h-5 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-transparent shrink-0" />

            {/* Typography */}
            <div className="flex flex-col leading-none select-none">
              <span className="text-[10px] sm:text-[13px] font-bold text-white tracking-tight leading-none drop-shadow-sm mb-0.5">
                Chat with us
              </span>
              <span className="text-[6.5px] sm:text-[8px] font-semibold tracking-[0.14em] uppercase text-white/80">
                ON WHATSAPP
              </span>
            </div>
          </div>

          {/* Right: White Chevron */}
          <ChevronRight
            className="text-white/90 shrink-0 h-3 w-3 sm:h-4 sm:w-4 stroke-[3] transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      )}
    </aside>
  );
}
