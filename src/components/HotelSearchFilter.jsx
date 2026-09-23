import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MapPin,
  Minus,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

/**
 * Helper to get local date YYYY-MM-DD
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Helper to format date DD-MM-YYYY
 */
export function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

/**
 * Helper to format date in luxury style (e.g. 20 Sep 2026) matching the Home page
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return "Select Date";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

/**
 * FilterContent: Inner controls for Destination, Price Range, and Guest Occupancy.
 * Reusable in desktop sidebar and mobile drawer.
 */
export function HotelFilterContent({
  location = "",
  setLocation = () => {},
  setHotelId = () => {},
  minPrice = 0,
  setMinPrice = () => {},
  maxPrice = 20000,
  setMaxPrice = () => {},
  guests = "2",
  setGuests = () => {},
  clearFilters = () => {},
  activeFilterCount = 0,
  destinations = ["Chennai", "Pondicherry", "Kodaikanal"],
}) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <SlidersHorizontal size={15} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 font-sans tracking-tight">
              Filter Stays
            </h2>
            {activeFilterCount > 0 ? (
              <span className="inline-block rounded-full bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 mt-0.5">
                {activeFilterCount} {activeFilterCount === 1 ? "active filter" : "active filters"}
              </span>
            ) : (
              <p className="text-[11px] text-neutral-400">Refine properties</p>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* LOCATION / DESTINATION */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2.5">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <MapPin size={13} className="text-indigo-500" />
            <span>Destination / City</span>
          </label>
          {location && (
            <button
              type="button"
              onClick={() => {
                setLocation("");
                setHotelId("");
              }}
              className="text-[10px] font-medium text-indigo-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {destinations.map((city) => {
            const active = location === city;

            return (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setLocation(active ? "" : city);
                  setHotelId("");
                }}
                className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition active:scale-95 cursor-pointer ${
                  active
                    ? "border-indigo-600 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
                    : "border-neutral-200/90 bg-neutral-50 text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {!location && (
          <p className="mt-2 text-[11px] text-neutral-400 italic">
            Showing all destinations
          </p>
        )}
      </div>

      {/* PRICE RANGE */}
      <div className="border-t border-neutral-200/70 pt-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Price per night
          </label>
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
            <span className="rounded-lg bg-neutral-100 border border-neutral-200/70 px-2 py-0.5 text-[11px]">
              ₹{Number(minPrice).toLocaleString("en-IN")}
            </span>
            <span className="text-neutral-400">-</span>
            <span className="rounded-lg bg-neutral-100 border border-neutral-200/70 px-2 py-0.5 text-[11px]">
              ₹{Number(maxPrice).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Dual range slider */}
        <div className="relative mt-3 h-6">
          {/* Track */}
          <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-neutral-200/80" />

          {/* Active range */}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 shadow-sm"
            style={{
              left: `${(minPrice / 20000) * 100}%`,
              right: `${100 - (maxPrice / 20000) * 100}%`,
            }}
          />

          {/* Minimum handle */}
          <input
            type="range"
            min="1000"
            max="20000"
            step="1000"
            value={minPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < maxPrice) {
                setMinPrice(value);
              }
            }}
            className="price-slider absolute inset-0 w-full appearance-none bg-transparent accent-indigo-600 cursor-pointer"
          />

          {/* Maximum handle */}
          <input
            type="range"
            min="1000"
            max="20000"
            step="1000"
            value={maxPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > minPrice) {
                setMaxPrice(value);
              }
            }}
            className="price-slider absolute inset-0 w-full appearance-none bg-transparent accent-indigo-600 cursor-pointer"
          />
        </div>

        <div className="mt-1 flex justify-between text-[10px] font-medium text-neutral-400">
          <span>₹1,000</span>
          <span>₹20,000</span>
        </div>
      </div>

      {/* GUESTS OCCUPANCY */}
      <div className="border-t border-neutral-200/70 pt-5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          <Users size={13} className="text-indigo-500" />
          <span>Guests Occupancy</span>
        </label>

        <div className="space-y-2">
          {[
            { value: "2", label: "1–2 guests" },
            { value: "4", label: "2–4 guests" },
            { value: "6", label: "4–6 guests" },
            { value: "8", label: "6–8 guests" },
          ].map((option) => {
            const active = guests === option.value;

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition ${
                  active
                    ? "border-indigo-500/60 bg-indigo-50/50 text-neutral-900 font-semibold shadow-sm"
                    : "border-neutral-200/80 bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <span>{option.label}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => {
                    setGuests(active ? "4" : option.value);
                  }}
                  className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * HotelSearchBanner: The top search summary bar with badges and date/guest inputs.
 */
export function HotelSearchBanner({
  location = "",
  setLocation = () => {},
  hotelId = "",
  setHotelId = () => {},
  destinations = ["Chennai", "Pondicherry", "Kodaikanal"],
  checkIn = "",
  checkOut = "",
  guests = "2",
  setCheckIn = () => {},
  setCheckOut = () => {},
  setGuests = () => {},
  minDate = getLocalDateString(),
  formatDateFn = formatDate,
}) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [mobileSheetTab, setMobileSheetTab] = useState("none"); // 'none' | 'calendar' | 'guests'
  const [activeDropdown, setActiveDropdown] = useState(null); // 'calendar' | 'guests' | null
  const [calendarTarget, setCalendarTarget] = useState("checkIn"); // 'checkIn' | 'checkOut'
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  const searchContainerRef = useRef(null);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync adults / children with guests string prop
  const guestNum = parseInt(guests, 10) || 2;
  const [adults, setAdults] = useState(Math.max(1, guestNum));
  const [children, setChildren] = useState(0);

  useEffect(() => {
    const g = parseInt(guests, 10) || 2;
    if (adults + children !== g) {
      setAdults(Math.max(1, g));
      setChildren(0);
    }
  }, [guests]);

  const totalGuests = adults + children;

  const updateAdults = (delta) => {
    const next = Math.max(1, Math.min(10, adults + delta));
    setAdults(next);
    setGuests(String(next + children));
  };

  const updateChildren = (delta) => {
    const next = Math.max(0, Math.min(8, children + delta));
    setChildren(next);
    setGuests(String(adults + next));
  };

  // Calendar calculations
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const month1Date = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
  const month2Date = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset + 1, 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateClick = (dateStr, isMobile = false) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut("");
      setCalendarTarget("checkOut");
    } else {
      if (dateStr < checkIn) {
        setCheckIn(dateStr);
        setCheckOut("");
        setCalendarTarget("checkOut");
      } else {
        setCheckOut(dateStr);
        if (!isMobile) {
          setActiveDropdown(null);
        } else {
          setMobileSheetTab("none");
        }
      }
    }
  };

  const renderMonthCalendar = (viewDate, isMobile = false) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, "0");
      const mStr = String(month + 1).padStart(2, "0");
      days.push(`${year}-${mStr}-${dStr}`);
    }

    return (
      <div className={isMobile ? "w-full max-w-[300px] mx-auto" : "w-full sm:w-[270px]"}>
        <h4 className="text-center font-semibold text-white text-sm mb-3">
          {monthNames[month]} {year}
        </h4>

        {/* Day of week labels */}
        <div className="grid grid-cols-7 text-center text-xs font-medium text-white/50 mb-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-[#D7A441]">Sat</span>
          <span className="text-[#D7A441]">Sun</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
          {days.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const dayNum = parseInt(dateStr.split("-")[2], 10);
            const isPast = dateStr < todayStr;
            const isCheckIn = dateStr === checkIn;
            const isCheckOut = dateStr === checkOut;
            const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

            let btnClass = "h-8 w-8 mx-auto flex items-center justify-center rounded-full transition-all text-xs ";

            if (isCheckIn || isCheckOut) {
              btnClass += "bg-[#D7A441] text-black font-bold shadow-[0_0_12px_rgba(215,164,65,0.6)]";
            } else if (isInRange) {
              btnClass += "bg-[#D7A441]/25 text-[#F5C869] font-medium rounded-none w-full";
            } else if (isPast) {
              btnClass += "text-white/20 cursor-not-allowed";
            } else {
              btnClass += "text-white/90 hover:bg-white/10 hover:text-white cursor-pointer";
            }

            return (
              <div key={dateStr} className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dateStr, isMobile)}
                  className={btnClass}
                >
                  {dayNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="border-b border-neutral-200/80 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FCFCFD]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6 pb-5 sm:pb-7 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }}
              aria-label="Go back"
              title="Go back"
              className="mt-1 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft size={17} className="transition-transform hover:-translate-x-0.5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D7A441]/30 bg-[#D7A441]/10 px-3 py-1 text-[10px] sm:text-[11px] font-bold tracking-wider text-[#966A1E] uppercase mb-1.5 sm:mb-2">
                <Sparkles size={12} className="text-[#D7A441]" />
                <span>Starlight Luxury Stays</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-sans">
                Available Hotels &amp; Resorts
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1">
                Handcrafted stays across South India&apos;s finest locations
              </p>
            </div>
          </div>

          {/* DESKTOP ONLY: 3 SUMMARY BADGES */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-2.5">
            {/* LOCATION */}
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 sm:p-3.5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428]">
                <MapPin size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Location
                </p>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                  {location || "All Locations"}
                </p>
              </div>
            </div>

            {/* DATES */}
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 sm:p-3.5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428]">
                <CalendarDays size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Stay Period
                </p>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                  {formatDateDisplay(checkIn)} → {formatDateDisplay(checkOut)}
                </p>
              </div>
            </div>

            {/* GUESTS */}
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 sm:p-3.5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428]">
                <Users size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Guests
                </p>
                <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                  {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE ONLY: SINGLE CLEAN & COMPACT SEARCH SUMMARY CARD */}
        <div className="sm:hidden mt-2.5">
          <div
            onClick={() => setIsBottomSheetOpen(true)}
            className="rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-sm hover:border-[#D7A441]/50 active:scale-[0.99] transition cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1 space-y-0.5">
                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 truncate">
                  <MapPin size={13} className="text-[#D7A441] shrink-0" />
                  <span className="truncate">{location || "All Locations"}</span>
                </div>

                {/* Date Range & Guests */}
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-medium truncate">
                  <span className="flex items-center gap-1 truncate">
                    <CalendarDays size={11} className="text-[#D7A441] shrink-0" />
                    <span className="truncate">{formatDateDisplay(checkIn)} → {formatDateDisplay(checkOut)}</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Users size={11} className="text-[#D7A441] shrink-0" />
                    <span>{totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}</span>
                  </span>
                </div>
              </div>

              {/* Modify Search CTA Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBottomSheetOpen(true);
                }}
                className="shrink-0 rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-3 py-2 text-[11px] font-bold text-neutral-950 shadow-sm active:scale-95 transition cursor-pointer whitespace-nowrap"
              >
                Modify Search
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE ONLY: SLIDE-UP BOTTOM SHEET FOR SEARCH CONTROLS */}
        {isBottomSheetOpen && (
          <div className="fixed inset-0 z-[110] sm:hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsBottomSheetOpen(false);
                setMobileSheetTab("none");
              }}
            />

            {/* Bottom Sheet Modal */}
            <div className="absolute inset-x-0 bottom-0 z-[120] max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
              {/* Drag Handle Indicator */}
              <div className="mx-auto -mt-1 mb-4 h-1.5 w-12 rounded-full bg-neutral-300" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 font-sans">
                    Modify Search
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Update destination, dates, and guests
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsBottomSheetOpen(false);
                    setMobileSheetTab("none");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* CONTROLS */}
              <div className="py-4 space-y-4">
                {/* 1. Destination / Location */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Destination / City
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLocation("");
                        setHotelId("");
                      }}
                      className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
                        !location
                          ? "border-[#D7A441] bg-gradient-to-r from-[#D7A441] to-[#C5922C] text-neutral-950 font-bold shadow-sm"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-[#D7A441]/50 hover:bg-[#FAF5EB]"
                      }`}
                    >
                      All Locations
                    </button>
                    {destinations.map((city) => {
                      const active = location === city;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setLocation(active ? "" : city);
                            setHotelId("");
                          }}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
                            active
                              ? "border-[#D7A441] bg-gradient-to-r from-[#D7A441] to-[#C5922C] text-neutral-950 font-bold shadow-sm"
                              : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-[#D7A441]/50 hover:bg-[#FAF5EB]"
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2 & 3: Check-in & Check-out Date Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Check-In */}
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarTarget("checkIn");
                      setMobileSheetTab(mobileSheetTab === "calendar" && calendarTarget === "checkIn" ? "none" : "calendar");
                    }}
                    className={`rounded-2xl border p-3 text-left transition cursor-pointer ${
                      mobileSheetTab === "calendar" && calendarTarget === "checkIn"
                        ? "border-[#D7A441] bg-[#FAF5EB] ring-2 ring-[#D7A441]/30"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D7A441]/10 text-[#B88428]">
                        <CalendarDays size={14} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Check-In
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-neutral-900 truncate">
                      {formatDateDisplay(checkIn)}
                    </p>
                  </button>

                  {/* Check-Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarTarget("checkOut");
                      setMobileSheetTab(mobileSheetTab === "calendar" && calendarTarget === "checkOut" ? "none" : "calendar");
                    }}
                    className={`rounded-2xl border p-3 text-left transition cursor-pointer ${
                      mobileSheetTab === "calendar" && calendarTarget === "checkOut"
                        ? "border-[#D7A441] bg-[#FAF5EB] ring-2 ring-[#D7A441]/30"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D7A441]/10 text-[#B88428]">
                        <CalendarDays size={14} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Check-Out
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-neutral-900 truncate">
                      {formatDateDisplay(checkOut)}
                    </p>
                  </button>
                </div>

                {/* MOBILE LUXURY CALENDAR PANEL (WHEN EXPANDED) */}
                {mobileSheetTab === "calendar" && (
                  <div className="rounded-2xl border border-white/15 bg-[#0D0E12] p-4 shadow-xl text-left animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                      <button
                        type="button"
                        disabled={calendarMonthOffset <= 0}
                        onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Previous month"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <div className="rounded-full border border-[#D7A441]/40 bg-[#D7A441]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#D7A441] uppercase">
                        {calendarTarget === "checkIn" ? "Select Check-in" : "Select Check-out"}
                      </div>

                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 transition"
                        aria-label="Next month"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Single Month View for Mobile */}
                    {renderMonthCalendar(month1Date, true)}

                    {/* Clear action */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-white/50">
                        {checkIn ? `In: ${formatDateDisplay(checkIn)}` : ""}
                        {checkOut ? ` • Out: ${formatDateDisplay(checkOut)}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCheckIn("");
                          setCheckOut("");
                          setCalendarTarget("checkIn");
                        }}
                        className="text-[11px] font-semibold text-[#D7A441] hover:underline"
                      >
                        Clear dates
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Guests & Rooms Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileSheetTab(mobileSheetTab === "guests" ? "none" : "guests")}
                    className={`w-full flex items-center justify-between rounded-2xl border p-3 text-left transition cursor-pointer ${
                      mobileSheetTab === "guests"
                        ? "border-[#D7A441] bg-[#FAF5EB] ring-2 ring-[#D7A441]/30"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D7A441]/10 text-[#B88428]">
                        <Users size={16} />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Guests &amp; Rooms
                        </span>
                        <span className="block text-xs font-bold text-neutral-900 mt-0.5">
                          {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-neutral-400 transition-transform ${mobileSheetTab === "guests" ? "rotate-180 text-[#B88428]" : ""}`}
                    />
                  </button>

                  {/* MOBILE LUXURY GUEST STEPPERS (WHEN EXPANDED) */}
                  {mobileSheetTab === "guests" && (
                    <div className="mt-2.5 rounded-2xl border border-white/15 bg-[#0D0E12] p-4 text-white shadow-xl animate-in fade-in duration-200">
                      {/* Adults Stepper */}
                      <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-semibold text-white">Adults</h5>
                          <p className="text-[10px] text-white/50">13 years &amp; above</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() => updateAdults(-1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 active:scale-95"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{adults}</span>
                          <button
                            type="button"
                            disabled={adults >= 10}
                            onClick={() => updateAdults(1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white active:scale-95"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Children Stepper */}
                      <div className="pt-3 flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-semibold text-white">Children</h5>
                          <p className="text-[10px] text-white/50">Below 12 years</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={children <= 0}
                            onClick={() => updateChildren(-1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 active:scale-95"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{children}</span>
                          <button
                            type="button"
                            disabled={children >= 8}
                            onClick={() => updateChildren(1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white active:scale-95"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Apply CTA */}
              <div className="pt-3.5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsBottomSheetOpen(false);
                    setMobileSheetTab("none");
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-5 py-3 text-xs sm:text-sm font-bold text-neutral-950 shadow-md active:scale-98 transition cursor-pointer"
                >
                  Apply &amp; Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP & TABLET: LUXURY DATE & GUEST CONTROLS ROW (MATCHING HOME PAGE HERO EXACTLY) */}
        <div ref={searchContainerRef} className="relative mt-6 hidden sm:block pt-5 border-t border-neutral-200/60">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] items-center gap-3">

            {/* 1. CHECK-IN CARD */}
            <button
              type="button"
              onClick={() => {
                setCalendarTarget("checkIn");
                setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkIn" ? null : "calendar");
              }}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all text-left cursor-pointer ${
                activeDropdown === "calendar" && calendarTarget === "checkIn"
                  ? "border-[#D7A441] bg-[#FAF5EB] shadow-md ring-2 ring-[#D7A441]/30"
                  : "border-neutral-200/90 bg-white hover:border-[#D7A441]/60 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428] group-hover:scale-105 group-hover:bg-[#D7A441]/20 transition-all">
                  <CalendarDays size={18} className="sm:size-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase leading-none">
                    Check-In Date
                  </span>
                  <span className="block truncate text-xs sm:text-sm font-bold text-neutral-900 mt-1 leading-tight group-hover:text-[#B88428] transition-colors">
                    {formatDateDisplay(checkIn)}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-neutral-400 group-hover:text-[#B88428] shrink-0 transition-transform ${
                  activeDropdown === "calendar" && calendarTarget === "checkIn" ? "rotate-180 text-[#B88428]" : ""
                }`}
              />
            </button>

            {/* Center Arrow Separator between dates */}
            <div className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200/70 text-neutral-400">
              <ArrowRight size={14} />
            </div>

            {/* 2. CHECK-OUT CARD */}
            <button
              type="button"
              onClick={() => {
                setCalendarTarget("checkOut");
                setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkOut" ? null : "calendar");
              }}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all text-left cursor-pointer ${
                activeDropdown === "calendar" && calendarTarget === "checkOut"
                  ? "border-[#D7A441] bg-[#FAF5EB] shadow-md ring-2 ring-[#D7A441]/30"
                  : "border-neutral-200/90 bg-white hover:border-[#D7A441]/60 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428] group-hover:scale-105 group-hover:bg-[#D7A441]/20 transition-all">
                  <CalendarDays size={18} className="sm:size-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase leading-none">
                    Check-Out Date
                  </span>
                  <span className="block truncate text-xs sm:text-sm font-bold text-neutral-900 mt-1 leading-tight group-hover:text-[#B88428] transition-colors">
                    {formatDateDisplay(checkOut)}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-neutral-400 group-hover:text-[#B88428] shrink-0 transition-transform ${
                  activeDropdown === "calendar" && calendarTarget === "checkOut" ? "rotate-180 text-[#B88428]" : ""
                }`}
              />
            </button>

            {/* 3. GUESTS CARD */}
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "guests" ? null : "guests")}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all text-left cursor-pointer ${
                activeDropdown === "guests"
                  ? "border-[#D7A441] bg-[#FAF5EB] shadow-md ring-2 ring-[#D7A441]/30"
                  : "border-neutral-200/90 bg-white hover:border-[#D7A441]/60 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428] group-hover:scale-105 group-hover:bg-[#D7A441]/20 transition-all">
                  <Users size={18} className="sm:size-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase leading-none">
                    Guests &amp; Rooms
                  </span>
                  <span className="block truncate text-xs sm:text-sm font-bold text-neutral-900 mt-1 leading-tight group-hover:text-[#B88428] transition-colors">
                    {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-neutral-400 group-hover:text-[#B88428] shrink-0 transition-transform ${
                  activeDropdown === "guests" ? "rotate-180 text-[#B88428]" : ""
                }`}
              />
            </button>

          </div>

          {/* =====================================================
              DROPDOWN 1: LUXURY DUAL-MONTH CALENDAR (HOME PAGE EXACT DESIGN)
          ===================================================== */}
          {activeDropdown === "calendar" && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[95vw] max-w-[640px] rounded-3xl border border-white/15 bg-[#0D0E12] p-4 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-left animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto">

              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5 border-b border-white/10 pb-3">
                <button
                  type="button"
                  disabled={calendarMonthOffset <= 0}
                  onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="rounded-full border border-[#D7A441]/40 bg-[#D7A441]/10 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.2em] text-[#D7A441] uppercase">
                  {calendarTarget === "checkIn" ? "Select Check-in" : "Select Check-out"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    aria-label="Close calendar"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Dual Month View */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {renderMonthCalendar(month1Date)}
                <div className="hidden sm:block w-px bg-white/10" />
                <div className="hidden sm:block">
                  {renderMonthCalendar(month2Date)}
                </div>
              </div>

              {/* Footer Clear Action */}
              <div className="mt-4 sm:mt-5 pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-[11px] text-white/50">
                  {checkIn ? `Check-in: ${formatDateDisplay(checkIn)}` : "Select check-in"}
                  {checkOut ? ` • Check-out: ${formatDateDisplay(checkOut)}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn("");
                    setCheckOut("");
                    setCalendarTarget("checkIn");
                  }}
                  className="text-xs font-semibold text-[#D7A441] hover:underline cursor-pointer"
                >
                  Clear dates
                </button>
              </div>

            </div>
          )}

          {/* =====================================================
              DROPDOWN 2: LUXURY GUESTS (HOME PAGE EXACT DESIGN)
          ===================================================== */}
          {activeDropdown === "guests" && (
            <div className="absolute right-0 top-full mt-3 w-full sm:w-[340px] max-w-[calc(100vw-32px)] rounded-3xl border border-white/15 bg-[#0D0E12] p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-left animate-in fade-in duration-200">

              {/* Header */}
              <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                    Select Guests
                  </h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Rooms &amp; occupancy
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Adults Stepper */}
              <div className="py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-white">Adults</h5>
                  <p className="text-xs text-white/50 mt-0.5">13 years &amp; above</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => updateAdults(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 hover:bg-white/15 transition active:scale-95 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">
                    {adults}
                  </span>
                  <button
                    type="button"
                    disabled={adults >= 10}
                    onClick={() => updateAdults(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Children Stepper */}
              <div className="py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-white">Children</h5>
                  <p className="text-xs text-white/50 mt-0.5">Below 12 years</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => updateChildren(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 hover:bg-white/15 transition active:scale-95 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">
                    {children}
                  </span>
                  <button
                    type="button"
                    disabled={children >= 8}
                    onClick={() => updateChildren(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Done Button */}
              <div className="mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="w-full rounded-full bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_4px_20px_rgba(215,164,65,0.4)] transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}

/**
 * HotelMobileFilterTrigger: Mobile button to open filters drawer
 */
export function HotelMobileFilterTrigger({
  onClick = () => {},
  activeFilterCount = 0,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-neutral-200/90 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-neutral-900 shadow-sm hover:border-indigo-300 hover:shadow-md lg:hidden active:scale-95 transition cursor-pointer"
    >
      <SlidersHorizontal size={17} className="text-indigo-600" />
      <span>Filter Hotels &amp; Preferences</span>
      {activeFilterCount > 0 && (
        <span className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

/**
 * HotelMobileFilterDrawer: Slide-over drawer for mobile devices
 */
export function HotelMobileFilterDrawer({
  isOpen = false,
  onClose = () => {},
  filteredHotelsCount = 0,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-indigo-600" />
              <h2 className="text-base font-bold text-neutral-900">Filters</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {children}
        </div>

        <div className="pt-6 border-t border-neutral-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:brightness-105 active:scale-98 transition cursor-pointer"
          >
            Show Results ({filteredHotelsCount})
          </button>
        </div>
      </aside>
    </div>
  );
}

/**
 * HotelSearchFilter: Reusable container component combining Search Summary Banner,
 * Filter sidebar, and Mobile drawer with children (results content).
 */
export default function HotelSearchFilter({
  // Search state
  location = "",
  setLocation = () => {},
  hotelId = "",
  setHotelId = () => {},
  checkIn = "",
  setCheckIn = () => {},
  checkOut = "",
  setCheckOut = () => {},
  guests = "2",
  setGuests = () => {},

  // Filter state
  minPrice = 0,
  setMinPrice = () => {},
  maxPrice = 20000,
  setMaxPrice = () => {},
  clearFilters = () => {},
  activeFilterCount = 0,

  // Mobile drawer state
  mobileFiltersOpen = false,
  setMobileFiltersOpen = () => {},
  filteredHotelsCount = 0,

  // Date helpers (optional overrides)
  minDate = getLocalDateString(),
  formatDateFn = formatDate,

  // Results children
  children,
}) {
  return (
    <>
      {/* SEARCH SUMMARY BANNER */}
      <HotelSearchBanner
        location={location}
        setLocation={setLocation}
        hotelId={hotelId}
        setHotelId={setHotelId}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        setCheckIn={setCheckIn}
        setCheckOut={setCheckOut}
        setGuests={setGuests}
        minDate={minDate}
        formatDateFn={formatDateFn}
      />

      {/* MAIN CONTENT SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:px-8">
        {/* MOBILE FILTER TRIGGER */}
        <HotelMobileFilterTrigger
          onClick={() => setMobileFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* DESKTOP STICKY FILTERS */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 rounded-3xl border border-neutral-200/80 bg-white/95 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] backdrop-blur-md">
              <HotelFilterContent
                location={location}
                setLocation={setLocation}
                setHotelId={setHotelId}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                guests={guests}
                setGuests={setGuests}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* RESULTS CONTENT (Passed as children) */}
          <div className="min-w-0">{children}</div>
        </div>
      </section>

      {/* MOBILE FILTERS DRAWER */}
      <HotelMobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filteredHotelsCount={filteredHotelsCount}
      >
        <HotelFilterContent
          location={location}
          setLocation={setLocation}
          setHotelId={setHotelId}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          guests={guests}
          setGuests={setGuests}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </HotelMobileFilterDrawer>
    </>
  );
}
