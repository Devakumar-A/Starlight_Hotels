import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setSeo } from "../lib/seo";

const ROUTE_SEO_MAP = {
  // 1. Home
  "/": {
    title: "Starlight Hotels | Luxury Stays & Resorts in South India",
    description:
      "Discover handpicked luxury hotels, boutique stays, and hillside resorts across Chennai, Pondicherry, and Kodaikanal. Book direct with Starlight Hotels.",
    canonicalPath: "/",
  },

  // 2. Book Hotels & Aliases
  "/book-hotels": {
    title: "Book Hotels | Starlight Hotels",
    description:
      "Explore available luxury boutique hotels and hillside resorts across Chennai, Pondicherry, and Kodaikanal. Book directly with Starlight Hotels.",
    canonicalPath: "/book-hotels",
  },
  "/hotels": {
    title: "Book Hotels | Starlight Hotels",
    description:
      "Explore available luxury boutique hotels and hillside resorts across Chennai, Pondicherry, and Kodaikanal. Book directly with Starlight Hotels.",
    canonicalPath: "/book-hotels",
  },
  "/availability": {
    title: "Book Hotels | Starlight Hotels",
    description:
      "Explore available luxury boutique hotels and hillside resorts across Chennai, Pondicherry, and Kodaikanal. Book directly with Starlight Hotels.",
    canonicalPath: "/book-hotels",
  },

  // 3. About Us & Aliases
  "/about-us": {
    title: "About Us | Starlight Hotels",
    description:
      "Learn about Starlight Hotels, where timeless hospitality meets modern luxury. Discover thoughtful stays crafted around warmth, comfort, and memorable moments.",
    canonicalPath: "/about-us",
  },
  "/about": {
    title: "About Us | Starlight Hotels",
    description:
      "Learn about Starlight Hotels, where timeless hospitality meets modern luxury. Discover thoughtful stays crafted around warmth, comfort, and memorable moments.",
    canonicalPath: "/about-us",
  },

  // 4. FAQs & Aliases
  "/faqs": {
    title: "FAQs | Starlight Hotels",
    description:
      "Find answers to frequently asked questions about booking, check-in, guest policies, cancellations, and stays across Starlight Hotels properties.",
    canonicalPath: "/faqs",
  },
  "/faq": {
    title: "FAQs | Starlight Hotels",
    description:
      "Find answers to frequently asked questions about booking, check-in, guest policies, cancellations, and stays across Starlight Hotels properties.",
    canonicalPath: "/faqs",
  },

  // 5. Contact Us & Aliases
  "/contact": {
    title: "Contact Us | Starlight Hotels",
    description:
      "Contact Starlight Hotels for reservations, corporate inquiries, and concierge support across our Chennai, Pondicherry, and Kodaikanal properties.",
    canonicalPath: "/contact",
  },
  "/contact-us": {
    title: "Contact Us | Starlight Hotels",
    description:
      "Contact Starlight Hotels for reservations, corporate inquiries, and concierge support across our Chennai, Pondicherry, and Kodaikanal properties.",
    canonicalPath: "/contact",
  },
  "/support": {
    title: "Contact Us | Starlight Hotels",
    description:
      "Contact Starlight Hotels for reservations, corporate inquiries, and concierge support across our Chennai, Pondicherry, and Kodaikanal properties.",
    canonicalPath: "/contact",
  },
  "/customer-support": {
    title: "Contact Us | Starlight Hotels",
    description:
      "Contact Starlight Hotels for reservations, corporate inquiries, and concierge support across our Chennai, Pondicherry, and Kodaikanal properties.",
    canonicalPath: "/contact",
  },

  // 6. Partner With Us & Aliases
  "/partner-with-us": {
    title: "Partner With Us | Starlight Hotels",
    description:
      "Partner with Starlight Hotels. Join South India's luxury hospitality network to maximize occupancy, revenue growth, and brand prestige for your property.",
    canonicalPath: "/partner-with-us",
  },
  "/partners": {
    title: "Partner With Us | Starlight Hotels",
    description:
      "Partner with Starlight Hotels. Join South India's luxury hospitality network to maximize occupancy, revenue growth, and brand prestige for your property.",
    canonicalPath: "/partner-with-us",
  },

  // 7. Terms & Conditions & Aliases
  "/terms": {
    title: "Terms & Conditions | Starlight Hotels",
    description:
      "Review official Terms and Conditions, booking policies, guest guidelines, and cancellation rules for Starlight Hotels properties across South India.",
    canonicalPath: "/terms",
  },
  "/terms-conditions": {
    title: "Terms & Conditions | Starlight Hotels",
    description:
      "Review official Terms and Conditions, booking policies, guest guidelines, and cancellation rules for Starlight Hotels properties across South India.",
    canonicalPath: "/terms",
  },
  "/terms-and-conditions": {
    title: "Terms & Conditions | Starlight Hotels",
    description:
      "Review official Terms and Conditions, booking policies, guest guidelines, and cancellation rules for Starlight Hotels properties across South India.",
    canonicalPath: "/terms",
  },

  // 8. Privacy Policy & Aliases
  "/privacy": {
    title: "Privacy Policy | Starlight Hotels",
    description:
      "Read Starlight Hotels' Privacy Policy to learn how we protect guest data, secure reservation records, and adhere to Indian data protection laws.",
    canonicalPath: "/privacy",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Starlight Hotels",
    description:
      "Read Starlight Hotels' Privacy Policy to learn how we protect guest data, secure reservation records, and adhere to Indian data protection laws.",
    canonicalPath: "/privacy",
  },

  // Private routes (noindex, nofollow)
  "/login": {
    title: "Login | Starlight Hotels",
    description:
      "Access your Starlight Hotels account to manage room reservations, exclusive bookings, and guest profile preferences.",
    noindex: true,
  },
  "/signup": {
    title: "Sign Up | Starlight Hotels",
    description:
      "Create a Starlight Hotels account to unlock member rates and enjoy personalized boutique hospitality experiences.",
    noindex: true,
  },
  "/bookings": {
    title: "Bookings | Starlight Hotels",
    description:
      "View and manage your upcoming and completed hotel reservations with Starlight Hotels.",
    noindex: true,
  },
  "/booking": {
    title: "Booking | Starlight Hotels",
    description:
      "Complete your room reservation with Starlight Hotels for handpicked luxury stays in South India.",
    noindex: true,
  },
  "/my-bookings": {
    title: "My Bookings | Starlight Hotels",
    description:
      "Review your active booking status, dates, and stay details for Starlight Hotels properties.",
    noindex: true,
  },
  "/profile": {
    title: "Profile | Starlight Hotels",
    description:
      "Manage your personal profile, contact information, and preferences for stays with Starlight Hotels.",
    noindex: true,
  },
  "/reset-password": {
    title: "Reset Password | Starlight Hotels",
    description:
      "Reset your Starlight Hotels account credentials securely to regain access to your member reservations.",
    noindex: true,
  },
};

export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Hotel detail routes are handled independently by HotelDetails.jsx
    if (pathname.startsWith("/hotel/")) {
      return;
    }

    const matchedConfig = ROUTE_SEO_MAP[pathname];

    if (matchedConfig) {
      setSeo({
        title: matchedConfig.title,
        description: matchedConfig.description,
        canonicalPath: matchedConfig.canonicalPath,
        noindex: matchedConfig.noindex || false,
        jsonLd: null,
      });
    } else {
      // 404 / Unknown path fallback
      setSeo({
        title: "Page Not Found | Starlight Hotels",
        description:
          "The requested destination or page could not be located. Explore luxury boutique hotels and resorts across Chennai, Pondicherry, and Kodaikanal.",
        noindex: true,
        canonicalPath: null,
        jsonLd: null,
      });
    }
  }, [pathname]);

  return null;
}
