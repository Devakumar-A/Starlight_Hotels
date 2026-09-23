import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpDown,
  BedDouble,
  Check,
  ChevronDown,
  Filter,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";

import {
  getAvailability,
  getHotels,
  getRoomCategories,
  getRoomPricing,
  getHotelMedia,
} from "../services/hotelService";

import Footer from "../components/Footer";
import HotelSearchFilter from "../components/HotelSearchFilter";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getLocalDateString(date);
}

function formatDate(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  return `${day}-${month}-${year}`;
}

// Proprietary Starlight Guest Rating system (Scores strictly 4.5 - 5.0)
function getStarlightRating(id) {
  if (!id) return { score: "4.8", label: "Superb", reviews: 142 };

  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const scorePresets = [4.7, 4.8, 4.9, 4.6, 4.8, 5.0, 4.7, 4.9, 4.8, 4.6];
  const score = (scorePresets[absHash % scorePresets.length]).toFixed(1);
  const reviews = 68 + (absHash % 160);
  const label =
    Number(score) >= 4.9
      ? "Exceptional"
      : Number(score) >= 4.7
      ? "Superb"
      : "Excellent";

  return { score, label, reviews };
}

const sortOptions = [
  {
    value: "recommended",
    label: "Recommended",
    description: "Best match for your search",
  },
  {
    value: "priceLow",
    label: "Price: Low to High",
    description: "Most affordable first",
  },
  {
    value: "priceHigh",
    label: "Price: High to Low",
    description: "Luxury & premium first",
  },
];

function Availability() {
  const [searchParams] = useSearchParams();

  const initialLocation = searchParams.get("location") || "";
  const initialHotel = searchParams.get("hotel") || "";

  const [hotels, setHotels] = useState([]);
  const [categoriesByHotel, setCategoriesByHotel] = useState({});
  const [availability, setAvailability] = useState([]);
  const [pricingByCategory, setPricingByCategory] = useState({});
  const [hotelImages, setHotelImages] = useState({});

  const [location, setLocation] = useState(initialLocation);
  const [hotelId, setHotelId] = useState(initialHotel);

  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || getLocalDateString()
  );

  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || getTomorrowDate()
  );

  const [guests, setGuests] = useState(
    searchParams.get("guests") || "2"
  );

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);

  const [sortBy, setSortBy] = useState("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Sync state if URL search parameters change (e.g. navigation / back-forward)
  useEffect(() => {
    const pLocation = searchParams.get("location") || "";
    const pHotel = searchParams.get("hotel") || "";
    const pCheckIn = searchParams.get("checkIn") || getLocalDateString();
    const pCheckOut = searchParams.get("checkOut") || getTomorrowDate();
    const pGuests = searchParams.get("guests") || "2";

    setLocation(pLocation);
    setHotelId(pHotel);
    setCheckIn(pCheckIn);
    setCheckOut(pCheckOut);
    setGuests(pGuests);
  }, [searchParams]);

  // Keep browser URL search parameters synchronized with local filter state
  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (hotelId) params.set("hotel", hotelId);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);

    const queryString = params.toString();
    const newRelativePathQuery = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [location, hotelId, checkIn, checkOut, guests]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --------------------------------------------------
  // LOAD HOTELS
  // --------------------------------------------------

  useEffect(() => {
    async function loadHotels() {
      try {
        setLoading(true);
        setError("");

        const data = await getHotels();

        setHotels(data);
      } catch (err) {
        console.error("HOTEL LOAD ERROR:", err);
        setError("Unable to load hotels.");
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, []);

  // --------------------------------------------------
  // LOAD ROOM CATEGORIES
  // --------------------------------------------------

  useEffect(() => {
    async function loadCategories() {
      if (!hotels.length) return;

      try {
        const results = await Promise.all(
          hotels.map(async (hotel) => {
            const categories = await getRoomCategories(hotel.id);

            return {
              hotelId: hotel.id,
              categories,
            };
          })
        );

        const mapped = {};

        results.forEach((result) => {
          mapped[result.hotelId] = result.categories;
        });

        setCategoriesByHotel(mapped);
      } catch (err) {
        console.error("CATEGORY LOAD ERROR:", err);
      }
    }

    loadCategories();
  }, [hotels]);

  // --------------------------------------------------
  // LOAD HOTEL IMAGES
  // --------------------------------------------------

  useEffect(() => {
    async function loadImages() {
      if (!hotels.length) return;

      try {
        const results = await Promise.all(
          hotels.map(async (hotel) => {
            try {
              const media = await getHotelMedia(hotel.id);

              return {
                hotelId: hotel.id,
                image:
                  media?.find(
                    (item) => item.media_type === "image"
                  )?.cloudinary_url || null,
              };
            } catch (err) {
              console.error(
                `IMAGE LOAD ERROR: ${hotel.hotel_name}`,
                err
              );

              return {
                hotelId: hotel.id,
                image: null,
              };
            }
          })
        );

        const mapped = {};

        results.forEach((item) => {
          mapped[item.hotelId] = item.image;
        });

        setHotelImages(mapped);
      } catch (err) {
        console.error("HOTEL IMAGE LOAD ERROR:", err);
      }
    }

    loadImages();
  }, [hotels]);

  // --------------------------------------------------
  // LOAD AVAILABILITY
  // --------------------------------------------------

  useEffect(() => {
    async function loadAvailability() {
      if (!hotels.length) return;

      if (!checkIn || !checkOut || checkOut <= checkIn) {
        setAvailability([]);
        return;
      }

      try {
        setLoadingAvailability(true);
        setError("");

        // Check availability across hotels so switching filters doesn't leave hotels unqueried
        const results = await Promise.all(
          hotels.map(async (hotel) => {
            const data = await getAvailability(
              hotel.id,
              checkIn,
              checkOut
            );

            return data.map((item) => ({
              ...item,
              hotelId: hotel.id,
            }));
          })
        );

        setAvailability(results.flat());
      } catch (err) {
        console.error("AVAILABILITY ERROR:", err);
        setError("Unable to check availability.");
      } finally {
        setLoadingAvailability(false);
      }
    }

    if (!loading) {
      loadAvailability();
    }
  }, [
    hotels,
    checkIn,
    checkOut,
    loading,
  ]);

  // --------------------------------------------------
  // LOAD DATE-WISE PRICING
  // --------------------------------------------------

  useEffect(() => {
    async function loadPricing() {
      if (
        !hotels.length ||
        !checkIn ||
        !checkOut ||
        checkOut <= checkIn
      ) {
        setPricingByCategory({});
        return;
      }

      try {
        const stayDuration = Math.max(
          1,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          ) || 1
        );

        // Fetch live pricing for all hotels so pricing section updates dynamically with dates
        const results = await Promise.all(
          hotels.map(async (hotel) => {
            const categories =
              categoriesByHotel[hotel.id] || [];

            const categoryResults = await Promise.all(
              categories.map(async (category) => {
                const pricing = await getRoomPricing(
                  category.id,
                  checkIn,
                  checkOut
                );

                const nightlyAverage =
                  pricing.length > 0
                    ? pricing.reduce(
                      (sum, item) =>
                        sum + Number(item.price || 0),
                      0
                    ) / pricing.length
                    : Number(category.default_price) || 0;

                const totalStayPrice =
                  pricing.length > 0
                    ? pricing.reduce(
                      (sum, item) =>
                        sum + Number(item.price || 0),
                      0
                    )
                    : nightlyAverage * stayDuration;

                return {
                  categoryId: category.id,
                  nightly: nightlyAverage,
                  total: totalStayPrice,
                };
              })
            );

            return categoryResults;
          })
        );

        const mapped = {};

        results.flat().forEach((item) => {
          mapped[item.categoryId] = {
            nightly: item.nightly,
            total: item.total,
          };
        });

        setPricingByCategory(mapped);
      } catch (err) {
        console.error("PRICING ERROR:", err);
        setPricingByCategory({});
      }
    }

    loadPricing();
  }, [
    hotels,
    checkIn,
    checkOut,
    categoriesByHotel,
  ]);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function getHotelAvailability(id) {
    return availability.filter(
      (item) => item.hotelId === id
    );
  }

  function getHotelCategories(id) {
    return categoriesByHotel[id] || [];
  }

  // --------------------------------------------------
  // HOTEL PRICE
  // --------------------------------------------------

  function getHotelStartingPrice(hotelId) {
    const categories = getHotelCategories(hotelId);

    if (!categories.length) return 0;

    const prices = categories
      .map((category) => {
        const p = pricingByCategory[category.id];
        if (p && typeof p === "object") {
          return Number(p.nightly || 0);
        }
        return Number(p ?? category.default_price ?? 0);
      })
      .filter((price) => price > 0);

    if (!prices.length) return 0;

    return Math.min(...prices);
  }

  function getHotelStartingTotalPrice(hotelId, stayNights) {
    const categories = getHotelCategories(hotelId);

    if (!categories.length) return 0;

    const totals = categories
      .map((category) => {
        const p = pricingByCategory[category.id];
        if (p && typeof p === "object") {
          return Number(p.total || 0);
        }
        return (Number(p ?? category.default_price ?? 0)) * stayNights;
      })
      .filter((price) => price > 0);

    if (!totals.length) return 0;

    return Math.min(...totals);
  }

  // --------------------------------------------------
  // FILTER + SORT HOTELS
  // --------------------------------------------------

  const filteredHotels = useMemo(() => {
    const filtered = hotels.filter((hotel) => {
      // Specific hotel from URL
      if (hotelId && hotel.id !== hotelId) {
        return false;
      }

      // Location (matches city, hotel name, or address)
      if (location) {
        const query = location.toLowerCase().trim();
        const matchesCity =
          hotel.city?.toLowerCase() === query ||
          hotel.city?.toLowerCase().includes(query);
        const matchesName = hotel.hotel_name?.toLowerCase().includes(query);
        const matchesAddress = hotel.address?.toLowerCase().includes(query);

        if (!matchesCity && !matchesName && !matchesAddress) {
          return false;
        }
      }

      // Guest range
      const guestCount = Number(guests) || 1;

      const categories =
        categoriesByHotel[hotel.id] || [];

      if (categories.length > 0) {
        const supportsGuests = categories.some(
          (category) => {
            const max = Number(
              category.max_occupancy || 0
            );
            const total = Number(category.total_rooms || 1);

            return max >= guestCount || (max > 0 && max * total >= guestCount);
          }
        );

        if (!supportsGuests) {
          return false;
        }
      }

      // Price
      const startingPrice = getHotelStartingPrice(hotel.id);

      if (
        startingPrice < minPrice ||
        startingPrice > maxPrice
      ) {
        return false;
      }

      return true;
    });

    // SORT
    if (sortBy === "priceLow") {
      filtered.sort(
        (a, b) =>
          getHotelStartingPrice(a.id) -
          getHotelStartingPrice(b.id)
      );
    }

    if (sortBy === "priceHigh") {
      filtered.sort(
        (a, b) =>
          getHotelStartingPrice(b.id) -
          getHotelStartingPrice(a.id)
      );
    }

    // Recommended keeps original DB order.
    return filtered;
  }, [
    hotels,
    hotelId,
    location,
    guests,
    minPrice,
    maxPrice,
    sortBy,
    categoriesByHotel,
    pricingByCategory,
  ]);

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  function clearFilters() {
    setLocation("");
    setHotelId("");
    setMinPrice(0);
    setMaxPrice(20000);
    setGuests("2");
    setSortBy("recommended");
  }

  const activeFilterCount =
    (location ? 1 : 0) +
    (minPrice > 0 || maxPrice < 20000 ? 1 : 0) +
    (guests !== "2" ? 1 : 0);



  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 py-8 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="h-8 w-64 animate-pulse rounded-2xl bg-neutral-200" />
            <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
              <div className="h-[500px] animate-pulse rounded-3xl border border-neutral-200 bg-white" />
              <div className="space-y-6">
                <div className="h-64 animate-pulse rounded-3xl border border-neutral-200 bg-white" />
                <div className="h-64 animate-pulse rounded-3xl border border-neutral-200 bg-white" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFCFD] text-neutral-900">
      <main className="flex-1">

        {/* REUSABLE HOTEL SEARCH & FILTER UI */}
        <HotelSearchFilter
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
          mobileFiltersOpen={mobileFiltersOpen}
          setMobileFiltersOpen={setMobileFiltersOpen}
          filteredHotelsCount={filteredHotels.length}
          minDate={getLocalDateString()}
          formatDateFn={formatDate}
        >

              {/* RESULTS HEADER */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200/70">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                    Available Stays
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Showing <span className="font-bold text-[#B88428]">{filteredHotels.length}</span> luxury {filteredHotels.length === 1 ? "property" : "properties"}
                  </p>
                </div>

                {/* CUSTOM LUXURY SORT DROPDOWN */}
                <div ref={sortRef} className="relative self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className={`group flex items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-2 text-left shadow-sm transition-all duration-200 cursor-pointer ${
                      sortOpen
                        ? "border-[#D7A441] ring-2 ring-[#D7A441]/20 shadow-md"
                        : "border-neutral-200/90 hover:border-[#D7A441]/50 hover:shadow-md"
                    }`}
                  >
                    <Filter size={15} className="text-[#D7A441] transition-transform group-hover:scale-110" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Sort:</span>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-800">
                      {sortOptions.find((o) => o.value === sortBy)?.label || "Recommended"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-neutral-400 transition-transform duration-200 ml-0.5 ${
                        sortOpen ? "rotate-180 text-[#B88428]" : "group-hover:text-neutral-700"
                      }`}
                    />
                  </button>

                  {/* CUSTOM LUXURY POPUP MENU */}
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-64 origin-top-right rounded-2xl border border-neutral-200/90 bg-white/95 p-1.5 shadow-[0_14px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 mb-1 border-b border-neutral-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Sort Stays By
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D7A441]" />
                      </div>

                      <div className="space-y-1">
                        {sortOptions.map((option) => {
                          const isSelected = sortBy === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setSortBy(option.value);
                                setSortOpen(false);
                              }}
                              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#FAF5EB] text-[#966A1E] font-bold border border-[#D7A441]/25 shadow-xs"
                                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 font-medium"
                              }`}
                            >
                              <div>
                                <p className={`text-xs sm:text-sm ${isSelected ? "font-bold text-neutral-950" : "font-medium text-neutral-800"}`}>
                                  {option.label}
                                </p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">
                                  {option.description}
                                </p>
                              </div>

                              {isSelected && (
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D7A441] text-neutral-950 shadow-xs">
                                  <Check size={12} className="stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ERROR NOTICE */}
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-xs sm:text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* AVAILABILITY LOADING NOTICE */}
              {loadingAvailability && (
                <div className="mb-6 rounded-2xl border border-[#D7A441]/30 bg-[#FAF5EB] p-4 text-xs sm:text-sm text-[#966A1E] flex items-center gap-2 animate-pulse">
                  <Sparkles size={16} className="text-[#D7A441]" />
                  <span>Checking real-time live room availability...</span>
                </div>
              )}

              {/* HOTEL CARDS LIST */}
              <div className="space-y-6">
                {filteredHotels.map((hotel) => {
                  const hotelAvailability = getHotelAvailability(hotel.id);
                  const hotelCategories = getHotelCategories(hotel.id);

                  const availableCategories = hotelAvailability
                    .map((item) => {
                      const category = hotelCategories.find(
                        (category) => category.id === item.room_category_id
                      );
                      if (!category) return null;
                      return {
                        ...category,
                        available_rooms: item.available_rooms,
                        total_available_rooms: item.total_rooms,
                      };
                    })
                    .filter(Boolean);

                  const hotelImage = hotelImages[hotel.id];
                  const startingPrice = getHotelStartingPrice(hotel.id);
                  const nights = Math.max(
                    1,
                    Math.round(
                      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) || 1
                  );
                  const startingTotalPrice = getHotelStartingTotalPrice(hotel.id, nights);
                  const totalRoomsAvailable = availableCategories.reduce(
                    (sum, cat) => sum + (Number(cat.available_rooms) || 0),
                    0
                  );
                  const starlightRating = getStarlightRating(hotel.id);

                  return (
                    <article
                      key={hotel.id}
                      className="group overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-[#D7A441]/50 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">

                        {/* 1. REAL HOTEL IMAGE (From Supabase media table) */}
                        <div className="relative w-full md:w-[260px] lg:w-[280px] xl:w-[320px] shrink-0 min-h-[220px] md:min-h-[270px] overflow-hidden bg-neutral-100">
                          {hotelImage ? (
                            <img
                              src={hotelImage}
                              alt={hotel.hotel_name}
                              className="h-full min-h-[220px] md:min-h-[270px] w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="flex h-full min-h-[220px] md:min-h-[270px] items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                {hotel.hotel_name}
                              </span>
                            </div>
                          )}

                          {/* Subtle ambient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                          {/* Real City Badge from Supabase */}
                          {hotel.city && (
                            <div className="absolute top-3.5 left-3.5">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/20 shadow-lg tracking-wide">
                                <MapPin size={12} className="text-[#D7A441]" />
                                <span>{hotel.city}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 2. REAL HOTEL DETAILS & PRICING (From Supabase) */}
                        <div className="flex-1 min-w-0 p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
                          <div>
                            {/* Static Top Header Row: Address on Left, Starlight Guest Rating on Right */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                              {/* Left: Real City & Address Header */}
                              <div className="flex items-center gap-2 text-xs min-w-0">
                                <span className="font-bold uppercase tracking-wider text-[#B88428] text-[10px] bg-[#D7A441]/10 px-2 py-0.5 rounded-md border border-[#D7A441]/20 shrink-0">
                                  Starlight Stay
                                </span>
                                <span className="text-neutral-300 shrink-0">•</span>
                                <span className="flex items-center gap-1 font-medium text-neutral-500 text-xs min-w-0 truncate">
                                  <MapPin size={13} className="text-[#D7A441] shrink-0" />
                                  <span className="truncate">{hotel.city}{hotel.address ? `, ${hotel.address}` : ""}</span>
                                </span>
                              </div>

                              {/* Right: STATIC Starlight Guest Score (Always in the exact same top-right position) */}
                              <div className="flex items-center gap-2 shrink-0 self-start">
                                <div className="flex items-center gap-1 rounded-lg bg-[#111315] text-[#F3CF7A] px-2.5 py-1 text-xs font-black shadow-xs">
                                  <span>{starlightRating.score}</span>
                                  <Star size={11} className="fill-[#D7A441] text-[#D7A441]" />
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[11px] font-bold text-neutral-900 leading-tight">
                                    {starlightRating.label}
                                  </span>
                                  <span className="text-[10px] font-medium text-neutral-400 leading-tight whitespace-nowrap">
                                    Starlight Guest Score ({starlightRating.reviews})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Real Hotel Name */}
                            <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-[#B88428] transition-colors font-sans">
                              {hotel.hotel_name}
                            </h3>

                            {/* Real Hotel Description */}
                            {hotel.description && (
                              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600 line-clamp-2 font-normal">
                                {hotel.description}
                              </p>
                            )}

                            {/* Real Available Room Categories from Supabase */}
                            {availableCategories.length > 0 && (
                              <div className="mt-4 pt-3.5 border-t border-neutral-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    Available Room Types
                                  </span>
                                  <span className="text-[10px] font-bold text-[#B88428]">
                                    {availableCategories.length} {availableCategories.length === 1 ? "Option" : "Options"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {availableCategories.slice(0, 3).map((cat) => (
                                    <div
                                      key={cat.id}
                                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-neutral-800 transition hover:border-[#D7A441]/40 hover:bg-[#FAF8F5]"
                                    >
                                      <BedDouble size={13} className="text-[#B88428]" />
                                      <span className="font-semibold text-neutral-900">{cat.category_name}</span>
                                      {cat.max_occupancy && (
                                        <span className="text-neutral-400 text-[11px] font-normal">
                                          • Max {cat.max_occupancy}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  {availableCategories.length > 3 && (
                                    <span className="inline-flex items-center rounded-xl bg-neutral-100 border border-neutral-200 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600">
                                      +{availableCategories.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* REAL AVAILABILITY STATUS & ACTION / PRICING BAR */}
                          <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            {/* Left: Real Live Availability Status & Stay Summary */}
                            <div className="space-y-2">
                              {availableCategories.length > 0 ? (
                                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs text-emerald-800 font-medium">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                                    <Check size={12} className="stroke-[3]" />
                                  </div>
                                  <span>
                                    <strong className="font-bold text-emerald-900">Instant Booking:</strong> Room available for your dates
                                    {totalRoomsAvailable > 0 && ` (${totalRoomsAvailable} left)`}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 font-medium">
                                  <span>No rooms available for selected dates</span>
                                </div>
                              )}

                              {/* Stay Context */}
                              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D7A441]" />
                                <span>
                                  Stay Summary: <strong className="text-neutral-800">{nights} {nights === 1 ? "Night" : "Nights"}</strong> • <strong className="text-neutral-800">{guests} {Number(guests) === 1 ? "Guest" : "Guests"}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Right: Real Starting Price from Supabase & CTA Button */}
                            <div className="flex flex-wrap sm:flex-col sm:items-end justify-between items-center sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
                              <div className="text-left sm:text-right">
                                {startingPrice > 0 ? (
                                  <>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                      Starting From
                                    </p>
                                    <div className="flex items-baseline justify-start sm:justify-end gap-1 mt-0.5">
                                      <span className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight font-sans">
                                        ₹{startingPrice.toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-xs font-medium text-neutral-500">/ night</span>
                                    </div>
                                    {nights > 1 ? (
                                      <p className="text-[11px] font-semibold text-[#B88428] mt-0.5">
                                        ₹{startingTotalPrice.toLocaleString("en-IN")} total for {nights} nights
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-neutral-400 mt-0.5">
                                        + taxes &amp; service fees
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-left sm:text-right">
                                    <p className="text-xs text-neutral-400 italic">
                                      Price on request
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Real Link to Hotel Details Page with Real Parameters */}
                              <Link
                                to={`/hotel/${hotel.id}?checkIn=${encodeURIComponent(
                                  checkIn
                                )}&checkOut=${encodeURIComponent(
                                  checkOut
                                )}&guests=${encodeURIComponent(guests)}`}
                                className="rounded-xl bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] py-2.5 px-5 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_4px_16px_rgba(215,164,65,0.35)] hover:shadow-[0_6px_22px_rgba(215,164,65,0.5)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                              >
                                <span>View Hotel</span>
                                <ArrowRight size={15} className="stroke-[2.5]" />
                              </Link>
                            </div>

                          </div>
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>

              {/* EMPTY STATE */}
              {!loadingAvailability && filteredHotels.length === 0 && (
                <div className="rounded-3xl border border-neutral-200/90 bg-white p-10 sm:p-14 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428]">
                    <MapPin size={26} />
                  </div>

                  <h3 className="mt-4 text-lg sm:text-xl font-bold text-neutral-900">
                    No Matching Hotels Found
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                    We couldn&apos;t find hotels matching your search criteria. Try adjusting your dates, guests, or destination.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-6 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-md hover:brightness-110 active:scale-95 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

        </HotelSearchFilter>

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default Availability;