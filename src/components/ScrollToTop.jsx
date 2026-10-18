import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollToTop Component
 * Ensures every navigation - including clicking links, navigating back in history,
 * or using keyboard backspace - starts strictly from the top of the page (0, 0),
 * overriding browser automatic scroll restoration and preventing jumps from async layout shifts.
 */
export default function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();
  const navType = useNavigationType();
  const userScrolledRef = useRef(false);

  // Globally disable browser automatic scroll restoration so it never restores previous bottom scroll
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {
        // Fallback for browsers with restricted history APIs
      }
    }

    const handlePopState = () => {
      userScrolledRef.current = false;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    userScrolledRef.current = false;

    // Track if user intentionally initiates manual scrolling after page transition
    const markUserScrolled = (e) => {
      if (e.isTrusted) {
        userScrolledRef.current = true;
      }
    };

    window.addEventListener("wheel", markUserScrolled, { passive: true });
    window.addEventListener("touchmove", markUserScrolled, { passive: true });
    window.addEventListener("keydown", markUserScrolled, { passive: true });

    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
        return () => {
          window.removeEventListener("wheel", markUserScrolled);
          window.removeEventListener("touchmove", markUserScrolled);
          window.removeEventListener("keydown", markUserScrolled);
        };
      }
    }

    const resetScroll = () => {
      if (!userScrolledRef.current) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      }
    };

    resetScroll();
    const raf1 = requestAnimationFrame(resetScroll);
    const t1 = setTimeout(resetScroll, 50);
    const t2 = setTimeout(resetScroll, 150);
    const t3 = setTimeout(resetScroll, 300);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("wheel", markUserScrolled);
      window.removeEventListener("touchmove", markUserScrolled);
      window.removeEventListener("keydown", markUserScrolled);
    };
  }, [pathname, search, hash, key, navType]);

  return null;
}
