import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  MapPin,
  Minus,
  Plus,
  Search,
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
 * FilterContent: Reusable Filter Stays sidebar & drawer matching reference mobile screenshot.
 */
export function HotelFilterContent({
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
  minPrice = 0,
  setMinPrice = () => {},
  maxPrice = 20000,
  setMaxPrice = () => {},
  clearFilters = () => {},
  activeFilterCount = 0,
  destinations = ["Chennai", "Pondicherry", "Kodaikanal"],
  onApply = () => {},
}) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'calendar' | 'guests' | null
  const [calendarTarget, setCalendarTarget] = useState("checkIn"); // 'checkIn' | 'checkOut'
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  const [destinationQuery, setDestinationQuery] = useState("");
  const [isDestinationOpen, setIsDestinationOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isOccupancyOpen, setIsOccupancyOpen] = useState(true);

  const filterContainerRef = useRef(null);

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target)) {
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
  const todayStr = getLocalDateString(today);
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateClick = (dateStr) => {
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
        setActiveDropdown(null);
      }
    }
  };

  // Generate days for the current calendar view
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, "0");
    const mStr = String(month + 1).padStart(2, "0");
    calendarDays.push(`${year}-${mStr}-${dStr}`);
  }

  // Filter destination chips
  const filteredDestinations = destinations.filter((city) =>
    city.toLowerCase().includes(destinationQuery.toLowerCase().trim())
  );

  return (
    <div ref={filterContainerRef} className="w-full text-neutral-900 select-none">
      {/* 1. HEADER */}
      <div className="flex items-center gap-3 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF3E7] text-[#C5922C] shadow-sm">
            <SlidersHorizontal size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#101D38] font-playfair tracking-tight leading-snug">
              Filter Stays
            </h2>
            <p className="text-[11px] sm:text-xs text-[#717E95] leading-snug mt-0.5">
              Refine properties to find your perfect stay
            </p>
          </div>
        </div>


      </div>

      {/* 2. YOUR STAY DATES & GUESTS */}
      <div className="mt-4 rounded-2xl border border-[#F2E8DC] bg-[#FFFDF9] p-3 sm:p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#C5922C] uppercase">
          <CalendarDays size={14} className="text-[#C5922C]" />
          <span>YOUR STAY DATES &amp; GUESTS</span>
        </div>

        {/* Check-in Date */}
        <div>
          <button
            type="button"
            onClick={() => {
              setCalendarTarget("checkIn");
              setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkIn" ? null : "calendar");
            }}
            className={`w-full flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer text-left ${
              activeDropdown === "calendar" && calendarTarget === "checkIn"
                ? "border-[#C5922C] bg-white ring-2 ring-[#C5922C]/20 shadow-sm"
                : "border-[#EFE5D8] bg-white hover:border-[#C5922C]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                <CalendarDays size={17} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-[#8B96A5] leading-none">
                  Check-in Date
                </span>
                <span className="block truncate text-sm font-bold text-[#101D38] mt-1 leading-tight">
                  {formatDateDisplay(checkIn)}
                </span>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#8B96A5] shrink-0 transition-transform ${
                activeDropdown === "calendar" && calendarTarget === "checkIn" ? "rotate-180 text-[#C5922C]" : ""
              }`}
            />
          </button>
        </div>

        {/* Check-out Date */}
        <div>
          <button
            type="button"
            onClick={() => {
              setCalendarTarget("checkOut");
              setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkOut" ? null : "calendar");
            }}
            className={`w-full flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer text-left ${
              activeDropdown === "calendar" && calendarTarget === "checkOut"
                ? "border-[#C5922C] bg-white ring-2 ring-[#C5922C]/20 shadow-sm"
                : "border-[#EFE5D8] bg-white hover:border-[#C5922C]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                <CalendarDays size={17} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-[#8B96A5] leading-none">
                  Check-out Date
                </span>
                <span className="block truncate text-sm font-bold text-[#101D38] mt-1 leading-tight">
                  {formatDateDisplay(checkOut)}
                </span>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#8B96A5] shrink-0 transition-transform ${
                activeDropdown === "calendar" && calendarTarget === "checkOut" ? "rotate-180 text-[#C5922C]" : ""
              }`}
            />
          </button>
        </div>

        {/* Guests & Rooms */}
        <div>
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(activeDropdown === "guests" ? null : "guests");
            }}
            className={`w-full flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer text-left ${
              activeDropdown === "guests"
                ? "border-[#C5922C] bg-white ring-2 ring-[#C5922C]/20 shadow-sm"
                : "border-[#EFE5D8] bg-white hover:border-[#C5922C]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                <Users size={17} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-[#8B96A5] leading-none">
                  Guests &amp; Rooms
                </span>
                <span className="block truncate text-sm font-bold text-[#101D38] mt-1 leading-tight">
                  {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#8B96A5] shrink-0 transition-transform ${
                activeDropdown === "guests" ? "rotate-180 text-[#C5922C]" : ""
              }`}
            />
          </button>
        </div>

        {/* INLINE CALENDAR POPOVER */}
        {activeDropdown === "calendar" && (
          <div className="mt-2 rounded-2xl border border-[#EFE5D8] bg-white p-3 shadow-lg animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F5EDE2]">
              <button
                type="button"
                disabled={calendarMonthOffset <= 0}
                onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-[#FAF3E7] hover:text-[#C5922C] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="text-xs font-bold text-[#101D38]">
                {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
              </span>

              <button
                type="button"
                onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-[#FAF3E7] hover:text-[#C5922C] transition cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Days of Week */}
            <div className="mt-2 grid grid-cols-7 text-center text-[10px] font-bold text-[#8B96A5] uppercase">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span className="text-[#C5922C]">Sa</span>
              <span className="text-[#C5922C]">Su</span>
            </div>

            {/* Days Grid */}
            <div className="mt-1.5 grid grid-cols-7 gap-y-1 text-center text-xs">
              {calendarDays.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} className="h-7" />;
                }

                const dayNum = parseInt(dateStr.split("-")[2], 10);
                const isPast = dateStr < todayStr;
                const isCheckIn = dateStr === checkIn;
                const isCheckOut = dateStr === checkOut;
                const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                let btnClass = "relative z-10 h-7 w-7 mx-auto flex items-center justify-center transition-all text-xs font-medium ";

                if (isCheckIn || isCheckOut) {
                  btnClass += "rounded-lg bg-[#C5922C] text-white font-bold shadow-sm";
                } else if (isInRange) {
                  btnClass += "rounded-none w-full bg-[#FAF3E7] text-[#C5922C] font-semibold";
                } else if (isPast) {
                  btnClass += "text-neutral-300 cursor-not-allowed";
                } else {
                  btnClass += "rounded-lg text-[#101D38] hover:bg-[#FAF3E7] hover:text-[#C5922C] cursor-pointer";
                }

                return (
                  <div key={dateStr} className="relative flex items-center justify-center h-7">
                    {isCheckIn && checkOut && (
                      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#FAF3E7] pointer-events-none" />
                    )}
                    {isCheckOut && checkIn && (
                      <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#FAF3E7] pointer-events-none" />
                    )}
                    {isInRange && (
                      <div className="absolute inset-0 bg-[#FAF3E7] pointer-events-none" />
                    )}
                    <button
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDateClick(dateStr)}
                      className={btnClass}
                    >
                      {dayNum}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-2.5 pt-2 border-t border-[#F5EDE2] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setCheckIn("");
                  setCheckOut("");
                  setCalendarTarget("checkIn");
                }}
                className="text-[11px] font-semibold text-[#C5922C] hover:underline cursor-pointer"
              >
                Clear dates
              </button>
              <button
                type="button"
                onClick={() => setActiveDropdown(null)}
                className="rounded-lg bg-[#C5922C] px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:brightness-105 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* INLINE GUESTS STEPPER */}
        {activeDropdown === "guests" && (
          <div className="mt-2 rounded-2xl border border-[#EFE5D8] bg-white p-3 shadow-lg animate-in fade-in duration-200">
            <div className="pb-2 border-b border-[#F5EDE2] flex items-center justify-between">
              <span className="text-xs font-bold text-[#101D38]">Guests &amp; Occupancy</span>
              <button
                type="button"
                onClick={() => setActiveDropdown(null)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Adults */}
            <div className="py-2 border-b border-[#F5EDE2] flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-[#101D38]">Adults</span>
                <span className="block text-[10px] text-[#8B96A5]">13+ years</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => updateAdults(-1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EFE5D8] bg-white text-neutral-700 disabled:opacity-30 hover:border-[#C5922C] hover:text-[#C5922C] transition cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#101D38]">{adults}</span>
                <button
                  type="button"
                  disabled={adults >= 10}
                  onClick={() => updateAdults(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EFE5D8] bg-white text-neutral-700 hover:border-[#C5922C] hover:text-[#C5922C] transition cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="py-2 border-b border-[#F5EDE2] flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-[#101D38]">Children</span>
                <span className="block text-[10px] text-[#8B96A5]">0-12 years</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={children <= 0}
                  onClick={() => updateChildren(-1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EFE5D8] bg-white text-neutral-700 disabled:opacity-30 hover:border-[#C5922C] hover:text-[#C5922C] transition cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#101D38]">{children}</span>
                <button
                  type="button"
                  disabled={children >= 8}
                  onClick={() => updateChildren(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EFE5D8] bg-white text-neutral-700 hover:border-[#C5922C] hover:text-[#C5922C] transition cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setActiveDropdown(null)}
                className="w-full rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] py-2 text-xs font-bold text-neutral-950 shadow-sm cursor-pointer hover:brightness-105 active:scale-[0.99] transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. DESTINATION / CITY */}
      <div className="mt-5 pt-3.5 border-t border-[#F5EDE2]">
        <div
          onClick={() => setIsDestinationOpen((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#C5922C]" />
            <span className="text-xs font-bold text-[#C5922C] uppercase tracking-wider">
              Destination / City
            </span>
          </div>
          <ChevronUp
            size={16}
            className={`text-[#C5922C] transition-transform duration-200 ${
              isDestinationOpen ? "" : "rotate-180"
            }`}
          />
        </div>

        {isDestinationOpen && (
          <div className="mt-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 rounded-xl border border-[#EBE3D7] bg-[#FAFAF8] px-3.5 py-2.5 text-xs text-[#101D38] focus-within:border-[#C5922C] focus-within:bg-white transition-all">
              <Search size={15} className="text-[#9CA3AF] shrink-0" />
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                placeholder="Search destination or city"
                className="w-full bg-transparent outline-none placeholder:text-[#9CA3AF] text-xs text-[#101D38]"
              />
              {destinationQuery && (
                <button
                  type="button"
                  onClick={() => setDestinationQuery("")}
                  className="text-[#9CA3AF] hover:text-[#101D38]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Destination Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredDestinations.map((city) => {
                const active = location === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setLocation(active ? "" : city);
                      setHotelId("");
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-[#C5922C] text-white shadow-sm ring-1 ring-[#C5922C]"
                        : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#C5922C]/50 hover:bg-[#FAF6F0]"
                    }`}
                  >
                    {active && (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/25 text-white">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                    )}
                    <span>{city}</span>
                  </button>
                );
              })}
            </div>

            {/* Subtext info & Clear all */}
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-xs text-[#6B8CB2] font-medium">
                {location ? `Selected: ${location}` : "Showing all destinations"}
              </span>
              {(location || destinationQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation("");
                    setHotelId("");
                    setDestinationQuery("");
                  }}
                  className="text-xs font-bold text-[#C5922C] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. PRICE PER NIGHT (₹) */}
      <div className="mt-5 pt-3.5 border-t border-[#F5EDE2]">
        <div
          onClick={() => setIsPriceOpen((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[#C5922C]" />
            <span className="text-xs font-bold text-[#C5922C] uppercase tracking-wider">
              Price per night (₹)
            </span>
          </div>
          <ChevronUp
            size={16}
            className={`text-[#C5922C] transition-transform duration-200 ${
              isPriceOpen ? "" : "rotate-180"
            }`}
          />
        </div>

        {isPriceOpen && (
          <div className="mt-3">
            {/* Two price boxes */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-[#EBE3D7] bg-[#FAFAF8] px-3.5 py-2.5 text-sm font-bold text-[#101D38]">
                ₹{Number(minPrice).toLocaleString("en-IN")}
              </div>
              <span className="text-[#C5922C] font-bold text-base px-1 select-none">–</span>
              <div className="flex-1 rounded-xl border border-[#EBE3D7] bg-[#FAFAF8] px-3.5 py-2.5 text-sm font-bold text-[#101D38]">
                ₹{Number(maxPrice).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Dual slider */}
            <div className="relative mt-4 h-6">
              <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[#EBE3D7]" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#C5922C]"
                style={{
                  left: `${(minPrice / 20000) * 100}%`,
                  right: `${100 - (maxPrice / 20000) * 100}%`,
                }}
              />

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
                className="price-slider absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
              />

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
                className="price-slider absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
              />
            </div>

            <div className="mt-1 flex justify-between text-[11px] font-medium text-[#717E95]">
              <span>₹1,000</span>
              <span>₹20,000</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. GUESTS OCCUPANCY */}
      <div className="mt-5 pt-3.5 border-t border-[#F5EDE2]">
        <div
          onClick={() => setIsOccupancyOpen((prev) => !prev)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#C5922C]" />
            <span className="text-xs font-bold text-[#C5922C] uppercase tracking-wider">
              Guests Occupancy
            </span>
          </div>
          <ChevronUp
            size={16}
            className={`text-[#C5922C] transition-transform duration-200 ${
              isOccupancyOpen ? "" : "rotate-180"
            }`}
          />
        </div>

        {isOccupancyOpen && (
          <div className="mt-3 space-y-2">
            {[
              { value: "2", label: "1–2 guests" },
              { value: "4", label: "2–4 guests" },
              { value: "6", label: "4–6 guests" },
              { value: "8", label: "6–8 guests" },
            ].map((option) => {
              const active = guests === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => setGuests(option.value)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                    active
                      ? "border-[#D7A441] bg-[#FFF8EE] shadow-sm font-bold text-[#101D38]"
                      : "border-[#EFE5D8] bg-white text-[#4B5563] hover:border-[#D7A441]/50 hover:bg-[#FAF6F0]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users
                      size={15}
                      className={active ? "text-[#C5922C]" : "text-[#8B96A5]"}
                    />
                    <span className="text-xs">{option.label}</span>
                  </div>

                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                      active
                        ? "bg-[#C5922C] text-white"
                        : "border-2 border-[#D1D5DB] bg-transparent"
                    }`}
                  >
                    {active && <Check size={12} className="stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. ACTION BUTTONS */}
      <div className="mt-6 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            clearFilters?.();
            setDestinationQuery("");
          }}
          className="flex-1 rounded-xl border border-[#F2E8DC] bg-white hover:bg-[#FAF6F0] hover:border-[#D7A441]/50 py-3.5 px-3 text-xs sm:text-sm font-bold text-neutral-700 active:scale-[0.98] cursor-pointer transition-all text-center"
        >
          Clear Filters
        </button>

        <button
          type="button"
          onClick={() => {
            onApply?.();
          }}
          className="flex-[1.5] rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] hover:brightness-105 active:scale-[0.98] py-3.5 px-4 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_4px_16px_rgba(197,146,44,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <SlidersHorizontal size={15} />
          <span>Apply Filters</span>
          <ArrowRight size={15} />
        </button>
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
  selectedHotelName = "",
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

  const navigate = useNavigate();
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

            // SQUARE SELECTED DESIGN (rounded-md, distinct edges, gold fill, NOT circular)
            let btnClass = "relative z-10 h-8 w-8 mx-auto flex items-center justify-center transition-all text-xs font-semibold ";

            if (isCheckIn || isCheckOut) {
              btnClass += "rounded-md bg-[#D7A441] text-neutral-950 font-bold shadow-[0_2px_12px_rgba(215,164,65,0.7)] ring-1 ring-white/40";
            } else if (isInRange) {
              btnClass += "rounded-none w-full bg-[#D7A441]/25 text-[#F5C869] font-medium";
            } else if (isPast) {
              btnClass += "rounded-md text-white/20 cursor-not-allowed";
            } else {
              btnClass += "rounded-md text-white/90 hover:bg-white/15 hover:text-white cursor-pointer";
            }

            return (
              <div key={dateStr} className="relative flex items-center justify-center h-8">
                {/* Connecting range track between Check-in and Check-out */}
                {isCheckIn && checkOut && (
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#D7A441]/20 pointer-events-none" />
                )}
                {isCheckOut && checkIn && (
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#D7A441]/20 pointer-events-none" />
                )}
                {isInRange && (
                  <div className="absolute inset-0 bg-[#D7A441]/20 pointer-events-none" />
                )}

                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dateStr, isMobile)}
                  className={btnClass}
                  aria-label={dateStr}
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
          <div className="flex flex-col">
            {/* Back Button with Text */}
            <button
              type="button"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              aria-label="Back to Hotels & Resorts"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer mb-2.5 w-fit"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 text-neutral-700" />
              <span>Hotels &amp; Resorts</span>
            </button>

            <div>
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-[#B88428] mb-1">
                DISCOVER YOUR NEXT STAY
              </p>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 font-sans">
                Available Hotels &amp; Resorts
              </h1>

              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Handpicked stays across South India&apos;s finest destinations.
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
                  {selectedHotelName || location || "All Locations"}
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



        {/* MOBILE ONLY: SLIDE-DOWN TOP SHEET FOR SEARCH CONTROLS */}
        {isBottomSheetOpen && (
          <div className="fixed inset-0 z-[110] sm:hidden animate-in fade-in duration-200 flex flex-col justify-start">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsBottomSheetOpen(false);
                setMobileSheetTab("none");
              }}
            />

            {/* Top Sheet Modal */}
            <div className="relative z-[120] max-h-[88vh] overflow-y-auto rounded-b-3xl border-b border-neutral-200 bg-white p-5 shadow-2xl animate-in slide-in-from-top duration-300">

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

              {/* Drag Handle Indicator at bottom for top-down sheet */}
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-neutral-300" />
            </div>
          </div>
        )}
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
      className="mb-5 flex w-full items-center justify-between rounded-2xl border border-[#F2E8DC] bg-white px-4 py-3.5 text-xs sm:text-sm font-bold text-neutral-900 shadow-sm hover:border-[#D7A441] lg:hidden active:scale-[0.99] transition cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF3E7] text-[#C5922C]">
          <SlidersHorizontal size={16} />
        </div>
        <span>Filter Stays</span>
      </div>
      {activeFilterCount > 0 ? (
        <span className="rounded-full bg-[#C5922C] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
          {activeFilterCount} active
        </span>
      ) : (
        <span className="text-xs text-neutral-400 font-medium">Refine properties</span>
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
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl z-[101] sidebar-scrollbar">
        <div className="flex justify-end pb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black cursor-pointer"
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>

        {children}
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
  selectedHotelName = "",
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
  const destinations = ["Chennai", "Pondicherry", "Kodaikanal"];

  return (
    <>
      {/* SEARCH SUMMARY BANNER */}
      <HotelSearchBanner
        location={location}
        setLocation={setLocation}
        hotelId={hotelId}
        setHotelId={setHotelId}
        selectedHotelName={selectedHotelName}
        destinations={destinations}
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* DESKTOP STICKY FILTERS */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-contain rounded-3xl border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.03)] sidebar-scrollbar">
              <HotelFilterContent
                location={location}
                setLocation={setLocation}
                hotelId={hotelId}
                setHotelId={setHotelId}
                checkIn={checkIn}
                setCheckIn={setCheckIn}
                checkOut={checkOut}
                setCheckOut={setCheckOut}
                guests={guests}
                setGuests={setGuests}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
                destinations={destinations}
                onApply={() => {}}
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
          hotelId={hotelId}
          setHotelId={setHotelId}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          guests={guests}
          setGuests={setGuests}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          destinations={destinations}
          onApply={() => setMobileFiltersOpen(false)}
        />
      </HotelMobileFilterDrawer>
    </>
  );
}
