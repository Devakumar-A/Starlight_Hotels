import {
  ChevronDown,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import starLogo from "../assets/brand/starlight-favicon.png";

// ============================================================
// EXPLORE STARLIGHT HOTELS DIRECTORY DATA
// ============================================================
const DESKTOP_COLUMNS = [
  {
    title: "PONDICHERRY",
    locationParam: "Pondicherry",
    items: [
      {
        name: "Grand Ocean Inn",
        area: "Kuyavarpalayam",
        route: "/hotel/b4acb26a-fdf1-465f-bc9d-6d891779d7e3",
      },
      {
        name: "Signature Grande",
        area: "Kottakuppam",
        route: "/hotel/f9a3b244-de2a-43bd-bd4a-55a08de6f216",
      },
      {
        name: "Jardin pradisiaque",
        area: "Kottakuppam",
        route: "/hotel/c37bc8dd-51a1-4c90-86ea-7b5144213804",
      },
      {
        name: "Hotel MGR Residency",
        area: "Karuvadikuppam Main Road",
        route: "/hotel/1799721d-e784-4ac2-8e98-6f1a754c62a4",
      },
    ],
  },
  {
    title: "PONDICHERRY",
    locationParam: "Pondicherry",
    items: [
      {
        name: "Hotel 1Square",
        area: "Auroville",
        route: "/hotel/43426af8-5967-4389-a18c-5021a7e35cd5",
      },
      {
        name: "DoubleOne Stays",
        area: "Auroville",
        route: "/hotel/bee4bb75-2e78-4d53-a4b3-ba5a6a567302",
      },
      {
        name: "VMB Residency",
        area: "Karuvadikuppam",
        route: "/hotel/22b30f73-e3eb-4bf7-a914-f0afd17b4def",
      },
      {
        name: "SS Grand",
        area: "Kottakuppam",
        route: "/hotel/1e86a6df-a2c7-42ea-a187-3b56d97e75ac",
      },
    ],
  },
  {
    title: "CHENNAI",
    locationParam: "Chennai",
    items: [
      {
        name: "Starlight Hotels T-Nagar",
        area: "Sivaji Street, T. Nagar",
        route: "/hotel/86d978a6-f9c8-433b-b940-25628f2e8dfb",
      },
      {
        name: "AR Residency",
        area: "Ramachandra Street, T. Nagar",
        route: "/hotel/c4947238-84d8-440e-8b17-093ec1bdb543",
      },
      {
        name: "Starlight Hotels DLF",
        area: "Manapakkam",
        route: "/hotel/13500953-6932-479a-acbb-dd3056a2cf51",
      },
      {
        name: "Starlight Hotels OMR Thoraipakkam",
        area: "Thoraipakkam",
        route: "/hotel/c82b2c6d-3503-4943-8a2b-ec73cec3bb3a",
      },
      {
        name: "Starlight Hotels Mylapore",
        area: "Mylapore",
        route: "/hotel/7a07fdd9-19d0-44d5-ab95-c59a6abb3c40",
      },
      {
        name: "Pondy Bazaar",
        area: "T-Nagar",
        route: "/hotel/437c8e6b-8c72-46ce-aca2-bb0a21c41094",
      },
    ],
  },
  {
    title: "KODAIKANAL",
    locationParam: "Kodaikanal",
    items: [
      {
        name: "STARLIGHT HOTELS KODAI",
        area: "Vilpatti",
        route: "/hotel/4b6283cb-639a-47dd-bf6d-343478c0874a",
      },
    ],
  },
];

const MOBILE_CITIES = [
  {
    city: "PONDICHERRY",
    locationParam: "Pondicherry",
    items: [
      ...DESKTOP_COLUMNS[0].items,
      ...DESKTOP_COLUMNS[1].items,
    ],
  },
  {
    city: "CHENNAI",
    locationParam: "Chennai",
    items: DESKTOP_COLUMNS[2].items,
  },
  {
    city: "KODAIKANAL",
    locationParam: "Kodaikanal",
    items: DESKTOP_COLUMNS[3].items,
  },
];

export default function Footer() {
  const brandRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openCity, setOpenCity] = useState(null);

  const toggleCity = (city) => {
    setOpenCity((prev) => (prev === city ? null : city));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentEl = brandRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, []);

  return (
    <footer className="relative overflow-hidden bg-[#0A0A0B] text-white border-t border-white/10 w-full max-w-full">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[900px] rounded-full bg-[#D7A441]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 pt-16 pb-12 sm:px-8 lg:px-12">
        {/* ============================================================
            TOP SECTION: BRAND & MOTTO
        ============================================================ */}
        <div className="flex flex-col items-start justify-between gap-6 pb-12 border-b border-white/10 md:flex-row md:items-center">
          <a
            href="/"
            aria-label="Starlight Hotels"
            className="group flex items-center gap-3.5"
          >
            <div className="flex items-center justify-center">
              <img
                src={starLogo}
                alt="Starlight Hotels"
                draggable="false"
                className="h-9 w-9 object-contain sm:h-10 sm:w-10 transition-transform duration-500 group-hover:rotate-12"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-semibold tracking-[0.22em] text-white uppercase font-sans">
                STARLIGHT <span className="text-[#D7A441] font-bold">HOTELS</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.3em] text-white/50 uppercase">
                LUXURY STAYS &amp; RESORTS
              </span>
            </div>
          </a>

          <div className="max-w-md text-left md:text-right">
            <p className="text-sm font-medium text-white/90">
              Thoughtful stays. Memorable journeys.
            </p>
            <p className="mt-1 text-xs text-white/50">
              Discover distinctive hotels and villas across South India.
            </p>
          </div>
        </div>

        {/* ============================================================
            PROPERTY DIRECTORY: EXPLORE STARLIGHT HOTELS
        ============================================================ */}
        <div className="py-12 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7A441] block mb-1">
                Property Directory
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase font-sans">
                EXPLORE STARLIGHT HOTELS
              </h2>
            </div>
            <p className="text-xs text-white/50 tracking-wide">
              Discover Starlight Hotels across South India
            </p>
          </div>

          {/* Desktop & Tablet Multi-Column Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {DESKTOP_COLUMNS.map((col, colIdx) => (
              <div key={colIdx} className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A441]">
                  {col.title}
                </h3>
                <div className="space-y-4">
                  {col.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="group/item">
                      {item.route ? (
                        <Link
                          to={item.route}
                          className="block text-sm font-medium text-white/90 hover:text-[#D7A441] transition-colors duration-200 cursor-pointer"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="block text-sm font-medium text-white/85">
                          {item.name}
                        </span>
                      )}
                      <p className="mt-0.5 text-xs text-white/45 tracking-normal">
                        {item.area}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Collapsible / Accordion City Sections */}
          <div className="md:hidden space-y-3">
            {MOBILE_CITIES.map((cityGroup) => {
              const isOpen = openCity === cityGroup.city;
              return (
                <div
                  key={cityGroup.city}
                  className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleCity(cityGroup.city)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A441]">
                      {cityGroup.city}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70">
                      {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 border-t border-white/10"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 py-4 space-y-3.5 bg-white/[0.01]">
                        {cityGroup.items.map((item, idx) => (
                          <div key={idx} className="group/mobile-item">
                            {item.route ? (
                              <Link
                                to={item.route}
                                className="block text-sm font-medium text-white/90 active:text-[#D7A441] transition-colors"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <span className="block text-sm font-medium text-white/85">
                                {item.name}
                              </span>
                            )}
                            <p className="mt-0.5 text-xs text-white/45">
                              {item.area}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            MIDDLE SECTION: NAVIGATION COLUMNS
        ============================================================ */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10">
          {/* Column 1: Explore Stays */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A441]">
              Explore Stays
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>
                <Link
                  to="/book-hotels?location=Pondicherry"
                  className="transition hover:text-white hover:translate-x-0.5 inline-block cursor-pointer"
                >
                  Pondicherry Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/book-hotels?location=Chennai"
                  className="transition hover:text-white hover:translate-x-0.5 inline-block cursor-pointer"
                >
                  Chennai Hotels
                </Link>
              </li>
              <li>
                <Link
                  to="/book-hotels?location=Kodaikanal"
                  className="transition hover:text-white hover:translate-x-0.5 inline-block cursor-pointer"
                >
                  Kodaikanal Hotels
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Destinations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A441]">
              Destinations
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>
                <Link
                  to="/book-hotels?location=Pondicherry"
                  className="flex items-center gap-2 transition hover:text-white cursor-pointer"
                >
                  <MapPin size={14} className="text-[#D7A441]/80" />
                  <span>Pondicherry</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/book-hotels?location=Chennai"
                  className="flex items-center gap-2 transition hover:text-white cursor-pointer"
                >
                  <MapPin size={14} className="text-[#D7A441]/80" />
                  <span>Chennai</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/book-hotels?location=Kodaikanal"
                  className="flex items-center gap-2 transition hover:text-white cursor-pointer"
                >
                  <MapPin size={14} className="text-[#D7A441]/80" />
                  <span>Kodaikanal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A441]">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>
                <Link to="/about-us" className="transition hover:text-white">
                  About Starlight
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/partner-with-us" className="transition hover:text-white">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/support" className="transition hover:text-white">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="transition hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition hover:text-white">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Reservations & Contacts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7A441]">
              Reservations
            </h3>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Call to Book
                </p>
                <a
                  href="tel:+918270660904"
                  className="mt-1 flex items-center gap-2 text-base font-semibold text-white transition hover:text-[#D7A441]"
                >
                  <Phone size={15} className="text-[#D7A441]" />
                  <span>+91 8270660904</span>
                </a>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Email / Enquiry
                </p>
                <a
                  href="mailto:info@starlighthotels.in"
                  className="mt-1 flex items-center gap-2 font-medium text-white/80 transition hover:text-[#D7A441]"
                >
                  <Mail size={15} className="text-[#D7A441]" />
                  <span>info@starlighthotels.in</span>
                </a>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2.5">
                  Follow Starlight
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/starlight.hotels_/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#D7A441] hover:bg-[#D7A441]/15 hover:text-[#D7A441]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/share/1CkRb3XHkv/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#D7A441] hover:bg-[#D7A441]/15 hover:text-[#D7A441]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/@starlighthotelsoffice?si=r8aye3daMo_SHncI"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#D7A441] hover:bg-[#D7A441]/15 hover:text-[#D7A441]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/message/NQ3KK6GPLZXNK1"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-[#D7A441] hover:bg-[#D7A441]/15 hover:text-[#D7A441]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            LARGE SUBTLE BACKGROUND BRANDING (ELIYAAS STYLE) WITH SMOOTH ANIMATION
        ============================================================ */}
        <div
          ref={brandRef}
          className={`footer-rise-container relative select-none w-full max-w-full overflow-hidden py-10 sm:py-20 text-center pointer-events-none ${
            isVisible ? "is-visible" : ""
          }`}
        >
          <h2 className="footer-brand-title text-[13vw] font-black tracking-tight leading-none uppercase font-sans relative z-10">
            STARLIGHT
          </h2>
          <p className="footer-brand-sub text-[3.5vw] font-semibold tracking-[0.55em] uppercase -mt-[1.5vw] relative z-10">
            HOTELS &amp; RESORTS
          </p>
        </div>

        {/* ============================================================
            BOTTOM BAR: COPYRIGHT & LEGAL
        ============================================================ */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-white/10 sm:flex-row text-xs text-white/50">
          <p>© {new Date().getFullYear()} Starlight Hotels. All Rights Reserved.</p>

          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="h-3 w-px bg-white/20" />
            <Link
              to="/terms"
              className="transition hover:text-white"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Watermark and Rise Styles */}
      <style>
        {`
          @keyframes runGoldGradient {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: -200% 50%;
            }
          }

          .footer-brand-title {
            background: linear-gradient(
              90deg,
              #B88428 0%,
              #E3B755 15%,
              #FFF6DA 28%,
              #F5CE74 38%,
              #D7A441 50%,
              #B88428 65%,
              #E3B755 78%,
              #FFF6DA 88%,
              #F5CE74 95%,
              #B88428 100%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            animation: runGoldGradient 6s linear infinite;
            transform: translateY(50px);
            opacity: 0;
            transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity, background-position;
          }

          .footer-brand-sub {
            background: linear-gradient(
              90deg,
              #9C6B1C 0%,
              #D7A441 20%,
              #FFF2CD 35%,
              #E2B755 50%,
              #9C6B1C 65%,
              #D7A441 80%,
              #FFF2CD 92%,
              #9C6B1C 100%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            animation: runGoldGradient 7s linear infinite;
            transform: translateY(40px);
            opacity: 0;
            transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
            will-change: transform, opacity, background-position;
          }

          .footer-rise-container.is-visible .footer-brand-title,
          .footer-rise-container.is-visible .footer-brand-sub {
            transform: translateY(0);
            opacity: 1;
          }
        `}
      </style>
    </footer>
  );
}
