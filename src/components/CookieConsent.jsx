import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { getConsent, setConsent, onConsentChange } from "../lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelIdle = () => {};
    let isMounted = true;

    // Check initial consent status
    const currentChoice = getConsent();
    if (currentChoice === null) {
      if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
          const idleId = window.requestIdleCallback(
            () => {
              if (isMounted) setVisible(true);
            },
            { timeout: 2000 }
          );
          cancelIdle = () => window.cancelIdleCallback(idleId);
        } else {
          const timer = setTimeout(() => {
            if (isMounted) setVisible(true);
          }, 1500);
          cancelIdle = () => clearTimeout(timer);
        }
      }
    }

    // Listen for consent resets (e.g. from footer "Cookie settings" click)
    const unsubscribe = onConsentChange((choice) => {
      if (choice === null) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    });

    return () => {
      isMounted = false;
      cancelIdle();
      unsubscribe();
    };
  }, []);

  // Sync banner height with floating WhatsApp actions so they smoothly lift above the banner
  useEffect(() => {
    if (typeof window === "undefined") return;

    const floatingContainer = document.querySelector(".floating-actions-container");
    if (!floatingContainer) return;

    if (visible && containerRef.current) {
      const bannerHeight = containerRef.current.offsetHeight || 160;
      floatingContainer.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      floatingContainer.style.transform = `translateY(-${bannerHeight + 12}px)`;
    } else {
      floatingContainer.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      floatingContainer.style.transform = "translateY(0px)";
    }
  }, [visible]);

  if (!visible) return null;

  const handleAccept = () => {
    setConsent("accepted");
    setVisible(false);
  };

  const handleDeny = () => {
    setConsent("denied");
    setVisible(false);
  };

  return (
    <aside
      ref={containerRef}
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 left-0 right-0 sm:left-5 sm:bottom-5 sm:right-auto z-50 w-full sm:max-w-[500px] p-2.5 sm:p-0 pointer-events-auto print-hide"
      style={{
        paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Luxury Glassmorphic Surface */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-[#141212]/98 via-[#0D0B0B]/98 to-[#080707]/98 text-white p-4 sm:p-5 shadow-[0_16px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(215,164,65,0.12)] backdrop-blur-xl animate-cookie-slide-up">
        {/* Subtle Ambient Gold Accents */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#D7A441]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[#9B111E]/15 blur-2xl" />

        {/* Top Header Row */}
        <div className="relative flex items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D7A441]/15 border border-[#D7A441]/30 text-[#D7A441] shrink-0">
              <ShieldCheck size={14} className="stroke-[2.5]" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-neutral-200 truncate font-sans">
              STARLIGHT <span className="text-[#D7A441]">HOTELS</span>
            </span>
          </div>

          <span className="text-[9.5px] sm:text-[10.5px] font-medium tracking-wider uppercase text-white/50 shrink-0">
            Privacy &amp; Cookies
          </span>
        </div>

        {/* Body Description */}
        <div className="relative mt-3">
          <p
            id="cookie-consent-desc"
            className="text-xs sm:text-[13px] leading-[1.65] text-white/85 font-normal"
          >
            We use essential cookies to keep our reservation system reliable and secure. With your permission, we also use optional cookies to understand website usage and measure advertising effectiveness.
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#D7A441]">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-0.5 font-medium underline underline-offset-3 hover:text-white transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D7A441] rounded-xs"
            >
              <span>Review Privacy Policy</span>
              <ChevronRight size={12} className="stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Buttons - Equal visual weight, ergonomic min 44px height, high WCAG contrast */}
        <div className="relative mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleDeny}
            className="flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl sm:rounded-2xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/35 active:scale-[0.98] text-white/90 hover:text-white font-semibold text-xs sm:text-sm tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer shadow-sm"
          >
            Decline Optional
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl sm:rounded-2xl border border-[#D7A441]/60 bg-gradient-to-r from-[#B88428]/30 via-[#D7A441]/25 to-[#B88428]/30 hover:border-[#D7A441] hover:bg-[#D7A441]/35 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7A441] cursor-pointer shadow-[0_2px_12px_rgba(215,164,65,0.15)]"
          >
            Accept All
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cookieSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .animate-cookie-slide-up {
            animation: cookieSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
      `}</style>
    </aside>
  );
}
