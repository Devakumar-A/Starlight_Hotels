import {
  ArrowUp,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  Menu,
  Phone,
  Printer,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import starLogo from "../assets/brand/starlight-favicon.png";
import Footer from "../components/layout/Footer";

const SECTIONS = [
  { id: "section-1", number: "01", title: "Introduction & Applicability" },
  { id: "section-2", number: "02", title: "Website Use & Guest Conduct" },
  { id: "section-3", number: "03", title: "Reservations & Confirmations" },
  { id: "section-4", number: "04", title: "Check-In & Check-Out Timings" },
  { id: "section-5", number: "05", title: "Extra Occupancy Policy" },
  { id: "section-6", number: "06", title: "Local Guest Policy" },
  { id: "section-7", number: "07", title: "Visitor Policy" },
  { id: "section-8", number: "08", title: "Smoking Policy & Safety" },
  { id: "section-9", number: "09", title: "Guest Conduct & Responsibilities" },
  { id: "section-10", number: "10", title: "Property Damage & Breakage" },
  { id: "section-11", number: "11", title: "Children & Additional Guests" },
  { id: "section-12", number: "12", title: "Special Requests" },
  { id: "section-13", number: "13", title: "Hotel Facilities & Services" },
  { id: "section-14", number: "14", title: "Rates, Taxes & Payment" },
  { id: "section-15", number: "15", title: "Cancellation & Refunds" },
  { id: "section-16", number: "16", title: "Offers & Promotions" },
  { id: "section-17", number: "17", title: "Intellectual Property & Content" },
  { id: "section-18", number: "18", title: "Third-Party Services" },
  { id: "section-19", number: "19", title: "Privacy" },
  { id: "section-20", number: "20", title: "Limitation of Liability" },
  { id: "section-21", number: "21", title: "Force Majeure" },
  { id: "section-22", number: "22", title: "Governing Law & Jurisdiction" },
  { id: "section-23", number: "23", title: "Changes to These Terms" },
  { id: "section-24", number: "24", title: "Contact Information" },
];

export default function TermsConditions() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("section-1");
  const [copiedSection, setCopiedSection] = useState(null);
  const [copiedModalLink, setCopiedModalLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  // Scroll to top upon opening or route changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.key]);

  // Track scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
      setShowBackToTop(window.scrollY > 350);

      // Determine active section based on scroll position
      const scrollPos = window.scrollY + 160;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.number.includes(q)
    );
  }, [searchQuery]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = window.innerWidth < 640 ? -70 : -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
      setMobileTocOpen(false);
    }
  };

  const copySectionLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const copyShareModalUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedModalLink(true);
      setTimeout(() => setCopiedModalLink(false), 2200);
    });
  };

  const triggerNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Starlight Hotels - Terms & Conditions",
          text: "Official Terms & Conditions and Guest Policies for Starlight Hotels.",
          url: window.location.href,
        })
        .catch(() => {});
    }
  };

  const printDocument = () => {
    window.print();
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "Starlight Hotels - Official Terms & Conditions";
  const shareText = "Review the official Terms & Conditions and Guest Policies for Starlight Hotels:";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-800 font-sans antialiased selection:bg-[#FEE2E2] selection:text-[#9B111E] overflow-x-hidden w-full max-w-full relative">
      {/* ============================================================
          PRINT STYLESHEET (CLEAN, COURT & EXECUTIVE READY)
      ============================================================ */}
      <style>{`
        @media print {
          @page {
            margin: 1.8cm 1.5cm 1.8cm 1.5cm;
            size: A4 portrait;
          }

          body, html, #root {
            background: #ffffff !important;
            color: #111827 !important;
            font-size: 10.5pt !important;
            line-height: 1.55 !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Hide UI Chrome during printing */
          header,
          footer,
          aside,
          .print-hide,
          [role="progressbar"],
          button {
            display: none !important;
          }

          /* Display print-only elements */
          .print-only {
            display: block !important;
          }

          /* Reset layout grid to 100% full width */
          main,
          .lg\\:col-span-8,
          .max-w-\\[1400px\\] {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Section cards for print */
          section[id^="section-"] {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 16pt !important;
            border: 1px solid #d1d5db !important;
            border-radius: 6pt !important;
            padding: 12pt 14pt !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }

          /* Avoid orphaning section titles at bottom of page */
          h1, h2, h3 {
            break-after: avoid !important;
            page-break-after: avoid !important;
            color: #000000 !important;
          }

          a {
            text-decoration: none !important;
            color: #111827 !important;
          }
        }
      `}</style>

      {/* ============================================================
          TOP READING PROGRESS BAR (SCREEN ONLY)
      ============================================================ */}
      <div
        className="fixed top-0 left-0 h-[3px] max-w-full bg-gradient-to-r from-[#DC2626] via-[#D7A441] to-[#8B0000] z-[60] transition-[width] duration-150 ease-out pointer-events-none print-hide"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* ============================================================
          HEADER (RESPONSIVE NAVBAR - SCREEN ONLY)
      ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md transition-all w-full max-w-full print-hide">
        <div className="mx-auto flex max-w-[1400px] w-full items-center justify-between px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3.5">
          {/* Brand Identity */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-90 min-w-0 flex-1 sm:flex-initial mr-2 sm:mr-0"
            aria-label="Starlight Hotels Home"
          >
            <img
              src={starLogo}
              alt="Starlight Hotels"
              className="h-7 w-7 sm:h-9 sm:w-9 object-contain drop-shadow-sm shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] sm:text-sm lg:text-base font-bold tracking-[0.12em] sm:tracking-[0.18em] text-neutral-900 uppercase font-sans truncate">
                STARLIGHT <span className="text-[#D7A441]">HOTELS</span>
              </span>
              <span className="text-[7px] sm:text-[8.5px] font-semibold tracking-[0.16em] sm:tracking-[0.22em] text-neutral-500 uppercase truncate">
                LUXURY STAYS &amp; RESORTS
              </span>
            </div>
          </Link>

          {/* Action Header Nav */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-5 shrink-0">
            <a
              href="tel:+918270660904"
              className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-800 transition hover:text-[#9B111E]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition hover:bg-red-50 hover:text-[#9B111E]">
                <Phone size={12} />
              </span>
              <span className="hidden lg:inline">+91 8270660904</span>
            </a>

            {/* Print Button */}
            <button
              onClick={printDocument}
              type="button"
              aria-label="Print Terms & Conditions"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            {/* Share Button (Opens Full Share Modal) */}
            <button
              onClick={() => setShareModalOpen(true)}
              type="button"
              aria-label="Share options"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>

            <Link
              to="/"
              className="rounded-full bg-neutral-900 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10.5px] sm:text-xs font-semibold text-white transition hover:bg-neutral-800 whitespace-nowrap shadow-sm"
            >
              Book a Stay
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 sm:hidden shrink-0"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white px-4 py-3 shadow-lg sm:hidden">
            <div className="flex flex-col space-y-2.5 text-xs font-semibold text-neutral-800">
              <a
                href="tel:+918270660904"
                className="flex items-center gap-2 py-1 text-neutral-900 hover:text-[#9B111E]"
              >
                <Phone size={14} className="text-[#DC2626] shrink-0" />
                <span>Call Concierge: +91 8270660904</span>
              </a>
              <a
                href="mailto:info@starlighthotels.in"
                className="flex items-center gap-2 py-1 text-neutral-900 hover:text-[#9B111E] break-all"
              >
                <Mail size={14} className="text-[#DC2626] shrink-0" />
                <span>info@starlighthotels.in</span>
              </a>
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={printDocument}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                >
                  <Printer size={12} />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShareModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                >
                  <Share2 size={12} />
                  <span>Share Document</span>
                </button>
              </div>
              <div className="h-px bg-neutral-100" />
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[#9B111E] font-bold"
              >
                Explore Destinations &amp; Stays
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          PRINT-ONLY OFFICIAL DOCUMENT HEADER (APPEARS ON PAPER ONLY)
      ============================================================ */}
      <div className="hidden print-only mb-6 pb-4 border-b-2 border-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-widest text-neutral-900 font-sans uppercase">
              STARLIGHT <span className="text-[#9B111E]">HOTELS</span>
            </span>
            <span className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mt-0.5">
              LUXURY STAYS &amp; RESORTS • OFFICIAL POLICY DOCUMENT
            </span>
          </div>
          <div className="text-right text-[9.5pt] text-neutral-600 leading-tight">
            <div><strong>Document Ref:</strong> ST-TC-2026-V1</div>
            <div><strong>Effective Date:</strong> 15 September 2026</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-200 grid grid-cols-3 gap-2 text-[8.5pt] text-neutral-700">
          <div>
            <strong className="text-neutral-900 block">Check-In / Check-Out:</strong>
            12:00 PM Check-In / 11:00 AM Check-Out
          </div>
          <div>
            <strong className="text-neutral-900 block">Local Guest Timing:</strong>
            Check-In &le; 6:00 PM | Check-Out &le; 6:00 PM
          </div>
          <div className="text-right">
            <strong className="text-neutral-900 block">Support Concierge:</strong>
            +91 8270660904 | info@starlighthotels.in
          </div>
        </div>
      </div>

      {/* ============================================================
          HERO BANNER (SCREEN ONLY)
      ============================================================ */}
      <section className="relative overflow-hidden bg-[#0F0808] text-white border-b border-neutral-800 w-full max-w-full print-hide">
        {/* Contained Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/4 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-[#9B111E]/20 blur-3xl" />
          <div className="absolute top-10 right-10 h-44 sm:h-72 w-44 sm:w-72 rounded-full bg-[#D7A441]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-12 py-7 sm:py-12 lg:py-16">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight leading-[1.2] break-words">
              Terms &amp; Conditions
            </h1>

            <div className="mt-2.5 sm:mt-4 flex items-center gap-2 text-xs text-neutral-400">
              <Clock size={13} className="text-[#D7A441] shrink-0" />
              <span>Last Updated: <strong className="text-white font-medium">15 September 2026</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          KEY POLICIES AT-A-GLANCE (SCREEN ONLY)
      ============================================================ */}
      <section className="border-b border-neutral-200 bg-white w-full max-w-full print-hide">
        <div className="mx-auto max-w-[1400px] w-full px-3.5 sm:px-6 lg:px-12 py-5 sm:py-8 lg:py-10">
          <div className="mb-3.5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#9B111E]">
                Quick Reference
              </span>
              <h2 className="mt-0.5 sm:mt-1 text-base sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900">
                Key Stay Policies At-a-Glance
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 max-w-md">
              A quick reference to essential stay policies. Detailed terms are provided in the numbered clauses below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Card 1: Timings */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-red-50 text-[#9B111E]">
                  <Clock size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 04
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Check-In &amp; Check-Out
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Standard Check-In is at <strong>12:00 PM</strong>; Check-Out is at <strong>11:00 AM</strong>. Early check-in &amp; late check-out are subject to availability and applicable charges.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-4")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Card 2: Local Guest Policy */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                  <ShieldCheck size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 06
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Local Guest Policy
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Bookings from Cuddalore, Marakkanam, Tindivanam, Pondicherry, and Villupuram cannot check in <strong>after 6:00 PM</strong> and must check out <strong>before 6:00 PM</strong>.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-6")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Card 3: Occupancy & Visitors */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
                  <Users size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clauses 05 &amp; 07
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Occupancy &amp; Visitors
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Room category capacities apply; extra guests are chargeable. Non-registered visitors are not permitted in guest rooms or for overnight stays.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-5")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Card 4: Smoking & Safety */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                  <FileText size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 08
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Smoking Policy
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Smoking is permitted inside guest rooms. Responsible and safe disposal in designated ashtrays is mandatory to maintain property safety.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-8")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT AREA (STICKY SIDEBAR + 24 EDITORIAL CLAUSES)
      ============================================================ */}
      <div className="mx-auto max-w-[1400px] w-full px-3 sm:px-6 lg:px-12 py-5 sm:py-10 lg:py-14">
        {/* Mobile Inline Table of Contents Toggle Bar (SCREEN ONLY) */}
        <div className="lg:hidden mb-5 print-hide">
          <button
            type="button"
            onClick={() => setMobileTocOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white p-3 text-xs font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
          >
            <span className="flex items-center gap-2 truncate">
              <Menu size={15} className="text-[#9B111E] shrink-0" />
              <span className="truncate">Table of Contents ({SECTIONS.length} Clauses)</span>
            </span>
            <span className="text-[11px] text-[#9B111E] font-bold shrink-0 ml-2">
              Browse All
            </span>
          </button>
        </div>

        {/* Mobile Slide-Up Drawer for Table of Contents (SCREEN ONLY) */}
        {mobileTocOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 lg:hidden print-hide">
            <div className="w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Table of Contents (24 Clauses)
                </span>
                <button
                  type="button"
                  onClick={() => setMobileTocOpen(false)}
                  className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label="Close table of contents"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search within mobile drawer */}
              <div className="relative mt-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter clauses (e.g. smoking, refund)..."
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50/60 pl-8 pr-8 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-[#9B111E] focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="mt-3 overflow-y-auto space-y-1 pr-1 max-h-[55vh]">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                      activeSection === sec.id
                        ? "bg-red-50 text-[#9B111E] font-bold"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="truncate">
                      <span className="text-neutral-400 font-mono mr-2">
                        {sec.number}
                      </span>
                      {sec.title}
                    </span>
                    <ChevronRight size={12} className="shrink-0 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 items-start w-full min-w-0">
          {/* ========================================================
              LEFT SIDEBAR (STICKY NAVIGATION - DESKTOP, SCREEN ONLY)
          ======================================================== */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4 min-w-0 print-hide">
            {/* Search and Navigation Box */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 lg:p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Contents &amp; Navigation
                </span>
                <span className="text-[11px] font-semibold text-[#9B111E]">
                  24 Clauses
                </span>
              </div>

              {/* Quick Search */}
              <div className="relative mt-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clauses (e.g. smoking, refund)..."
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50/60 pl-8 pr-8 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-[#9B111E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9B111E]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Scrollable list of sections */}
              <nav className="mt-3.5 max-h-[440px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-neutral-200">
                {filteredSections.length === 0 ? (
                  <p className="py-6 text-center text-xs text-neutral-400">
                    No clauses match &quot;{searchQuery}&quot;
                  </p>
                ) : (
                  filteredSections.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isActive
                            ? "bg-red-50 text-[#9B111E] font-bold border-l-2 border-[#9B111E]"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        <span className="truncate flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] ${
                              isActive ? "text-[#9B111E]" : "text-neutral-400"
                            }`}
                          >
                            {sec.number}
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </span>
                        <ChevronRight
                          size={11}
                          className={`shrink-0 transition-transform ${
                            isActive
                              ? "text-[#9B111E] translate-x-0.5"
                              : "text-neutral-300 group-hover:text-neutral-500"
                          }`}
                        />
                      </button>
                    );
                  })
                )}
              </nav>

              {/* Sidebar Footer Help Link */}
              <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Need assistance?</span>
                <a
                  href="mailto:info@starlighthotels.in"
                  className="font-semibold text-[#9B111E] hover:underline"
                >
                  Contact Support
                </a>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 lg:p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Starlight Hotels Concierge
              </h4>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Direct phone and email lines for questions regarding these terms, check-in logistics, or booking confirmations.
              </p>
              <div className="mt-3 space-y-2 text-xs">
                <a
                  href="tel:+918270660904"
                  className="flex items-center gap-2 font-medium text-neutral-800 hover:text-[#9B111E]"
                >
                  <Phone size={13} className="text-[#9B111E] shrink-0" />
                  <span>+91 8270660904</span>
                </a>
                <a
                  href="mailto:info@starlighthotels.in"
                  className="flex items-center gap-2 font-medium text-neutral-800 hover:text-[#9B111E] break-all"
                >
                  <Mail size={13} className="text-[#9B111E] shrink-0" />
                  <span>info@starlighthotels.in</span>
                </a>
              </div>
            </div>
          </aside>

          {/* ========================================================
              RIGHT CONTENT AREA (THE FULL 24 LEGAL CLAUSES)
          ======================================================== */}
          <main className="lg:col-span-8 space-y-6 sm:space-y-8 lg:space-y-10 min-w-0 w-full">
            {/* ====================================================
                CLAUSE 1: INTRODUCTION & APPLICABILITY
            ==================================================== */}
            <section
              id="section-1"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    01
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Introduction &amp; Applicability
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-1")}
                  aria-label="Copy link to Section 1"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-1" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  These Terms &amp; Conditions govern your access to and use of the Starlight Hotels website, online booking services, accommodation services, and related hospitality services provided by Starlight Hotels.
                </p>

                <p>
                  By accessing this website, making a reservation, or staying at Starlight Hotels, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions, together with the specific booking conditions applicable to your reservation, subject to applicable law.
                </p>

                <p>
                  Throughout this document, the terms &quot;Starlight Hotels&quot;, &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to Starlight Hotels. The terms &quot;User&quot;, &quot;Guest&quot;, and &quot;You&quot; refer to any individual or entity accessing the website, initiating inquiries, making reservations, or staying at Starlight Hotels.
                </p>

                <div className="mt-3.5 sm:mt-4 rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3 sm:p-4.5 min-w-0">
                  <div className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                    <ShieldCheck size={16} className="text-[#9B111E] shrink-0 mt-0.5" />
                    <p className="text-[10.5px] sm:text-xs font-semibold text-neutral-800 tracking-wide uppercase leading-relaxed min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                      THESE TERMS AND CONDITIONS CONSTITUTE AN ELECTRONIC RECORD UNDER THE INFORMATION TECHNOLOGY ACT, 2000, AND APPLICABLE RULES THEREUNDER. THESE TERMS DO NOT REQUIRE ANY PHYSICAL, ELECTRONIC, OR DIGITAL SIGNATURE TO BE EFFECTIVE BETWEEN YOU AND STARLIGHT HOTELS, SUBJECT TO APPLICABLE LAW.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 2: WEBSITE USE & GUEST CONDUCT ONLINE
            ==================================================== */}
            <section
              id="section-2"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    02
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Website Use &amp; Guest Conduct Online
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-2")}
                  aria-label="Copy link to Section 2"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-2" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  You may use this website for lawful purposes only, including browsing hotel accommodations, reviewing amenities, checking availability, contacting customer support, and making genuine room reservations.
                </p>

                <p className="font-semibold text-neutral-900">
                  When using this website, you agree not to:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Make fraudulent, speculative, false, or duplicate reservations;</li>
                  <li>Provide false, inaccurate, or misleading personal or booking information;</li>
                  <li>Engage in unauthorized automated data extraction, web scraping, or crawling of website content, rates, or media without prior written permission;</li>
                  <li>Attempt to compromise website security, interfere with system functionality, or bypass access controls;</li>
                  <li>Misuse the online booking engine or payment systems in any manner; or</li>
                  <li>Copy, reproduce, distribute, or commercially exploit website content, photographs, or branding without written authorization.</li>
                </ul>

                <p>
                  Starlight Hotels reserves the right to restrict or suspend access where there is reasonable evidence of misuse, fraudulent activity, unauthorized access, or violation of these Terms, subject to applicable law.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 3: RESERVATIONS & BOOKING CONFIRMATIONS
            ==================================================== */}
            <section
              id="section-3"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    03
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Reservations &amp; Booking Confirmations
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-3")}
                  aria-label="Copy link to Section 3"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-3" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  All room bookings made through the Starlight Hotels website, reservation desk, or authorized partners are subject to availability.
                </p>

                <p>
                  A reservation is confirmed only after the guest receives an official booking confirmation from Starlight Hotels or its authorized booking/payment provider with unique reservation details.
                </p>

                <p className="font-semibold text-neutral-900">
                  Guests are responsible for providing accurate and complete booking information, including:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Accurate guest names matching valid government-issued photo identification;</li>
                  <li>Valid contact details, including an active phone number and working email address;</li>
                  <li>Correct check-in and check-out dates;</li>
                  <li>An accurate declaration of the total number of guests, including adults and children; and</li>
                  <li>Valid payment details where required by the selected rate plan.</li>
                </ul>

                <p>
                  Guests must provide valid government identification when requested at check-in. Starlight Hotels reserves the right to verify booking information and guest identification.
                </p>

                <p>
                  Starlight Hotels may contact guests regarding their reservation using the contact details provided during booking.
                </p>

                <p>
                  Starlight Hotels reserves the right to cancel or refuse reservations that appear fraudulent, duplicate, speculative, misleading, or made in violation of these Terms, subject to applicable law and the applicable booking and cancellation conditions.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 4: CHECK-IN AND CHECK-OUT TIMINGS
            ==================================================== */}
            <section
              id="section-4"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    04
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Check-In and Check-Out Timings
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-4")}
                  aria-label="Copy link to Section 4"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-4" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  The official hotel timings for Starlight Hotels are:
                </p>

                <div className="my-3 sm:my-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full">
                  <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-5 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Official Check-In Time
                    </span>
                    <span className="mt-1 text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-neutral-900 block">
                      12:00 PM
                    </span>
                    <span className="mt-1 block text-xs text-neutral-600">
                      Standard room readiness upon arrival
                    </span>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-5 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Official Check-Out Time
                    </span>
                    <span className="mt-1 text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-neutral-900 block">
                      11:00 AM
                    </span>
                    <span className="mt-1 block text-xs text-neutral-600">
                      Room turnover for incoming guests
                    </span>
                  </div>
                </div>

                <p>
                  <strong>Early Check-In:</strong> Early check-in before 12:00 PM is subject to room availability upon arrival. Early check-in may be chargeable. The applicable charge will be communicated by Starlight Hotels at the time of inquiry, confirmation, or check-in.
                </p>

                <p>
                  <strong>Late Check-Out:</strong> Late check-out after 11:00 AM is subject to room availability and hotel operational requirements. Late check-out may be chargeable. The applicable charge will be communicated by Starlight Hotels.
                </p>

                <p>
                  Guests cannot assume early check-in or late check-out is guaranteed unless expressly confirmed by Starlight Hotels.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 5: EXTRA OCCUPANCY POLICY
            ==================================================== */}
            <section
              id="section-5"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    05
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Extra Occupancy Policy
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-5")}
                  aria-label="Copy link to Section 5"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-5" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Each room category at Starlight Hotels has a maximum permitted occupancy based on room size and safety standards.
                </p>

                <p>
                  Guests must accurately provide the correct number of occupants during the reservation process.
                </p>

                <p>
                  Additional occupants beyond the standard base occupancy are subject to room capacity, availability, and prior hotel approval.
                </p>

                <p>
                  <strong className="text-neutral-900 font-semibold">Extra occupancy is chargeable.</strong> Extra-person and/or extra-bed charges may apply. Applicable charges will be communicated during booking or directly by the hotel.
                </p>

                <p>
                  Starlight Hotels reserves the right to refuse occupancy exceeding the permitted room capacity for safety, operational, or regulatory reasons.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 6: LOCAL GUEST POLICY
            ==================================================== */}
            <section
              id="section-6"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    06
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Local Guest Policy
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-6")}
                  aria-label="Copy link to Section 6"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-6" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Starlight Hotels maintains specific booking, timing, and operational eligibility criteria for guest administration:
                </p>

                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 sm:p-5 min-w-0">
                  <p className="font-semibold text-neutral-900 mb-2.5 text-xs sm:text-sm">
                    Bookings involving local guests from the following locations are subject to specific check-in and check-out timing conditions:
                  </p>
                  <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-neutral-800 font-medium text-xs sm:text-sm mb-3">
                    <li>Cuddalore</li>
                    <li>Marakkanam</li>
                    <li>Tindivanam</li>
                    <li>Pondicherry / Puducherry</li>
                    <li>Villupuram</li>
                  </ul>

                  <div className="pt-2.5 border-t border-amber-200/80 text-xs sm:text-sm space-y-1.5 text-neutral-900">
                    <p className="flex items-start gap-2">
                      <Clock size={14} className="text-[#9B111E] shrink-0 mt-0.5" />
                      <span>
                        <strong>Check-In Restriction:</strong> Check-in is <strong>not permitted after 6:00 PM</strong> for bookings involving guests from these locations.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Clock size={14} className="text-[#9B111E] shrink-0 mt-0.5" />
                      <span>
                        <strong>Check-Out Requirement:</strong> Guests from these locations must complete check-out <strong>before 6:00 PM</strong>.
                      </span>
                    </p>
                  </div>
                </div>

                <p>
                  This condition is strictly a hotel booking eligibility and timing policy established for front-desk security and operational procedures. It is not a statement regarding the character, rights, or integrity of individuals from these areas.
                </p>

                <p>
                  Guests may be required to provide valid government-issued identification at check-in for verification of guest details, residential address, and booking eligibility.
                </p>

                <p>
                  Where a booking does not meet Starlight Hotels&apos; applicable booking or guest eligibility requirements, the hotel reserves the right to refuse check-in or require adherence to scheduled timings, subject to applicable law and the applicable booking and cancellation conditions.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 7: VISITOR POLICY
            ==================================================== */}
            <section
              id="section-7"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    07
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Visitor Policy
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-7")}
                  aria-label="Copy link to Section 7"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-7" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  To safeguard the privacy, comfort, and security of all resident guests, Starlight Hotels enforces the following visitor guidelines:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Visitors who are not registered guests are not permitted to access guest rooms;</li>
                  <li>Only guests included in the confirmed reservation may stay in the accommodation;</li>
                  <li>Unregistered visitors are not permitted to stay overnight;</li>
                  <li>Any person who wishes to stay overnight must be properly registered and approved by Starlight Hotels; and</li>
                  <li>Additional occupancy charges may apply to registered overnight guests.</li>
                </ul>

                <p>
                  Starlight Hotels may request identification from persons entering the property for security and operational purposes.
                </p>

                <p>
                  The hotel may restrict access to guest rooms or other restricted areas for security, safety, operational, or legal reasons.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 8: SMOKING POLICY & SAFETY
            ==================================================== */}
            <section
              id="section-8"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    08
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Smoking Policy &amp; Safety
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-8")}
                  aria-label="Copy link to Section 8"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-8" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Smoking is permitted inside guest rooms, subject to applicable law and any room-specific or property-specific safety requirements communicated by Starlight Hotels.
                </p>

                <p>
                  Smoking may be restricted in designated areas where required by applicable law, safety requirements, or hotel policy.
                </p>

                <p>
                  Guests are expected to dispose of smoking materials safely and responsibly to ensure the safety and wellbeing of all property occupants.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 9: GUEST CONDUCT & RESPONSIBILITIES
            ==================================================== */}
            <section
              id="section-9"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    09
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Guest Conduct &amp; Responsibilities
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-9")}
                  aria-label="Copy link to Section 9"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-9" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Guests are expected to behave respectfully and responsibly during their stay, with consideration for fellow guests, neighbors, and hotel personnel.
                </p>

                <p>
                  Guests must refrain from unreasonable noise, disruptive parties, verbal abuse, harassment, violence, or threatening behavior toward hotel employees, contractors, or other guests.
                </p>

                <p>
                  Engaging in illegal activities, unauthorized commercial operations, or misuse of hotel facilities on hotel premises is strictly prohibited.
                </p>

                <p>
                  Starlight Hotels may take appropriate action, including asking a guest to leave the property, where permitted by applicable law and hotel policy, if a guest engages in serious misconduct or violates safety instructions.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 10: PROPERTY DAMAGE & BREAKAGE
            ==================================================== */}
            <section
              id="section-10"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    10
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Property Damage &amp; Breakage
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-10")}
                  aria-label="Copy link to Section 10"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-10" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Guests may be held responsible for damage, loss, breakage, defacement, or unusual cleaning required for hotel property, furnishings, or equipment caused by the guest or members of their party, subject to applicable law.
                </p>

                <p>
                  Applicable repair, replacement, or cleaning charges may be recovered from the guest where legally permitted and where the damage or loss can reasonably be attributed to the guest or their party.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 11: CHILDREN AND ADDITIONAL GUESTS
            ==================================================== */}
            <section
              id="section-11"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    11
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Children and Additional Guests
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-11")}
                  aria-label="Copy link to Section 11"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-11" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Children are subject to the occupancy rules and capacity limits of the selected room category.
                </p>

                <p>
                  Additional guests may incur additional occupancy charges as communicated during the booking process or directly by the hotel.
                </p>

                <p>
                  Maximum permitted room occupancy limits must be observed at all times.
                </p>

                <p>
                  Parents and legal guardians are responsible for supervising children throughout their stay, including in public areas, swimming pools, and balconies.
                </p>

                <p>
                  Special arrangements, such as extra beds or cribs, are subject to availability and room suitability.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 12: SPECIAL REQUESTS
            ==================================================== */}
            <section
              id="section-12"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    12
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Special Requests
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-12")}
                  aria-label="Copy link to Section 12"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-12" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Starlight Hotels will make reasonable efforts to accommodate guest requests such as room preferences, bedding preferences, celebration arrangements, dietary requirements, accessibility requests, or other guest preferences.
                </p>

                <p>
                  However, special requests are subject to availability and operational feasibility and are not guaranteed unless expressly confirmed in writing by Starlight Hotels.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 13: HOTEL FACILITIES AND SERVICES
            ==================================================== */}
            <section
              id="section-13"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    13
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Hotel Facilities and Services
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-13")}
                  aria-label="Copy link to Section 13"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-13" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Hotel facilities, recreational amenities, swimming pools, dining areas, and auxiliary services are made available for guest enjoyment in accordance with hotel operational hours and safety policies.
                </p>

                <p>
                  Facilities and services may occasionally be unavailable due to routine maintenance, severe weather, safety requirements, private events, operational issues, or circumstances beyond the hotel&apos;s reasonable control, subject to applicable law and the specific booking conditions.
                </p>

                <p>
                  Information about facilities, operating hours, and amenities may change. Starlight Hotels will make reasonable efforts to communicate significant changes to affected guests where practical.
                </p>

                <p>
                  Service and consumption of alcoholic beverages, where provided, complies with applicable state excise regulations and hotel policy.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 14: RATES, TAXES AND PAYMENT
            ==================================================== */}
            <section
              id="section-14"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    14
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Rates, Taxes and Payment
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-14")}
                  aria-label="Copy link to Section 14"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-14" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Room rates are subject to availability and may change before a booking confirmation is issued.
                </p>

                <p>
                  The confirmed rate shown in the booking confirmation applies to the confirmed reservation, subject to its stated conditions.
                </p>

                <p>
                  Applicable taxes, service charges, or statutory levies will be displayed during the booking process or reflected in your booking invoice.
                </p>

                <p>
                  Payment terms depend on the selected rate plan (e.g., prepaid, deposit, or pay-at-hotel). Guests are responsible for providing valid payment information.
                </p>

                <p>
                  Online payments may be processed by authorized third-party payment providers. Guests must ensure authorized use of their chosen payment tender.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 15: CANCELLATION, MODIFICATION AND REFUNDS
            ==================================================== */}
            <section
              id="section-15"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    15
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Cancellation, Modification and Refunds
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-15")}
                  aria-label="Copy link to Section 15"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-15" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Cancellation, modification, refund, and no-show conditions vary according to the rate plan, offer, package, booking channel, and reservation selected by the guest.
                </p>

                <p>
                  The applicable cancellation and refund conditions will be displayed during the booking process and/or included in the booking confirmation.
                </p>

                <p>
                  By completing the reservation, the guest agrees to the cancellation and refund conditions applicable to that reservation.
                </p>

                <p>
                  Non-refundable bookings are subject to their stated non-refundable conditions. No-show conditions are governed by the applicable booking terms.
                </p>

                <p>
                  Refunds, where approved under the applicable reservation conditions, will be processed in accordance with the applicable booking and payment terms.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 16: OFFERS AND PROMOTIONS
            ==================================================== */}
            <section
              id="section-16"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    16
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Offers and Promotions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-16")}
                  aria-label="Copy link to Section 16"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-16" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Promotional offers, seasonal packages, and discounts are subject to availability and specific allocation.
                </p>

                <p>
                  Each offer may carry additional conditions, including specific booking and stay validity periods.
                </p>

                <p>
                  Offers cannot automatically be combined with other promotions, corporate rates, or special discounts unless explicitly stated.
                </p>

                <p>
                  Promotional benefits are subject to the conditions displayed with the offer and cannot be exchanged for cash.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 17: WEBSITE CONTENT & INTELLECTUAL PROPERTY
            ==================================================== */}
            <section
              id="section-17"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    17
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Website Content &amp; Intellectual Property
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-17")}
                  aria-label="Copy link to Section 17"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-17" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  All hotel photographs, videos, logos, text, graphics, room descriptions, website designs, branding, and other materials on this website are owned by or licensed to Starlight Hotels.
                </p>

                <p>
                  You may not copy, reproduce, modify, republish, or commercially exploit any content from the website without prior written permission from Starlight Hotels.
                </p>

                <p>
                  Reasonable efforts are made to keep website descriptions, facilities, and photographs accurate and current. However, room layouts, décor, views, facilities, and menus may change, and images are provided for general guidance.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 18: THIRD-PARTY SERVICES
            ==================================================== */}
            <section
              id="section-18"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    18
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Third-Party Services
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-18")}
                  aria-label="Copy link to Section 18"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-18" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  The website may use or link to third-party providers such as payment gateways, booking technology, maps, analytics, communication services, and social media integrations.
                </p>

                <p>
                  Third-party services are governed by their own terms of service and privacy policies. Starlight Hotels does not control and is not responsible for third-party systems outside its reasonable control.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 19: PRIVACY
            ==================================================== */}
            <section
              id="section-19"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    19
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Privacy
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-19")}
                  aria-label="Copy link to Section 19"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-19" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Personal information provided through the Website and booking process is handled in accordance with the Starlight Hotels Privacy Policy and applicable data-protection and privacy laws.
                </p>

                <p>
                  Guests may refer to our Privacy Policy for information regarding how personal information is collected, stored, and managed.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 20: LIMITATION OF LIABILITY
            ==================================================== */}
            <section
              id="section-20"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    20
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Limitation of Liability
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-20")}
                  aria-label="Copy link to Section 20"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-20" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  To the fullest extent permitted by applicable law, Starlight Hotels will not be liable for losses or damages arising from:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Temporary website downtime, maintenance, or connectivity interruptions;</li>
                  <li>Events or circumstances reasonably outside our control;</li>
                  <li>Reliance on inaccurate or incomplete information supplied by a guest; or</li>
                  <li>Third-party services, external websites, or payment intermediaries.</li>
                </ul>

                <p>
                  Guests are encouraged to take reasonable precautions with personal valuables. Vehicle parking, where available, is utilized at the vehicle owner&apos;s risk, subject to applicable law.
                </p>

                <p>
                  Nothing in these Terms is intended to exclude or limit any liability or consumer right that cannot lawfully be excluded or limited under applicable law.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 21: FORCE MAJEURE
            ==================================================== */}
            <section
              id="section-21"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    21
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Events Beyond Reasonable Control (Force Majeure)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-21")}
                  aria-label="Copy link to Section 21"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-21" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Starlight Hotels will not be responsible for failure or delay in providing services or accommodations where such failure or delay results from circumstances beyond the hotel&apos;s reasonable control.
                </p>

                <p>
                  Such circumstances may include natural disasters, severe weather, flooding, government restrictions, public emergencies, infrastructure failures, power or telecommunications failures, strikes, civil disturbances, or other unforeseeable events beyond reasonable control.
                </p>

                <p>
                  In such events, Starlight Hotels will work with guests in accordance with the applicable booking conditions and hotel procedures where practical.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 22: GOVERNING LAW & DISPUTE RESOLUTION
            ==================================================== */}
            <section
              id="section-22"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    22
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Governing Law &amp; Dispute Resolution
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-22")}
                  aria-label="Copy link to Section 22"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-22" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  These Terms shall be governed by the applicable laws of India.
                </p>

                <p>
                  Any dispute arising from the use of the Website, reservations, or hotel services shall be subject to the jurisdiction of the competent courts, subject to applicable law.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 23: CHANGES TO THESE TERMS
            ==================================================== */}
            <section
              id="section-23"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    23
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Changes to These Terms
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-23")}
                  aria-label="Copy link to Section 23"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-23" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  Starlight Hotels may update these Terms from time to time. The latest version will be published on the website with the updated date.
                </p>

                <p>
                  For existing confirmed reservations, the booking-specific terms applicable at the time of confirmation should continue to govern that reservation unless otherwise permitted by applicable law.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 24: CONTACT INFORMATION
            ==================================================== */}
            <section
              id="section-24"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    24
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Contact Information
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-24")}
                  aria-label="Copy link to Section 24"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-24" ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[13px] sm:text-[14px] md:text-[14.5px] leading-[1.7] sm:leading-[1.8] text-neutral-700 font-normal break-words [overflow-wrap:anywhere] min-w-0">
                <p>
                  If you have questions regarding these Terms &amp; Conditions, your reservation, or hotel policies, please contact Starlight Hotels using our official contact details:
                </p>

                <div className="mt-3.5 sm:mt-4 rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-6 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <h3 className="text-xs sm:text-sm md:text-base font-serif font-bold text-neutral-900 tracking-wide truncate">
                      Starlight Hotels Guest Concierge
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm min-w-0">
                    <div className="rounded-lg bg-white p-3 sm:p-4 border border-neutral-200/80 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Direct Inquiries &amp; Bookings
                      </span>
                      <a
                        href="tel:+918270660904"
                        className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#9B111E] flex items-center gap-1.5"
                      >
                        <Phone size={13} className="text-[#9B111E] shrink-0" />
                        <span>+91 8270660904</span>
                      </a>
                      <span className="block text-[11px] text-neutral-500 mt-1">
                        Reservations &amp; Front Desk Assistance
                      </span>
                    </div>

                    <div className="rounded-lg bg-white p-3 sm:p-4 border border-neutral-200/80 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Official Correspondence
                      </span>
                      <a
                        href="mailto:info@starlighthotels.in"
                        className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#9B111E] flex items-center gap-1.5 min-w-0"
                      >
                        <Mail size={13} className="text-[#9B111E] shrink-0" />
                        <span className="break-all min-w-0">info@starlighthotels.in</span>
                      </a>
                      <span className="block text-[11px] text-neutral-500 mt-1">
                        General Support &amp; Policy Inquiries
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ============================================================
          PRINT-ONLY OFFICIAL DOCUMENT FOOTER
      ============================================================ */}
      <div className="hidden print-only mt-8 pt-4 border-t border-neutral-300 text-[8pt] text-neutral-500 text-center">
        Starlight Hotels • Official Terms &amp; Conditions • For reservations and inquiries: info@starlighthotels.in | +91 8270660904 • www.starlighthotels.in
      </div>

      {/* ============================================================
          FLOATING BOTTOM CONTROLS (SCREEN ONLY)
      ============================================================ */}
      {/* Mobile Floating Table of Contents Pill */}
      <div className="lg:hidden fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-40 print-hide">
        <button
          type="button"
          onClick={() => setMobileTocOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-neutral-900/95 text-white px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-semibold shadow-2xl border border-neutral-700/80 backdrop-blur-md transition-all hover:bg-neutral-800 active:scale-95"
          aria-label="Open Table of Contents"
        >
          <Menu size={13} className="text-[#D7A441]" />
          <span>Clauses (24)</span>
        </button>
      </div>

      {/* Floating Action Buttons (Right, Screen Only) */}
      {/* Floating Action Buttons (Right, Screen Only) */}
      <aside
        aria-label="Quick contact and navigation"
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center gap-2.5 sm:gap-3 print-hide"
      >
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll back to top"
            className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-lg transition-all duration-300 hover:bg-neutral-50 hover:text-neutral-950 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ArrowUp size={18} className="stroke-[2.5]" />
            <span className="pointer-events-none absolute right-full mr-2.5 hidden rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md opacity-0 group-hover:opacity-100 sm:block transition-opacity whitespace-nowrap">
              Scroll to top
            </span>
          </button>
        )}

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/918270660904"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_22px_rgba(37,211,102,0.55)] active:scale-95 cursor-pointer"
        >
          <svg viewBox="0 0 448 512" className="h-5 w-5 sm:h-5.5 sm:w-5.5 fill-white" aria-hidden="true">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
          <span className="pointer-events-none absolute right-full mr-2.5 hidden rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md opacity-0 group-hover:opacity-100 sm:block transition-opacity whitespace-nowrap">
            WhatsApp Support
          </span>
        </a>

        {/* Email Support Button */}
        <a
          href="mailto:info@starlighthotels.in"
          aria-label="Email support"
          className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#EA4335] text-white shadow-[0_4px_16px_rgba(234,67,53,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_22px_rgba(234,67,53,0.55)] active:scale-95 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-5.5 sm:w-5.5 fill-white" aria-hidden="true">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          <span className="pointer-events-none absolute right-full mr-2.5 hidden rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md opacity-0 group-hover:opacity-100 sm:block transition-opacity whitespace-nowrap">
            Email Support
          </span>
        </a>
      </aside>

      {/* ============================================================
          ALL-IN-ONE SHARE MODAL (COVERS ALL SHARE PLATFORMS)
      ============================================================ */}
      {shareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print-hide"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-neutral-200 transition-all animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-[#9B111E]">
                  <Share2 size={16} />
                </span>
                <div>
                  <h3 id="share-modal-title" className="text-sm sm:text-base font-serif font-bold text-neutral-900">
                    Share Terms &amp; Conditions
                  </h3>
                  <span className="text-[11px] text-neutral-500 block">
                    Starlight Hotels Official Policies
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
                aria-label="Close share dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Social & Messaging Channels Grid */}
            <div className="mt-4">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                Select a Channel
              </span>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `${shareTitle}\n\n${shareText}\n${currentUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-center transition hover:border-[#25D366] hover:bg-emerald-50/40 group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition group-hover:scale-105">
                    <svg viewBox="0 0 448 512" className="h-4.5 w-4.5 fill-white">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-800">WhatsApp</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    shareTitle
                  )}&body=${encodeURIComponent(
                    `Hello,\n\nPlease find the official Terms & Conditions and Guest Policies for Starlight Hotels:\n\n${currentUrl}\n\nKey Policies Overview:\n• Check-In: 12:00 PM | Check-Out: 11:00 AM\n• Local Guest Check-In & Check-Out Cutoff: 6:00 PM\n• Smoking: Permitted inside guest rooms (safe disposal required)\n• Contact: +91 8270660904 | info@starlighthotels.in`
                  )}`}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-center transition hover:border-[#DC2626] hover:bg-red-50/40 group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DC2626] text-white shadow-sm transition group-hover:scale-105">
                    <Mail size={16} />
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-800">Email</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    currentUrl
                  )}&text=${encodeURIComponent(shareTitle)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-center transition hover:border-[#0088cc] hover:bg-sky-50/40 group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-sm transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-1.12 5.093-1.6 7.375-.203.967-.563 1.291-.909 1.322-.751.069-1.322-.497-2.05-.974-.984-.645-1.541-1.047-2.496-1.676-1.103-.728-.388-1.128.241-1.782.164-.171 3.023-2.77 3.078-3.007.007-.03.013-.142-.054-.201-.067-.058-.165-.038-.236-.023-.1.023-1.7 1.082-4.8 3.176-.454.312-.865.464-1.233.456-.406-.009-1.187-.23-1.768-.419-.712-.232-1.278-.354-1.229-.747.026-.205.309-.414.851-.629 3.336-1.452 5.562-2.41 6.677-2.875 3.176-1.324 3.837-1.554 4.269-1.562.095-.002.308.022.446.134.117.095.149.223.164.313-.001.058.008.232-.008.358z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-800">Telegram</span>
                </a>

                {/* X (Twitter) */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `${shareTitle} - ${currentUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-center transition hover:border-black hover:bg-neutral-100 group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-sm transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-800">X (Twitter)</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    currentUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-center transition hover:border-[#0077B5] hover:bg-blue-50/40 group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0077B5] text-white shadow-sm transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-800">LinkedIn</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    currentUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-center transition hover:border-[#1877F2] hover:bg-blue-50/40 group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-800">Facebook</span>
                </a>
              </div>
            </div>

            {/* Native Device Share Trigger */}
            {typeof navigator !== "undefined" && navigator.share && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={triggerNativeShare}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-100"
                >
                  <Smartphone size={15} className="text-[#9B111E]" />
                  <span>More Sharing Options (Device Native Menu)</span>
                  <ExternalLink size={12} className="text-neutral-400" />
                </button>
              </div>
            )}

            {/* Copy Direct URL Box */}
            <div className="mt-4 pt-3.5 border-t border-neutral-100">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Or Copy Link
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1.5 pl-3">
                <Globe size={14} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-transparent text-xs text-neutral-700 outline-none truncate font-mono"
                />
                <button
                  type="button"
                  onClick={copyShareModalUrl}
                  className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 shrink-0"
                >
                  {copiedModalLink ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          GLOBAL FOOTER (SCREEN ONLY)
      ============================================================ */}
      <div className="print-hide">
        <Footer />
      </div>
    </div>
  );
}
