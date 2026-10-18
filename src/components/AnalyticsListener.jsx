import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "../lib/analytics";

/**
 * Global router listener for Google Analytics 4 page views
 * - Initializes analytics subscription once on mount.
 * - On every pathname change, defers trackPageView until after RouteSeo updates document.title.
 */
export default function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // Defer with requestAnimationFrame plus one tick to ensure RouteSeo has updated document.title
    const handle = requestAnimationFrame(() => {
      setTimeout(() => {
        trackPageView(location.pathname, document.title);
      }, 0);
    });

    return () => cancelAnimationFrame(handle);
  }, [location.pathname]);

  return null;
}
