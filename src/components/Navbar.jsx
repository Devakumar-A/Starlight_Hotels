import { useEffect, useRef, useState } from "react";
import {
  User,
  Phone,
  Menu,
  X,
  ChevronDown,
  Calendar,
  LogOut,
  Compass,
  Info,
  Headphones,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import AuthModal from "./AuthModal";
import { supabase } from "../lib/supabase";
import { Link, useLocation } from "react-router-dom";
import starlightLogo from "../assets/brand/starlight-logo.png";

export default function Navbar() {
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef(null);
  const routerLocation = useLocation();
  const isHome = routerLocation.pathname === "/";

  // Listen to scroll position for smooth background transition on home page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [routerLocation.pathname]);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Supabase Auth session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  // Prevent double header on specialized legal pages
  if (
    routerLocation.pathname.startsWith("/terms") ||
    routerLocation.pathname.startsWith("/privacy")
  ) {
    return null;
  }

  const isBookActive =
    routerLocation.pathname.startsWith("/book-hotels") ||
    routerLocation.pathname.startsWith("/availability");
  const isAboutActive = routerLocation.pathname === "/about-us";

  return (
    <>
      <header
        className={`w-full z-50 transition-all duration-300 ${
          isHome
            ? scrolled || mobileMenuOpen
              ? "fixed top-0 left-0 right-0 bg-[#0c0e12]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 py-2.5 sm:py-3.5"
              : "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent py-3 sm:py-5 border-b border-transparent"
            : "sticky top-0 bg-[#0c0e12]/95 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/30 py-2.5 sm:py-3.5"
        }`}
      >
        <div className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">

          {/* Brand Logo & Typography */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-95 shrink min-w-0"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src={starlightLogo}
                alt="Starlight Hotels Emblem"
                className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-full bg-[#D4A247]/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[13px] sm:text-base lg:text-[17px] font-bold tracking-[0.12em] sm:tracking-[0.18em] uppercase leading-tight truncate">
                <span className="text-white">STARLIGHT</span>
                <span className="bg-gradient-to-r from-[#F3CF7A] via-[#D4A247] to-[#B88428] bg-clip-text text-transparent font-extrabold">
                  HOTELS
                </span>
              </div>
              <span className="text-[7px] sm:text-[8.5px] lg:text-[9px] font-semibold tracking-[0.2em] sm:tracking-[0.26em] text-white/50 uppercase leading-none mt-0.5 truncate">
                LUXURY STAYS &amp; RESORTS
              </span>
            </div>
          </Link>

          {/* Primary Navigation Links (Desktop lg+) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 rounded-full bg-white/[0.04] border border-white/10 px-3 py-1.5 backdrop-blur-md shadow-inner">
            {/* Home */}
            <Link
              to="/"
              className={`relative px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-wider uppercase transition-all duration-200 rounded-full ${
                isHome
                  ? "text-[#F3CF7A] bg-[#D4A247]/15 font-semibold shadow-[0_0_12px_rgba(212,162,71,0.2)]"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`}
            >
              Home
            </Link>

            {/* Book Hotels */}
            <Link
              to="/book-hotels"
              className={`relative px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-wider uppercase transition-all duration-200 rounded-full ${
                isBookActive
                  ? "text-[#F3CF7A] bg-[#D4A247]/15 font-semibold shadow-[0_0_12px_rgba(212,162,71,0.2)]"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`}
            >
              Book Hotels
            </Link>

            {/* About Us */}
            <Link
              to="/about-us"
              className={`relative px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-wider uppercase transition-all duration-200 rounded-full ${
                isAboutActive
                  ? "text-[#F3CF7A] bg-[#D4A247]/15 font-semibold shadow-[0_0_12px_rgba(212,162,71,0.2)]"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`}
            >
              About Us
            </Link>
          </nav>

          {/* Right Utility & Concierge Cluster (Desktop lg+) */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
            {/* Concierge Call Button */}
            <a
              href="tel:+918270660904"
              className="group flex items-center gap-2 rounded-full bg-[#181a20]/90 hover:bg-[#20232b] border border-white/12 hover:border-[#D4A247]/50 px-3.5 py-1.5 text-xs xl:text-[13px] transition-all duration-200 shadow-sm"
              title="Direct Reservations & Concierge Desk"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A247]/20 text-[#D4A247] group-hover:scale-110 transition-transform">
                <Phone size={12} className="fill-[#D4A247]/30 text-[#D4A247]" />
              </span>
              <span className="text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
                <span className="hidden xl:inline text-white/50 text-[11px] uppercase tracking-wider mr-1.5">
                  Call:
                </span>
                <span className="font-semibold text-white tracking-wide">
                  +91 8270660904
                </span>
              </span>
            </a>

            {/* Customer Support */}
            <a
              href="mailto:support@starlighthotels.com"
              className="flex items-center gap-1.5 text-xs xl:text-[13px] font-medium text-white/70 hover:text-white transition-colors px-2 py-1.5 whitespace-nowrap"
              title="24/7 Guest Care & Support"
            >
              <Headphones size={14} className="text-[#D4A247]/90 shrink-0" />
              <span className="hidden xl:inline">Customer Support</span>
              <span className="xl:hidden">Support</span>
            </a>

            {/* Subtle Divider */}
            <span className="h-4 w-px bg-white/20 shrink-0" />

            {/* Sign in / User Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-full bg-[#1e2128] hover:bg-[#262a33] border border-white/15 hover:border-[#D4A247]/40 px-3.5 py-1.5 text-xs xl:text-[13px] font-medium text-white shadow-sm transition-all duration-200"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A247]/20 text-[#F3CF7A] text-xs font-bold border border-[#D4A247]/40">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] xl:max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-white/60 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180 text-[#D4A247]" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/15 bg-[#12141a]/95 backdrop-blur-xl p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-[10px] uppercase tracking-wider text-[#D4A247] font-semibold">
                          Signed in as
                        </p>
                        <p className="text-xs font-semibold text-white truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs xl:text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <User size={15} className="text-[#D4A247]" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs xl:text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Calendar size={15} className="text-[#D4A247]" />
                        <span>My Bookings</span>
                      </Link>

                      <div className="h-px bg-white/10 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs xl:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-[#E3B85D] via-[#D4A247] to-[#B88428] px-4 xl:px-5 py-2 text-xs xl:text-sm font-semibold text-neutral-950 shadow-[0_2px_14px_rgba(212,162,71,0.3)] transition-all duration-200 hover:shadow-[0_4px_22px_rgba(212,162,71,0.5)] hover:brightness-105 active:scale-98 whitespace-nowrap"
                >
                  <Sparkles size={13} className="text-neutral-950" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Header Controls (<lg) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:hidden shrink-0">
            {/* Quick Call Icon Pill on Mobile */}
            <a
              href="tel:+918270660904"
              className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/5 border border-white/15 text-[#D4A247] hover:bg-white/10 transition active:scale-95"
              aria-label="Call concierge"
              title="Call concierge"
            >
              <Phone size={14} className="fill-[#D4A247]/20" />
            </a>

            {/* Auth / Profile Trigger Button */}
            {user ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#1f222a] border border-[#D4A247]/50 text-[#F3CF7A] text-xs font-bold transition active:scale-95"
                aria-label="User profile"
                title={displayName}
              >
                {displayName.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/5 border border-white/15 text-[#D4A247] hover:bg-white/10 transition active:scale-95"
                aria-label="Sign In"
                title="Sign In"
              >
                <User size={15} />
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((prev) => !prev);
              }}
              className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full border transition active:scale-95 z-50 cursor-pointer ${
                mobileMenuOpen
                  ? "bg-[#D7A441] border-[#D7A441] text-neutral-950 shadow-sm"
                  : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
              }`}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X size={17} className="stroke-[2.5]" /> : <Menu size={17} />}
            </button>
          </div>

        </div>

        {/* Mobile & Tablet User Dropdown (when user clicks profile badge on mobile) */}
        {userMenuOpen && (
          <div className="lg:hidden mx-4 mt-2 rounded-2xl border border-[#D4A247]/30 bg-[#0c101c]/98 backdrop-blur-2xl p-3.5 text-white shadow-2xl animate-in fade-in duration-150">
            <div className="px-2 py-1.5 border-b border-white/10 mb-1.5">
              <p className="text-[10px] uppercase tracking-wider text-[#D4A247] font-bold">
                Signed in as
              </p>
              <p className="text-xs font-semibold text-white truncate mt-0.5">
                {user?.email}
              </p>
            </div>
            <Link
              to="/profile"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <User size={14} className="text-[#D4A247]" />
              <span>My Profile</span>
            </Link>
            <Link
              to="/my-bookings"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <Calendar size={14} className="text-[#D4A247]" />
              <span>My Bookings</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition mt-1"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Mobile & Tablet Full Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="lg:hidden absolute left-0 right-0 top-full bg-[#0c101c]/98 backdrop-blur-2xl border-b border-[#D4A247]/30 shadow-[0_30px_70px_rgba(0,0,0,0.85)] px-4 sm:px-6 py-4 sm:py-5 space-y-3.5 max-h-[calc(100dvh-70px)] overflow-y-auto z-40 animate-in slide-in-from-top-2 duration-200 text-white">

              {/* Mobile Drawer Header with Explicit Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img
                    src={starlightLogo}
                    alt="Starlight Hotels"
                    className="h-5 w-5 object-contain"
                  />
                  <span className="text-xs font-bold tracking-[0.16em] text-white uppercase">
                    Navigation Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold text-white border border-white/20 shadow-xs transition active:scale-95 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={15} className="text-[#D4A247]" />
                  <span>Close</span>
                </button>
              </div>

              {/* Direct Concierge Contact Card */}
              <div className="rounded-2xl border border-[#D4A247]/35 bg-gradient-to-br from-[#D4A247]/20 via-[#131b2e]/90 to-[#0c101c] p-3.5 sm:p-4 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.18em] text-[#F3CF7A] uppercase">
                      24/7 Concierge Desk
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-white/50">Direct Reservations</span>
                </div>
                <a
                  href="tel:+918270660904"
                  className="flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 p-2.5 sm:p-3 shadow-xs transition hover:border-[#D4A247] active:scale-98"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#D7A441] to-[#B88428] text-neutral-950 font-bold shadow-xs">
                      <Phone size={15} />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-white/60 leading-none">Call direct</div>
                      <div className="text-sm font-bold text-white mt-0.5 tracking-wide">
                        +91 8270660904
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F3CF7A] flex items-center gap-1">
                    Call &rarr;
                  </span>
                </a>
              </div>

              {/* Main Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isHome
                      ? "bg-[#D4A247]/20 border border-[#D4A247]/40 text-[#F3CF7A] font-bold shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isHome ? "bg-[#D4A247]/25 text-[#F3CF7A]" : "bg-white/10 text-white/60"}`}>
                      <Compass size={15} />
                    </div>
                    <span className="text-sm tracking-wide">Home</span>
                  </div>
                  {isHome && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4A247]" />
                  )}
                </Link>

                <Link
                  to="/book-hotels"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isBookActive
                      ? "bg-[#D4A247]/20 border border-[#D4A247]/40 text-[#F3CF7A] font-bold shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isBookActive ? "bg-[#D4A247]/25 text-[#F3CF7A]" : "bg-white/10 text-white/60"}`}>
                      <Compass size={15} />
                    </div>
                    <span className="text-sm tracking-wide">Book Hotels</span>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-[#F3CF7A] bg-[#D4A247]/20 px-2 py-0.5 rounded-full border border-[#D4A247]/30">
                    Explore
                  </span>
                </Link>

                <Link
                  to="/about-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isAboutActive
                      ? "bg-[#D4A247]/20 border border-[#D4A247]/40 text-[#F3CF7A] font-bold shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/[0.06] border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isAboutActive ? "bg-[#D4A247]/25 text-[#F3CF7A]" : "bg-white/10 text-white/60"}`}>
                      <Info size={15} />
                    </div>
                    <span className="text-sm tracking-wide">About Us &amp; Partners</span>
                  </div>
                  <ChevronRight size={15} className="text-white/40" />
                </Link>

                <a
                  href="mailto:support@starlighthotels.com"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/[0.06] border border-transparent transition font-medium"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/60">
                      <Headphones size={15} />
                    </div>
                    <span className="text-sm tracking-wide">Customer Support</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white/40">24/7 Care</span>
                </a>
              </div>

              {/* Logged in User Profile Card */}
              {user && (
                <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-3 space-y-2">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#D7A441] to-[#B88428] text-neutral-950 font-bold text-xs shadow-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4A247]">Signed In</div>
                      <div className="text-xs font-semibold text-white truncate">{user?.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition"
                    >
                      <User size={13} className="text-[#D4A247]" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition"
                    >
                      <Calendar size={13} className="text-[#D4A247]" />
                      <span>Bookings</span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Mobile Auth CTA if guest */}
              {!user && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode("login");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E3B85D] via-[#D4A247] to-[#B88428] py-3 text-sm font-bold text-neutral-950 shadow-lg shadow-[#D4A247]/25 transition active:scale-98"
                  >
                    <Sparkles size={16} />
                    <span>Sign In / Create Account</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      {/* Authentication Modal */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
}