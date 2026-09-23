import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Building2,
  CalendarDays,
  Users,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";

import chennai04 from "../assets/hero/chennai/Chennai_04.png";
import pondicherry01 from "../assets/hero/pondicherry/Pondicherry_01.png";
import kodaikanal01 from "../assets/hero/kodaikanal/kodaikanal_01.png";
import chennai01 from "../assets/hero/chennai/Chennai_01.png";
import pondicherry02 from "../assets/hero/pondicherry/Pondicherry_02.png";
import kodaikanal02 from "../assets/hero/kodaikanal/kodaikanal_02.png";

const HERO_IMAGES = [
  { src: chennai04, alt: "Besant Nagar Beach & Lighthouse Chennai" },
  { src: pondicherry01, alt: "Pondicherry Heritage Monument" },
  { src: kodaikanal01, alt: "Kodaikanal Hill Station" },
  { src: chennai01, alt: "Chennai Architecture" },
  { src: pondicherry02, alt: "Pondicherry Promenade" },
  { src: kodaikanal02, alt: "Kodaikanal Valley View" },
];

const DESTINATIONS = [
  // ============================================================
  // CITIES (from Footer Directory)
  // ============================================================
  {
    type: "city",
    name: "Pondicherry",
    subtext: "Puducherry, South India",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "city",
    name: "Chennai",
    subtext: "Chennai, Tamil Nadu",
    city: "Chennai",
    queryValue: "Chennai",
  },
  {
    type: "city",
    name: "Kodaikanal",
    subtext: "Princess of Hill Stations, Tamil Nadu",
    city: "Kodaikanal",
    queryValue: "Kodaikanal",
  },

  // ============================================================
  // PONDICHERRY HOTELS & STAYS (from Footer Directory)
  // ============================================================
  {
    type: "property",
    name: "Grand Ocean Inn",
    subtext: "Kuyavarpalayam, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "property",
    name: "Signature Grande",
    subtext: "Kottakuppam, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "property",
    name: "Jardin pradisiaque",
    subtext: "Kottakuppam, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
    hotelId: "c37bc8dd-51a1-4c90-86ea-7b5144213804",
  },
  {
    type: "property",
    name: "Hotel MGR Residency",
    subtext: "Karuvadikuppam Main Road, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "property",
    name: "Hotel 1Square",
    subtext: "Auroville, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "property",
    name: "DoubleOne Stays",
    subtext: "Auroville, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "property",
    name: "VMB Residency",
    subtext: "Karuvadikuppam, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },
  {
    type: "property",
    name: "SS Grand",
    subtext: "Kottakuppam, Pondicherry",
    city: "Pondicherry",
    queryValue: "Pondicherry",
  },

  // ============================================================
  // CHENNAI HOTELS & STAYS (from Footer Directory)
  // ============================================================
  {
    type: "property",
    name: "Starlight Hotels T-Nagar",
    subtext: "Sivaji Street, T. Nagar, Chennai",
    city: "Chennai",
    queryValue: "Chennai",
  },
  {
    type: "property",
    name: "AR Residency",
    subtext: "Ramachandra Street, T. Nagar, Chennai",
    city: "Chennai",
    queryValue: "Chennai",
  },
  {
    type: "property",
    name: "Starlight Hotels DLF",
    subtext: "Manapakkam, Chennai",
    city: "Chennai",
    queryValue: "Chennai",
  },
  {
    type: "property",
    name: "Starlight Hotels OMR Thoraipakkam",
    subtext: "Thoraipakkam, Chennai",
    city: "Chennai",
    queryValue: "Chennai",
  },
  {
    type: "property",
    name: "Starlight Hotels Mylapore",
    subtext: "Mylapore, Chennai",
    city: "Chennai",
    queryValue: "Chennai",
  },
  {
    type: "property",
    name: "Pondy Bazaar",
    subtext: "T-Nagar, Chennai",
    city: "Chennai",
    queryValue: "Chennai",
  },

  // ============================================================
  // KODAIKANAL HOTELS & STAYS (from Footer Directory)
  // ============================================================
  {
    type: "property",
    name: "STARLIGHT HOTELS KODAI",
    subtext: "Vilpatti, Kodaikanal",
    city: "Kodaikanal",
    queryValue: "Kodaikanal",
    hotelId: "4b6283cb-639a-47dd-bf6d-343478c0874a",
  },
];

function formatDateDisplay(dateStr) {
  if (!dateStr) return "Add Date";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

export default function Hero({ onSearch }) {
  const navigate = useNavigate();

  // Background slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Search state
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [displayLocationName, setDisplayLocationName] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Dropdown open states
  const [activeDropdown, setActiveDropdown] = useState(null); // 'location' | 'calendar' | 'guests' | null
  const [calendarTarget, setCalendarTarget] = useState("checkIn"); // 'checkIn' | 'checkOut'

  // Calendar view offset
  const today = new Date();
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  // Mobile search modal & tab state (matches mobile reference design)
  const [mobileSearchModalOpen, setMobileSearchModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("where"); // 'where' | 'checkIn' | 'checkOut' | 'guests'

  const containerRef = useRef(null);

  // Rotate hero background images automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalGuests = adults + children;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveDropdown(null);

    const params = new URLSearchParams();
    if (selectedLocation) params.set("location", selectedLocation);
    if (selectedHotelId) params.set("hotel", selectedHotelId);
    if (checkInDate) params.set("checkIn", checkInDate);
    if (checkOutDate) params.set("checkOut", checkOutDate);
    if (totalGuests) params.set("guests", String(totalGuests));

    if (onSearch) {
      onSearch({
        location: selectedLocation,
        hotel: selectedHotelId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: totalGuests,
      });
    } else {
      navigate(`/book-hotels?${params.toString()}`);
    }
  };

  // Filtered destination list (matches hotel name, area/subtext, or city)
  const filteredDestinations = DESTINATIONS.filter((d) =>
    d.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
    d.subtext.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
    (d.city && d.city.toLowerCase().includes(locationSearchTerm.toLowerCase()))
  );

  // Calendar calculations
  const month1Date = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
  const month2Date = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset + 1, 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateClick = (dateStr) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dateStr);
      setCheckOutDate("");
      setCalendarTarget("checkOut");
      if (mobileSearchModalOpen) {
        setMobileTab("checkOut");
      }
    } else {
      if (dateStr < checkInDate) {
        setCheckInDate(dateStr);
        setCheckOutDate("");
        setCalendarTarget("checkOut");
        if (mobileSearchModalOpen) {
          setMobileTab("checkOut");
        }
      } else {
        setCheckOutDate(dateStr);
        if (!mobileSearchModalOpen) {
          setActiveDropdown(null);
        } else {
          setMobileTab("guests");
        }
      }
    }
  };

  const renderMonthCalendar = (viewDate) => {
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

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return (
      <div className="w-full sm:w-[270px]">
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
            const isCheckIn = dateStr === checkInDate;
            const isCheckOut = dateStr === checkOutDate;
            const isInRange = checkInDate && checkOutDate && dateStr > checkInDate && dateStr < checkOutDate;

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
                  onClick={() => handleDateClick(dateStr)}
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
    <section className="relative w-full min-h-[100dvh] lg:h-screen lg:min-h-[720px] flex flex-col justify-center overflow-visible pt-20 pb-12 sm:pt-24 sm:pb-16 lg:py-0">

      {/* =====================================================
          BACKGROUND SLIDESHOW (FULL SCREEN FIT)
      ===================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } transition-transform duration-[6000ms]`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {/* Subtle Ambient Overlay so beach/sky and text remain crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* =====================================================
          HERO CONTENT CONTAINER (CENTERED ON MOBILE, LEFT-ALIGNED ON DESKTOP)
      ===================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 w-full flex flex-col items-center sm:items-start text-center sm:text-left">

        {/* 5-STAR LUXURY BADGE */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 sm:px-4 py-1.5 backdrop-blur-md shadow-lg mb-3 sm:mb-5">
          <Sparkles size={12} className="text-[#D7A441] fill-[#D7A441]" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
            5-Star Luxury Stays
          </span>
        </div>

        {/* HEADLINE */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight font-sans drop-shadow-md">
          Discover <br className="sm:hidden" />
          <span className="text-[#D7A441]">Luxury</span> Stays
        </h1>

        {/* SUBTITLE */}
        <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-base lg:text-lg text-white/90 font-normal leading-relaxed drop-shadow">
          Handpicked hotels &amp; resorts across India&apos;s finest destinations.
        </p>

        {/* CAROUSEL DOTS INDICATOR (MATCHING IMAGE 1) */}
        <div className="flex items-center justify-center gap-1.5 mt-3.5 sm:mt-4 lg:hidden">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentImageIndex
                  ? "w-6 bg-[#D7A441]"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* MOBILE FLOATING SEARCH CAPSULE (MATCHING IMAGE 1) */}
        <div className="w-full mt-6 sm:mt-8 max-w-md lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileSearchModalOpen(true);
              setMobileTab("where");
            }}
            className="w-full flex items-center justify-between p-2 pl-3.5 pr-2 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#D7A441] border border-white/10">
                <Search size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-white leading-tight">
                  {displayLocationName || "Search city, property, area..."}
                </span>
                <span className="block truncate text-[10px] text-white/50 mt-0.5 leading-none">
                  {checkInDate && checkOutDate
                    ? `${formatDateDisplay(checkInDate)} - ${formatDateDisplay(checkOutDate)}`
                    : "Any week • Any dates"}{" "}
                  • {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#D7A441] to-[#C5922C] text-black shadow-md">
              <ArrowRight size={16} className="stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* =====================================================
            SPACIOUS FROSTED GLASS CAPSULE SEARCH BAR (DESKTOP ONLY)
        ===================================================== */}
        <div ref={containerRef} className="relative mt-6 sm:mt-8 w-full max-w-5xl lg:max-w-6xl hidden lg:block">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex flex-row items-center rounded-full border border-white/20 bg-black/45 p-3 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl gap-1"
          >

            {/* 1. CITY / LOCATION */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "location" ? null : "location")}
                className={`w-full flex items-center justify-between gap-3 sm:gap-3.5 rounded-xl lg:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3 text-left transition-all ${
                  activeDropdown === "location"
                    ? "bg-white/15 border border-white/25 shadow-inner"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-[#D7A441]">
                    <MapPin size={18} className="sm:size-[20px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold tracking-wider text-white/50 uppercase leading-none">
                      City / Location
                    </span>
                    <span className="block truncate text-xs sm:text-sm lg:text-base font-bold text-white mt-1 leading-tight">
                      {displayLocationName || "Select destination"}
                    </span>
                  </div>
                </div>
                {activeDropdown === "location" ? (
                  <ChevronUp size={16} className="text-white/60 shrink-0 ml-1" />
                ) : (
                  <ChevronDown size={16} className="text-white/60 shrink-0 ml-1" />
                )}
              </button>

              {/* =====================================================
                  DROPDOWN 1: LOCATION (IMAGE 1 EXACT DESIGN)
              ===================================================== */}
              {activeDropdown === "location" && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-[380px] max-w-[calc(100vw-32px)] rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0D0E12] p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-left animate-in fade-in duration-200">

                  {/* Top Search Input */}
                  <div className="relative flex items-center rounded-full border border-[#D7A441] bg-black/60 px-4 py-2.5 shadow-[0_0_15px_rgba(215,164,65,0.15)]">
                    <Search size={16} className="text-[#D7A441] shrink-0 mr-2.5" />
                    <input
                      type="text"
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      placeholder="Where are you planning to stay?"
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/40 outline-none"
                      autoFocus
                    />
                    <span className="hidden sm:inline text-[11px] italic text-white/30 shrink-0 ml-1">
                      Property/ Location/ City
                    </span>
                  </div>

                  {/* Header Row */}
                  <div className="mt-4 flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold tracking-[0.2em] text-[#D7A441] uppercase">
                      Destination
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(null)}
                      className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <X size={13} />
                      <span>Close</span>
                    </button>
                  </div>

                  {/* Scrollable Destination List */}
                  <div className="mt-3 max-h-64 overflow-y-auto space-y-1.5 pr-1 hide-scrollbar">
                    {filteredDestinations.map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(dest.queryValue);
                          setSelectedHotelId(dest.hotelId || "");
                          setDisplayLocationName(dest.name);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-3.5 rounded-2xl p-2.5 transition-all text-left hover:bg-white/10 group"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#D7A441] group-hover:border-[#D7A441]/50 group-hover:bg-[#D7A441]/10 transition-colors">
                          {dest.type === "city" ? (
                            <MapPin size={16} />
                          ) : (
                            <Building2 size={16} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#F5C869] transition-colors">
                            {dest.name}
                          </h5>
                          <p className="text-[11px] text-white/50 truncate mt-0.5">
                            {dest.subtext}
                          </p>
                        </div>
                      </button>
                    ))}

                    {filteredDestinations.length === 0 && (
                      <div className="py-6 text-center text-xs text-white/40">
                        No matching destinations found.
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="hidden lg:block h-10 w-px bg-white/15 shrink-0 mx-1" />

            {/* 2 & 3. DATES CONTAINER (Side-by-side on mobile, inline on desktop) */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:contents">

              {/* 2. CHECK-IN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarTarget("checkIn");
                    setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkIn" ? null : "calendar");
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3.5 rounded-xl lg:rounded-full px-3 sm:px-5 py-2.5 sm:py-3 text-left transition-all ${
                    activeDropdown === "calendar" && calendarTarget === "checkIn"
                      ? "bg-white/15 border border-white/25 shadow-inner"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-[#D7A441]">
                    <CalendarDays size={18} className="sm:size-[20px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold tracking-wider text-white/50 uppercase leading-none">
                      Check-In
                    </span>
                    <span className="block truncate text-xs sm:text-sm lg:text-base font-bold text-white mt-1 leading-tight">
                      {formatDateDisplay(checkInDate)}
                    </span>
                  </div>
                </button>
              </div>

              {/* Center Arrow Separator between dates */}
              <div className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/15 text-white/60 mx-1">
                <ArrowRight size={14} />
              </div>

              {/* 3. CHECK-OUT */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarTarget("checkOut");
                    setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkOut" ? null : "calendar");
                  }}
                  className={`w-full flex items-center gap-2 sm:gap-3.5 rounded-xl lg:rounded-full px-3 sm:px-5 py-2.5 sm:py-3 text-left transition-all ${
                    activeDropdown === "calendar" && calendarTarget === "checkOut"
                      ? "bg-white/15 border border-white/25 shadow-inner"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-[#D7A441]">
                    <CalendarDays size={18} className="sm:size-[20px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold tracking-wider text-white/50 uppercase leading-none">
                      Check-Out
                    </span>
                    <span className="block truncate text-xs sm:text-sm lg:text-base font-bold text-white mt-1 leading-tight">
                      {formatDateDisplay(checkOutDate)}
                    </span>
                  </div>
                </button>
              </div>

            </div>

            {/* =====================================================
                DROPDOWN 2: DUAL-MONTH CALENDAR (IMAGE 2 EXACT DESIGN)
            ===================================================== */}
            {activeDropdown === "calendar" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[95vw] max-w-[640px] rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0D0E12] p-3.5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-left animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto">

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-5 border-b border-white/10 pb-3">
                  <button
                    type="button"
                    onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
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
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
                      aria-label="Next month"
                    >
                      <ChevronRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDropdown(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
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
                <div className="mt-4 sm:mt-5 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckInDate("");
                      setCheckOutDate("");
                      setCalendarTarget("checkIn");
                    }}
                    className="text-xs font-semibold text-[#D7A441] hover:underline"
                  >
                    Clear dates
                  </button>
                </div>

              </div>
            )}

            {/* Subtle Divider */}
            <div className="hidden lg:block h-10 w-px bg-white/15 shrink-0 mx-1" />

            {/* 4. GUESTS */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "guests" ? null : "guests")}
                className={`w-full flex items-center justify-between gap-3 sm:gap-3.5 rounded-xl lg:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3 text-left transition-all ${
                  activeDropdown === "guests"
                    ? "bg-white/15 border border-white/25 shadow-inner"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 text-[#D7A441]">
                    <Users size={18} className="sm:size-[20px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold tracking-wider text-white/50 uppercase leading-none">
                      Guests
                    </span>
                    <span className="block truncate text-xs sm:text-sm lg:text-base font-bold text-white mt-1 leading-tight">
                      {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                    </span>
                  </div>
                </div>
                {activeDropdown === "guests" ? (
                  <ChevronUp size={16} className="text-white/60 shrink-0 ml-1" />
                ) : (
                  <ChevronDown size={16} className="text-white/60 shrink-0 ml-1" />
                )}
              </button>

              {/* =====================================================
                  DROPDOWN 3: GUESTS (IMAGE 3 EXACT DESIGN)
              ===================================================== */}
              {activeDropdown === "guests" && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-[340px] max-w-[calc(100vw-32px)] rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0D0E12] p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-left animate-in fade-in duration-200 max-h-[75vh] overflow-y-auto">

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
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 hover:text-white transition"
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
                        onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 hover:bg-white/15 transition active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults((prev) => Math.min(10, prev + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition active:scale-95"
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
                        onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 hover:bg-white/15 transition active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">
                        {children}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChildren((prev) => Math.min(8, prev + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition active:scale-95"
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
                      className="w-full rounded-full bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_4px_20px_rgba(215,164,65,0.4)] transition hover:brightness-110 active:scale-[0.98]"
                    >
                      Done
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* 5. GOLD SEARCH BUTTON */}
            <div className="p-0.5 lg:p-0">
              <button
                type="submit"
                className="w-full lg:w-16 h-11 sm:h-12 lg:h-16 flex items-center justify-center rounded-xl lg:rounded-full bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] text-neutral-950 font-bold shadow-[0_6px_25px_rgba(215,164,65,0.45)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_8px_30px_rgba(215,164,65,0.6)] active:scale-95 shrink-0"
                aria-label="Search Hotels"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="lg:hidden text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Search Hotels
                  </span>
                  <ArrowRight size={20} className="stroke-[2.5]" />
                </div>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* =====================================================
          MOBILE SEARCH BOTTOM SHEET MODAL (MATCHING IMAGE 2)
      ===================================================== */}
      {mobileSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setMobileSearchModalOpen(false)}
          />

          {/* Bottom Sheet Card */}
          <div className="relative z-10 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl border border-white/15 bg-[#0D0E12] p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
            {/* Drag Handle Bar for mobile sheet look */}
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Find Your Stay
                </h3>
                <p className="text-[11px] text-[#D7A441] font-medium tracking-wide">
                  Starlight Hotels &amp; Resorts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-white transition"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            {/* 4 Segment Tabs */}
            <div className="grid grid-cols-4 gap-1.5 py-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab("where")}
                className={`rounded-xl px-1.5 py-2 text-left transition-all border ${
                  mobileTab === "where"
                    ? "border-[#D7A441] bg-[#D7A441]/15 text-[#D7A441]"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className="block text-[8px] font-bold uppercase tracking-wider opacity-70">
                  Where
                </span>
                <span className="block text-[11px] font-bold truncate text-white mt-0.5">
                  {displayLocationName ? displayLocationName.split(",")[0] : "Select"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileTab("checkIn");
                  setCalendarTarget("checkIn");
                }}
                className={`rounded-xl px-1.5 py-2 text-left transition-all border ${
                  mobileTab === "checkIn"
                    ? "border-[#D7A441] bg-[#D7A441]/15 text-[#D7A441]"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className="block text-[8px] font-bold uppercase tracking-wider opacity-70">
                  Check-In
                </span>
                <span className="block text-[11px] font-bold truncate text-white mt-0.5">
                  {checkInDate ? formatDateDisplay(checkInDate).split(" ").slice(0, 2).join(" ") : "Add date"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileTab("checkOut");
                  setCalendarTarget("checkOut");
                }}
                className={`rounded-xl px-1.5 py-2 text-left transition-all border ${
                  mobileTab === "checkOut"
                    ? "border-[#D7A441] bg-[#D7A441]/15 text-[#D7A441]"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className="block text-[8px] font-bold uppercase tracking-wider opacity-70">
                  Check-Out
                </span>
                <span className="block text-[11px] font-bold truncate text-white mt-0.5">
                  {checkOutDate ? formatDateDisplay(checkOutDate).split(" ").slice(0, 2).join(" ") : "Add date"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab("guests")}
                className={`rounded-xl px-1.5 py-2 text-left transition-all border ${
                  mobileTab === "guests"
                    ? "border-[#D7A441] bg-[#D7A441]/15 text-[#D7A441]"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className="block text-[8px] font-bold uppercase tracking-wider opacity-70">
                  Guests
                </span>
                <span className="block text-[11px] font-bold truncate text-white mt-0.5">
                  {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                </span>
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 min-h-[220px] max-h-[48vh] hide-scrollbar">
              {/* 1. WHERE TAB */}
              {mobileTab === "where" && (
                <div className="space-y-3 pt-1">
                  {/* Search input field */}
                  <div className="relative flex items-center rounded-full border border-[#D7A441] bg-black/70 px-3.5 py-2.5 shadow-[0_0_15px_rgba(215,164,65,0.15)]">
                    <Search size={15} className="text-[#D7A441] shrink-0 mr-2.5" />
                    <input
                      type="text"
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      placeholder="Where are you planning to stay? Property/ City"
                      className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
                      autoFocus
                    />
                    {locationSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setLocationSearchTerm("")}
                        className="text-white/40 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Destination List (Matching Image 2) */}
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#D7A441] uppercase block mb-2 px-1">
                      Destination
                    </span>
                    <div className="space-y-1.5">
                      {filteredDestinations.map((dest, idx) => {
                        const isSelected = selectedLocation === dest.queryValue && displayLocationName === dest.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(dest.queryValue);
                              setSelectedHotelId(dest.hotelId || "");
                              setDisplayLocationName(dest.name);
                              setMobileTab("checkIn");
                              setCalendarTarget("checkIn");
                            }}
                            className={`w-full flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left border ${
                              isSelected
                                ? "border-[#D7A441]/70 bg-[#D7A441]/15"
                                : "border-white/5 bg-white/[0.03] hover:bg-white/10"
                            }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#D7A441]">
                              {dest.type === "city" ? <MapPin size={15} /> : <Building2 size={15} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-semibold text-white">
                                {dest.name}
                              </h5>
                              <p className="text-[10px] text-white/50 truncate mt-0.5">
                                {dest.subtext}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                      {filteredDestinations.length === 0 && (
                        <div className="py-6 text-center text-xs text-white/40">
                          No matching destinations found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2 & 3. CALENDAR TABS (CHECK-IN / CHECK-OUT) */}
              {(mobileTab === "checkIn" || mobileTab === "checkOut") && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 transition"
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="text-xs font-bold text-[#D7A441] tracking-wider uppercase">
                      {mobileTab === "checkIn" ? "Select Check-In Date" : "Select Check-Out Date"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 transition"
                      aria-label="Next month"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    {renderMonthCalendar(month1Date)}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckInDate("");
                        setCheckOutDate("");
                        setCalendarTarget("checkIn");
                      }}
                      className="text-xs text-white/50 hover:text-white"
                    >
                      Clear dates
                    </button>
                    {checkInDate && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!checkOutDate) {
                            setMobileTab("checkOut");
                            setCalendarTarget("checkOut");
                          } else {
                            setMobileTab("guests");
                          }
                        }}
                        className="text-xs font-semibold text-[#D7A441] hover:underline"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 4. GUESTS TAB */}
              {mobileTab === "guests" && (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">Adults</h5>
                      <p className="text-[10px] text-white/50">13 years &amp; above</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 active:scale-95 transition"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-white">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults((prev) => Math.min(10, prev + 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white active:scale-95 transition"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">Children</h5>
                      <p className="text-[10px] text-white/50">Below 12 years</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-30 active:scale-95 transition"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-white">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren((prev) => Math.min(8, prev + 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white active:scale-95 transition"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Search CTA Button (Full Width Gold Button Matching Image 2) */}
            <div className="pt-3 border-t border-white/10 shrink-0 mt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileSearchModalOpen(false);
                  handleSearchSubmit();
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] py-3 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_4px_20px_rgba(215,164,65,0.4)] transition hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Search size={16} className="stroke-[2.5]" />
                <span>Search Stays</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}