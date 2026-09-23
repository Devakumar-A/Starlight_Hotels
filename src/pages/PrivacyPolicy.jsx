import {
  ArrowUp,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Mail,
  Menu,
  Phone,
  Printer,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import starLogo from "../assets/brand/starlight-favicon.png";
import Footer from "../components/layout/Footer";

const SECTIONS = [
  { id: "section-1", number: "01", title: "Introduction & Overview" },
  { id: "section-2", number: "02", title: "Scope of This Policy" },
  { id: "section-3", number: "03", title: "Information We May Collect" },
  { id: "section-4", number: "04", title: "Special Requests & Preferences" },
  { id: "section-5", number: "05", title: "Automatically Collected Information" },
  { id: "section-6", number: "06", title: "Cookies & Similar Technologies" },
  { id: "section-7", number: "07", title: "Purposes of Processing" },
  { id: "section-8", number: "08", title: "Legal Basis & Permitted Processing" },
  { id: "section-9", number: "09", title: "Consent & Withdrawal" },
  { id: "section-10", number: "10", title: "Reservation Communications" },
  { id: "section-11", number: "11", title: "Marketing Communications" },
  { id: "section-12", number: "12", title: "Sharing Personal Information" },
  { id: "section-13", number: "13", title: "Data Processors & Service Providers" },
  { id: "section-14", number: "14", title: "Third-Party Links & Services" },
  { id: "section-15", number: "15", title: "Data Security" },
  { id: "section-16", number: "16", title: "Data Retention Principles" },
  { id: "section-17", number: "17", title: "Access, Correction & Deletion" },
  { id: "section-18", number: "18", title: "Children's Information" },
  { id: "section-19", number: "19", title: "Cross-Border Data Processing" },
  { id: "section-20", number: "20", title: "Hotel Security & CCTV" },
  { id: "section-21", number: "21", title: "Fraud & Security Monitoring" },
  { id: "section-22", number: "22", title: "Legal & Regulatory Disclosures" },
  { id: "section-23", number: "23", title: "Business Transfers" },
  { id: "section-24", number: "24", title: "India DPDP Framework & Updates" },
  { id: "section-25", number: "25", title: "Privacy Contact & Grievances" },
];

export default function PrivacyPolicy() {
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
          title: "Starlight Hotels - Privacy Policy",
          text: "Official Privacy Policy and Personal Data Practices for Starlight Hotels.",
          url: window.location.href,
        })
        .catch(() => {});
    }
  };

  const printDocument = () => {
    window.print();
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "Starlight Hotels - Official Privacy Policy";
  const shareText = "Review the official Privacy Policy and Personal Data Protection Guidelines for Starlight Hotels:";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-800 font-sans antialiased selection:bg-[#FEE2E2] selection:text-[#9B111E] overflow-x-hidden w-full max-w-full relative">
      {/* ============================================================
          PRINT STYLESHEET
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
              aria-label="Print Privacy Policy"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            {/* Share Button */}
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
              to="/terms"
              className="hidden md:inline-block text-xs font-semibold text-neutral-800 transition hover:text-[#9B111E]"
            >
              Terms &amp; Conditions
            </Link>

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
                to="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-neutral-900 hover:text-[#9B111E]"
              >
                Terms &amp; Conditions
              </Link>
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
              LUXURY STAYS &amp; RESORTS • OFFICIAL PRIVACY POLICY DOCUMENT
            </span>
          </div>
          <div className="text-right text-[9.5pt] text-neutral-600 leading-tight">
            <div><strong>Document Ref:</strong> ST-PP-2026-V1</div>
            <div><strong>Effective Date:</strong> 15 September 2026</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-200 grid grid-cols-3 gap-2 text-[8.5pt] text-neutral-700">
          <div>
            <strong className="text-neutral-900 block">Applicability:</strong>
            Reservations, Website &amp; Hotel Operations
          </div>
          <div>
            <strong className="text-neutral-900 block">Framework:</strong>
            Indian Law &amp; DPDP Act, 2023 Principles
          </div>
          <div className="text-right">
            <strong className="text-neutral-900 block">Privacy Contact:</strong>
            info@starlighthotels.in | +91 8270660904
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
              Privacy Policy
            </h1>

            <div className="mt-2.5 sm:mt-4 flex items-center gap-2 text-xs text-neutral-400">
              <Clock size={13} className="text-[#D7A441] shrink-0" />
              <span>Last Updated: <strong className="text-white font-medium">15 September 2026</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          KEY PRIVACY PRINCIPLES AT-A-GLANCE (SCREEN ONLY)
      ============================================================ */}
      <section className="border-b border-neutral-200 bg-white w-full max-w-full print-hide">
        <div className="mx-auto max-w-[1400px] w-full px-3.5 sm:px-6 lg:px-12 py-5 sm:py-8 lg:py-10">
          <div className="mb-3.5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#9B111E]">
                Quick Reference
              </span>
              <h2 className="mt-0.5 sm:mt-1 text-base sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900">
                Key Privacy Principles At-a-Glance
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 max-w-md">
              A summary of how your personal data is handled. Please consult the full numbered clauses below for complete details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Card 1: Data Collection */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-red-50 text-[#9B111E]">
                  <UserCheck size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 03
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Data We Collect
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Guest identity, contact information, reservation parameters, and transaction references necessary to fulfill your stay.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-3")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Card 2: No Sale of Data */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                  <ShieldCheck size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 12
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                No Sale of Data
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Starlight Hotels does not sell personal information. Information is shared only with trusted operational partners.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-12")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Card 3: Security & Safeguards */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
                  <Lock size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 15
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Reasonable Security
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                We take reasonable technical and organizational precautions to protect data against unauthorized access, loss, or misuse.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-15")}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Read clause</span>
                <ChevronRight size={11} />
              </button>
            </div>

            {/* Card 4: Guest Rights & Contact */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3.5 sm:p-5 transition hover:border-[#9B111E]/40 hover:shadow-sm w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                  <Shield size={15} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Clause 17 &amp; 25
                </span>
              </div>
              <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base font-serif font-bold text-neutral-900">
                Guest Rights &amp; Contact
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
                Access, correct, or request deletion of personal information subject to applicable law via info@starlighthotels.in.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("section-17")}
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
          MAIN CONTENT AREA (STICKY SIDEBAR + 25 EDITORIAL CLAUSES)
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
                  Table of Contents (25 Clauses)
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
                  placeholder="Filter clauses (e.g. cookies, retention)..."
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
                  25 Clauses
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
                  placeholder="Search clauses (e.g. cookies, rights)..."
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
                <span>Have a privacy inquiry?</span>
                <a
                  href="mailto:info@starlighthotels.in"
                  className="font-semibold text-[#9B111E] hover:underline"
                >
                  Contact Concierge
                </a>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 lg:p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Starlight Hotels Privacy Desk
              </h4>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Direct inquiries regarding personal data access, correction, deletion, or privacy practices.
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
              RIGHT CONTENT AREA (THE FULL 25 PRIVACY CLAUSES)
          ======================================================== */}
          <main className="lg:col-span-8 space-y-6 sm:space-y-8 lg:space-y-10 min-w-0 w-full">
            {/* ====================================================
                CLAUSE 1: INTRODUCTION & OVERVIEW
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
                    Introduction &amp; Overview
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
                  Starlight Hotels respects your privacy and is committed to protecting the personal information entrusted to us.
                </p>

                <p>
                  This Privacy Policy explains how Starlight Hotels collects, uses, discloses, stores, and protects personal information when you visit our website, make a reservation, contact us, use our services, or otherwise interact with us.
                </p>

                <p>
                  When accessing our website or using our booking facilities, guests are advised to read this Privacy Policy together with the Starlight Hotels <Link to="/terms" className="text-[#9B111E] font-medium hover:underline">Terms &amp; Conditions</Link> and the specific reservation conditions applicable to your booking. Merely browsing the website does not mean you have consented to every possible form of data processing; where consent is required by applicable law, we seek it in an appropriate manner.
                </p>

                <p>
                  Throughout this Privacy Policy, the terms &quot;Starlight Hotels&quot;, &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to Starlight Hotels as a common hospitality brand. The terms &quot;Guest&quot;, &quot;User&quot;, and &quot;You&quot; refer to any visitor, customer, or prospective guest interacting with Starlight Hotels.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 2: SCOPE OF THIS POLICY
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
                    Scope of This Policy
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
                  This Privacy Policy applies to personal information collected by or on behalf of Starlight Hotels through:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>The Starlight Hotels website and online booking pages;</li>
                  <li>Online booking forms, reservation requests, and availability inquiries;</li>
                  <li>Customer contact and general enquiry forms;</li>
                  <li>Telephone inquiries and customer support communications;</li>
                  <li>Email communications with our reservation and support desks;</li>
                  <li>WhatsApp or other official messaging channels where utilized;</li>
                  <li>Hotel stay-related interactions, guest registration, and check-in/check-out administration;</li>
                  <li>In-stay service requests, housekeeping requests, and concierge inquiries;</li>
                  <li>Promotional communications, seasonal offers, and guest newsletters where opted into; and</li>
                  <li>Other digital touchpoints operated by or for Starlight Hotels.</li>
                </ul>

                <p>
                  Please note that third-party platforms, such as online travel agencies, independent booking portals, external payment gateways, or third-party mapping providers, operate under their own independent privacy notices.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 3: INFORMATION WE MAY COLLECT
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
                    Information We May Collect
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
                  Depending on the manner in which you interact with Starlight Hotels, we may collect information falling within the following categories:
                </p>

                <div className="space-y-4 pt-1">
                  {/* Category A */}
                  <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-4.5">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-neutral-900 mb-1.5">
                      A. Guest Identity Information
                    </h3>
                    <p className="text-xs text-neutral-600 mb-2">
                      Depending on the service utilized, Starlight Hotels may collect:
                    </p>
                    <ul className="space-y-1 list-disc pl-4 text-xs text-neutral-700">
                      <li>Full legal name;</li>
                      <li>Date of birth or age where necessary for booking administration;</li>
                      <li>Nationality where required by applicable hotel regulations;</li>
                      <li>Government-issued identification details where required for reservation, guest registration, legal, security, or operational purposes;</li>
                      <li>Guest registration card details upon arrival; and</li>
                      <li>Information concerning accompanying guests where provided by the person completing the reservation.</li>
                    </ul>
                  </div>

                  {/* Category B */}
                  <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-4.5">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-neutral-900 mb-1.5">
                      B. Contact Information
                    </h3>
                    <p className="text-xs text-neutral-600 mb-2">
                      Contact details may include:
                    </p>
                    <ul className="space-y-1 list-disc pl-4 text-xs text-neutral-700">
                      <li>Mobile phone number and telephone number;</li>
                      <li>Email address;</li>
                      <li>Postal address and residential location;</li>
                      <li>Billing address where necessary; and</li>
                      <li>Preferred communication channels.</li>
                    </ul>
                    <p className="text-[11px] text-neutral-500 mt-2">
                      Contact details are used primarily to administer bookings, communicate check-in instructions, and provide customer support.
                    </p>
                  </div>

                  {/* Category C */}
                  <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-4.5">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-neutral-900 mb-1.5">
                      C. Reservation Information
                    </h3>
                    <p className="text-xs text-neutral-600 mb-2">
                      Details concerning your stay arrangements, including:
                    </p>
                    <ul className="space-y-1.5 list-disc pl-4 text-xs text-neutral-700">
                      <li>Check-in date and check-out date;</li>
                      <li>Number of adults, children, and additional occupants;</li>
                      <li>Number of rooms and selected room category;</li>
                      <li>Unique booking reference and voucher details;</li>
                      <li>Selected rate plan and applicable cancellation conditions;</li>
                      <li>Special requests or service preferences submitted by the guest;</li>
                      <li>Booking source (e.g. direct website booking, phone desk, or partner); and</li>
                      <li>Reservation history where legitimately required for ongoing hotel operations.</li>
                    </ul>
                  </div>

                  {/* Category D */}
                  <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-4.5">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-neutral-900 mb-1.5">
                      D. Payment and Transaction Information
                    </h3>
                    <p className="text-xs text-neutral-700 leading-relaxed mb-2">
                      Depending on the chosen payment method, Starlight Hotels or its authorized payment provider may process payment status, transaction references, amounts paid, payment method type, and billing information.
                    </p>
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-[11px] text-neutral-600">
                      <strong>Payment Handling Notice:</strong> Where payments are processed through third-party payment providers, payment card or banking information may be processed directly by those providers according to their applicable privacy and security practices. Starlight Hotels may receive transaction-related information necessary to confirm and administer the payment.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 4: SPECIAL REQUESTS AND PREFERENCES
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
                    Special Requests &amp; Preferences
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
                  Guests may voluntarily provide specific personal preferences during reservation or in-stay interactions, such as:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Dietary preferences or restrictions;</li>
                  <li>Accessibility requirements or mobility assistance requests;</li>
                  <li>Room preferences (such as quiet location, specific floor, or view);</li>
                  <li>Bedding arrangements and extra cot requests;</li>
                  <li>Celebration details (such as anniversary or birthday notes); and</li>
                  <li>Other voluntary service requests.</li>
                </ul>

                <p>
                  Certain requests—such as dietary restrictions or accessibility needs—may touch upon sensitive personal preferences. Starlight Hotels uses such information solely to the extent reasonably necessary to fulfill the requested hospitality service. Starlight Hotels does not routinely request or collect sensitive health or personal data.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 5: INFORMATION COLLECTED AUTOMATICALLY
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
                    Automatically Collected Information
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
                  When visitors browse or use the Starlight Hotels website, certain technical information may be collected automatically by the website or its infrastructure providers, including:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Internet Protocol (IP) address;</li>
                  <li>Browser type, version, and language preferences;</li>
                  <li>Device type, model, screen resolution, and operating system;</li>
                  <li>Approximate geographic location derived from IP address (such as city or region level);</li>
                  <li>Pages visited, time spent on pages, and navigation paths;</li>
                  <li>Referring URL or origin page;</li>
                  <li>Date, timestamp, and duration of access; and</li>
                  <li>System error logs and performance indicators.</li>
                </ul>

                <p>
                  Starlight Hotels does not track or collect precise GPS real-time location data through the website unless explicitly requested by the user for a specific feature and authorized through device permissions.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 6: COOKIES & SIMILAR TECHNOLOGIES
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
                    Cookies &amp; Similar Technologies
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
                  Starlight Hotels may utilize cookies, local browser storage, and similar digital technologies to support website functionality. These technologies may serve purposes including:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li><strong>Essential Functionality:</strong> Maintaining user sessions, enabling room searches, and remembering selected booking dates;</li>
                  <li><strong>Preferences:</strong> Retaining guest choices, display settings, and interface configurations;</li>
                  <li><strong>Performance &amp; Reliability:</strong> Detecting system errors, balancing server load, and speeding up page load times;</li>
                  <li><strong>Security:</strong> Safeguarding against fraudulent form submissions and automated bot traffic; and</li>
                  <li><strong>Usage Insight:</strong> Understanding general site visitation patterns to improve website navigation and booking workflows.</li>
                </ul>

                <p>
                  Guests can control, restrict, or delete cookies through their browser settings or available preferences. Please note that disabling essential cookies may impact the proper functioning of certain website and booking features.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 7: PURPOSES OF PROCESSING
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
                    Purposes of Processing Personal Information
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
                  Starlight Hotels collects and processes personal information exclusively for purposes connected to our hospitality services, including:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Processing and managing room reservations
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Issuing official booking confirmations
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Delivering accommodation and hospitality services
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Administering check-in and check-out procedures
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Communicating reservation updates and reminders
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Facilitating billing, payments, and eligible refunds
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Responding to guest inquiries and service queries
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Providing responsive customer and concierge support
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Accommodating confirmed special requests
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Maintaining guest safety, premises security, and order
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Detecting and preventing fraudulent bookings or misuse
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Maintaining business, financial, and tax records
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Enhancing website usability and stay quality
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Sending promotional messages where permitted by law
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Complying with statutory reporting requirements
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5">
                    • Protecting the legal rights of guests and Starlight Hotels
                  </div>
                </div>

                <p className="text-xs text-neutral-500 pt-1">
                  Starlight Hotels does not process guest data for purposes unrelated to genuine hotel management, hospitality delivery, or statutory compliance.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 8: LEGAL BASIS & PERMITTED PROCESSING
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
                    Legal Basis &amp; Permitted Processing
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
                  Starlight Hotels processes personal data where permitted under applicable Indian law, including circumstances where processing is necessary:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li><strong>Contractual Fulfillment:</strong> To perform, administer, and execute a room booking or hospitality service requested by the guest;</li>
                  <li><strong>Legal Compliance:</strong> To satisfy statutory hospitality regulations, taxation laws, municipal requirements, or official record-keeping duties;</li>
                  <li><strong>Security &amp; Fraud Prevention:</strong> To protect property safety, secure digital booking systems, and prevent financial or identity fraud;</li>
                  <li><strong>Consent:</strong> Where the guest has provided clear, voluntary consent for a specific, defined purpose; and</li>
                  <li><strong>Legitimate Operational Needs:</strong> For other lawful purposes recognized under applicable law.</li>
                </ul>

                <p>
                  We do not state that every operational processing activity relies exclusively on consent; where a contract or legal obligation necessitates processing, data is handled accordingly.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 9: CONSENT & WITHDRAWAL
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
                    Consent &amp; Withdrawal of Consent
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
                  Where processing requires personal consent under applicable law, Starlight Hotels seeks consent in a clear, specific, understandable, and voluntary manner.
                </p>

                <p>
                  Consenting to promotional marketing is not a prerequisite for making a room reservation at Starlight Hotels. Guests may decline promotional communications at any time without impacting their accommodation reservation.
                </p>

                <p>
                  Where processing is based upon consent, guests possess the right to withdraw such consent by contacting <a href="mailto:info@starlighthotels.in" className="text-[#9B111E] font-medium hover:underline">info@starlighthotels.in</a>. Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal. However, withdrawing consent may affect our ability to provide specific customized services where that information is fundamentally necessary.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 10: RESERVATION COMMUNICATIONS
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
                    Reservation &amp; Service Communications
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
                  Starlight Hotels sends necessary transactional and service communications relating to your booking, including:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Booking confirmation vouchers and reservation receipts;</li>
                  <li>Schedule modifications, amendments, or cancellation acknowledgments;</li>
                  <li>Payment receipts, pending balance notifications, and refund status updates;</li>
                  <li>Pre-arrival check-in information and arrival logistics;</li>
                  <li>Check-out notices and invoice delivery; and</li>
                  <li>Important operational notifications (such as severe weather advisories or emergency notices).</li>
                </ul>

                <p>
                  Because these messages directly concern the administration and safety of an active reservation, they are sent regardless of whether a guest has opted out of promotional marketing.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 11: MARKETING COMMUNICATIONS
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
                    Marketing Communications &amp; Preferences
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
                  Where permitted by applicable law and subject to your communication choices, Starlight Hotels may share information about:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Special seasonal packages and room offers;</li>
                  <li>Exclusive member rates or promotional discount codes;</li>
                  <li>Hotel dining experiences, retreats, and destination highlights; and</li>
                  <li>Starlight Hotels news and announcements.</li>
                </ul>

                <p>
                  Guests can opt out of promotional communications at any time by clicking the unsubscribe link contained within marketing emails or by contacting <a href="mailto:info@starlighthotels.in" className="text-[#9B111E] font-medium hover:underline">info@starlighthotels.in</a> with their opt-out request.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 12: SHARING PERSONAL INFORMATION
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
                    Sharing of Personal Information
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
                <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-5">
                  <p className="font-semibold text-neutral-900 text-xs sm:text-sm">
                    Core Commitment: Starlight Hotels does not sell personal information as a business practice.
                  </p>
                </div>

                <p>
                  We may disclose personal data to trusted external service providers where reasonably necessary to deliver hospitality operations, including:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Authorized booking engine and reservation management providers;</li>
                  <li>Payment gateway and banking partners processing authorized transactions;</li>
                  <li>Property management software and hospitality operations vendors;</li>
                  <li>Secure cloud hosting, website infrastructure, and database providers;</li>
                  <li>Customer communication, messaging, and support desk service providers;</li>
                  <li>IT security, firewall, and fraud prevention vendors;</li>
                  <li>Professional accounting, tax, auditing, and legal advisors; and</li>
                  <li>Government authorities or law enforcement agencies where legally required under applicable Indian statutory process.</li>
                </ul>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 13: DATA PROCESSORS & SERVICE PROVIDERS
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
                    Third-Party Processors &amp; Service Providers
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
                  Third-party service providers process personal data on behalf of Starlight Hotels only for specified operational purposes and under our instructions.
                </p>

                <p>
                  Where appropriate, Starlight Hotels uses reasonable contractual, technical, or organizational measures to ensure that service providers maintain adequate confidentiality and handle information in compliance with applicable legal requirements.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 14: THIRD-PARTY LINKS & SERVICES
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
                    Third-Party Websites &amp; Integrations
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
                  The Starlight Hotels website may contain links, widgets, or integrations involving external services, such as payment gateways, map directions, social media channels, or partner portals.
                </p>

                <p>
                  Once you leave the Starlight Hotels website, your browsing activity is governed by the independent privacy policies and terms of those third parties. Starlight Hotels does not control and is not responsible for the privacy practices or content of third-party platforms outside its reasonable control.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 15: DATA SECURITY
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
                    Data Security &amp; Protection Measures
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
                  Starlight Hotels takes reasonable technical and organizational measures designed to protect personal information against unauthorized access, accidental loss, disclosure, misuse, alteration, or destruction.
                </p>

                <p>
                  These measures include restricted access to administrative systems, password protections, firewalls, and operational protocols for staff handling guest information.
                </p>

                <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-5">
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    <strong>Important Security Notice:</strong> While Starlight Hotels takes reasonable measures to protect personal information, no method of transmission over the Internet or electronic storage can be guaranteed to be completely secure. Guests are encouraged to exercise caution when transmitting personal or payment information over public networks.
                  </p>
                </div>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 16: DATA RETENTION PRINCIPLES
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
                    Data Retention Principles
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
                  Starlight Hotels retains personal information generally only for as long as reasonably necessary to fulfill the purposes for which it was collected, including:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Delivering hospitality and room accommodation services;</li>
                  <li>Managing ongoing or future reservations and stay inquiries;</li>
                  <li>Maintaining statutory financial, tax, and accounting ledgers;</li>
                  <li>Meeting statutory hotel guest registry and legal reporting obligations;</li>
                  <li>Resolving operational disputes and enforcing terms of agreement; and</li>
                  <li>Protecting legitimate business interests where permitted by applicable law.</li>
                </ul>

                <p>
                  Retention periods vary depending upon the nature of the data and applicable statutory requirements under Indian law. When information is no longer needed, it is deleted or de-identified in accordance with standard procedures.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 17: ACCESS, CORRECTION & DELETION
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
                    Data Access, Correction &amp; Deletion Requests
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
                  Subject to applicable law, guests have rights regarding personal information held by Starlight Hotels, including rights to:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Request confirmation or access to personal data processed by Starlight Hotels;</li>
                  <li>Request correction, updating, or completion of inaccurate personal records;</li>
                  <li>Request erasure or deletion of personal data where permitted by applicable law;</li>
                  <li>Withdraw consent previously provided for specific processing activities; and</li>
                  <li>Raise a privacy inquiry or grievance with Starlight Hotels.</li>
                </ul>

                <p>
                  <strong>Limitations on Deletion:</strong> Immediate deletion may not always be legally possible where Starlight Hotels is required or permitted by applicable law to retain specific records for statutory hotel compliance, tax and accounting records, dispute resolution, security protection, or the defense of legal claims.
                </p>

                <p>
                  To exercise any applicable right, please submit a written request to <a href="mailto:info@starlighthotels.in" className="text-[#9B111E] font-medium hover:underline">info@starlighthotels.in</a> with adequate verification details so we can authenticate your request.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 18: CHILDREN'S INFORMATION
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
                    Children&apos;s Information
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
                  Hotel room bookings may involve details regarding children when provided by a parent, legal guardian, or accompanying adult completing the reservation.
                </p>

                <p>
                  Such information (such as age category or extra bedding requirements) is processed only as necessary to provide appropriate accommodation, ensure room capacity compliance, and deliver requested hospitality amenities.
                </p>

                <p>
                  Starlight Hotels does not knowingly solicit or collect personal information directly from unaccompanied children through the website. Where applicable, processing concerning minors is handled in accordance with applicable Indian law.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 19: CROSS-BORDER DATA PROCESSING
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
                    Cross-Border Data Processing
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
                  Starlight Hotels operates in India. However, authorized third-party service providers (such as cloud hosting providers, secure content delivery networks, or communication software) may maintain server infrastructure in other jurisdictions.
                </p>

                <p>
                  Where cross-border processing occurs, it is conducted subject to applicable legal requirements and appropriate operational safeguards in accordance with applicable Indian data protection laws.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 20: HOTEL SECURITY & CCTV
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
                    Hotel Security &amp; CCTV Monitoring
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
                  To ensure guest safety, prevent unauthorized access, and safeguard hotel property, security surveillance cameras (CCTV) may be installed and operated in public and common areas across Starlight Hotels properties.
                </p>

                <p>
                  CCTV cameras are restricted to common and public zones, such as hotel entrances, reception lobbies, corridors, parking areas, and exterior perimeters. Security cameras are never placed in guest rooms, restrooms, or areas where guests possess a reasonable expectation of private personal privacy.
                </p>

                <p>
                  CCTV footage is retained only for standard security periods and is accessed strictly by authorized security staff or disclosed to law enforcement authorities where required by legal process.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 21: FRAUD & SECURITY MONITORING
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
                    Fraud Prevention &amp; System Monitoring
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
                  Personal data and technical logs may be reviewed to detect suspicious transactions, prevent fraudulent reservations, protect booking systems against cyber-attacks, and investigate suspected misuse.
                </p>

                <p>
                  Such monitoring is conducted strictly for legitimate security purposes and in compliance with applicable law.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 22: LEGAL & REGULATORY DISCLOSURES
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
                    Legal &amp; Regulatory Disclosures
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
                  Starlight Hotels may disclose personal information where reasonably necessary to:
                </p>

                <ul className="space-y-1.5 sm:space-y-2 list-disc pl-4 sm:pl-5 text-neutral-700">
                  <li>Comply with applicable statutory legislation, court orders, or lawful government directives;</li>
                  <li>Respond to valid and lawful requests from police, investigative, or regulatory authorities;</li>
                  <li>Protect the life, physical safety, or property of guests, hotel employees, or members of the public; or</li>
                  <li>Protect the legal rights, assets, and security of Starlight Hotels against unlawful actions.</li>
                </ul>

                <p>
                  Information is not disclosed to arbitrary third parties without legitimate legal justification.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 23: BUSINESS TRANSFERS
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
                    Business Transfers
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
                  In the event of a merger, acquisition, reorganization, asset sale, or transfer of hotel management or ownership, personal data relating to existing bookings, customer records, and hospitality operations may be transferred to the successor entity.
                </p>

                <p>
                  Any such transfer will be carried out where legally permitted and subject to applicable data protection standards.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 24: INDIA DPDP FRAMEWORK & UPDATES
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
                    India DPDP Framework &amp; Policy Updates
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
                  Starlight Hotels seeks to handle personal information in accordance with applicable privacy and data-protection laws in India, including the Digital Personal Data Protection Act, 2023 and applicable rules and regulations as they come into force and apply to the relevant processing activities.
                </p>

                <p>
                  Starlight Hotels may update this Privacy Policy from time to time to reflect operational changes, new website functionalities, updated security practices, or changes in statutory requirements.
                </p>

                <p>
                  Any revised version will be published on the website with an updated date. Continued use of services after appropriate notice of updates constitutes acknowledgment of the revised Privacy Policy.
                </p>
              </div>
            </section>

            {/* ====================================================
                CLAUSE 25: PRIVACY CONTACT & GRIEVANCES
            ==================================================== */}
            <section
              id="section-25"
              className="scroll-mt-20 sm:scroll-mt-24 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-sm transition hover:shadow-md min-w-0 w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100 mb-3.5 sm:mb-6 min-w-0">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-red-50 text-[11px] sm:text-xs font-bold font-mono text-[#9B111E] shrink-0 mt-0.5 sm:mt-0">
                    25
                  </span>
                  <h2 className="text-[15px] sm:text-xl lg:text-2xl font-serif font-semibold text-neutral-900 tracking-tight leading-snug break-words min-w-0">
                    Privacy Contact &amp; Grievance Mechanism
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionLink("section-25")}
                  aria-label="Copy link to Section 25"
                  className="text-neutral-400 hover:text-neutral-700 transition shrink-0 p-1 print-hide"
                >
                  {copiedSection === "section-25" ? (
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
                  If you have questions, feedback, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please contact Starlight Hotels using our official contact channels:
                </p>

                <div className="mt-3.5 sm:mt-4 rounded-xl border border-neutral-200 bg-[#FAF9F6] p-3.5 sm:p-6 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <h3 className="text-xs sm:text-sm md:text-base font-serif font-bold text-neutral-900 tracking-wide truncate">
                      Starlight Hotels Privacy &amp; Guest Support Desk
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm min-w-0">
                    <div className="rounded-lg bg-white p-3 sm:p-4 border border-neutral-200/80 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Electronic Correspondence
                      </span>
                      <a
                        href="mailto:info@starlighthotels.in"
                        className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#9B111E] flex items-center gap-1.5 min-w-0"
                      >
                        <Mail size={13} className="text-[#9B111E] shrink-0" />
                        <span className="break-all min-w-0">info@starlighthotels.in</span>
                      </a>
                      <span className="block text-[11px] text-neutral-500 mt-1">
                        Privacy Inquiries &amp; Data Rights Requests
                      </span>
                    </div>

                    <div className="rounded-lg bg-white p-3 sm:p-4 border border-neutral-200/80 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Telephone Assistance
                      </span>
                      <a
                        href="tel:+918270660904"
                        className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#9B111E] flex items-center gap-1.5"
                      >
                        <Phone size={13} className="text-[#9B111E] shrink-0" />
                        <span>+91 8270660904</span>
                      </a>
                      <span className="block text-[11px] text-neutral-500 mt-1">
                        Hotel Concierge &amp; General Support
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
        Starlight Hotels • Official Privacy Policy • For reservations and inquiries: info@starlighthotels.in | +91 8270660904 • www.starlighthotels.in
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
          <span>Clauses (25)</span>
        </button>
      </div>

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
                    Share Privacy Policy
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
                    `Hello,\n\nPlease find the official Privacy Policy for Starlight Hotels:\n\n${currentUrl}\n\nFor privacy inquiries: info@starlighthotels.in | +91 8270660904`
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
