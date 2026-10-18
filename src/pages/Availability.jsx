import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpDown,
  BedDouble,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Monitor,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import {
  getAvailability,
  getHotels,
  getRoomCategories,
  getRoomPricing,
  getHotelMedia,
  calculateRoomPrice,
  getCategoryOccupancyLimits,
  canCategoryAccommodate,
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

// Guest Rating system
function getStarlightRating(id) {
  if (!id) return { score: "4.8", reviews: 142 };

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

  return { score, reviews };
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

  const initialLocation = searchParams.get("location") || searchParams.get("destination") || "";
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
  const mobileSortRef = useRef(null);

  const [desktopOnlyToast, setDesktopOnlyToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return "grid";
    }
    return "list";
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024 && viewMode === "list") {
        setViewMode("grid");
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleListViewClick = () => {
    const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobileViewport) {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setDesktopOnlyToast(true);
      toastTimeoutRef.current = setTimeout(() => {
        setDesktopOnlyToast(false);
      }, 3500);
      return;
    }
    setViewMode("list");
  };

  const [expandedRoomsByHotel, setExpandedRoomsByHotel] = useState({});

  const toggleExpandRooms = (id) => {
    setExpandedRoomsByHotel((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sync state if URL search parameters change (e.g. navigation / back-forward)
  useEffect(() => {
    const pLocation = searchParams.get("location") || searchParams.get("destination") || "";
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
      const clickedDesktop = sortRef.current && sortRef.current.contains(event.target);
      const clickedMobile = mobileSortRef.current && mobileSortRef.current.contains(event.target);
      if (!clickedDesktop && !clickedMobile) {
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
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [error, setError] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  function toggleExpandDescription(id) {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

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
        setLoadingPricing(false);
        return;
      }

      try {
        setLoadingPricing(true);
        const stayDuration = Math.max(
          1,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          ) || 1
        );

        // Fetch live pricing for all hotels so pricing section updates dynamically with backend rules
        const roomsCount = Math.max(1, Number(searchParams.get("rooms")) || 1);
        const guestsCount = Math.max(1, Number(guests) || 1);

        const results = await Promise.all(
          hotels.map(async (hotel) => {
            const categories =
              categoriesByHotel[hotel.id] || [];

            const categoryResults = await Promise.all(
              categories.map(async (category) => {
                try {
                  const priceData = await calculateRoomPrice({
                    roomCategoryId: category.id,
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    numberOfGuests: guestsCount,
                    roomsRequested: roomsCount,
                    defaultPrice: Number(category.default_price) || 0,
                  });

                  return {
                    categoryId: category.id,
                    nightly: Number(priceData.average_nightly_rate) || 0,
                    subtotal: Number(priceData.subtotal) || 0,
                    total: Number(priceData.subtotal) || 0,
                    finalTotal: Number(priceData.final_total) || 0,
                    gstAmount: Number(priceData.gst_amount) || 0,
                    discount: Number(priceData.sign_in_discount) || 0,
                  };
                } catch {
                  const defaultNightly = Number(category.default_price) || 0;
                  const sub = defaultNightly * stayDuration * roomsCount;
                  const gst = Math.round(sub * 0.05);
                  return {
                    categoryId: category.id,
                    nightly: defaultNightly,
                    subtotal: sub,
                    total: sub,
                    finalTotal: sub + gst,
                    gstAmount: gst,
                    discount: 0,
                  };
                }
              })
            );

            return categoryResults;
          })
        );

        const mapped = {};

        results.flat().forEach((item) => {
          mapped[item.categoryId] = {
            nightly: item.nightly,
            subtotal: item.subtotal,
            total: item.total,
            finalTotal: item.finalTotal,
            gstAmount: item.gstAmount,
            discount: item.discount,
          };
        });

        setPricingByCategory(mapped);
      } catch (err) {
        console.error("PRICING ERROR:", err);
        setPricingByCategory({});
      } finally {
        setLoadingPricing(false);
      }
    }

    loadPricing();
  }, [
    hotels,
    checkIn,
    checkOut,
    categoriesByHotel,
    guests,
    searchParams,
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
  // AUTHORITATIVE PRICING & INVENTORY SUMMARY PER HOTEL
  // --------------------------------------------------

  function getHotelPricingInfo(hotelId) {
    const hotelCategories = categoriesByHotel[hotelId] || [];
    const hotelAvail = availability.filter((item) => item.hotelId === hotelId);

    const totalGuests = Math.max(1, Number(guests) || 1);
    const roomsCount = Math.max(1, Number(searchParams.get("rooms")) || 1);
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      ) || 1
    );

    const hasAvailData = availability.length > 0 && hotelAvail.length > 0;

    // Merge availability inventory and pricing into room categories
    const categoriesWithInventory = hotelCategories.map((cat) => {
      const availItem = hotelAvail.find((a) => a.room_category_id === cat.id);
      const availableRooms = availItem
        ? Number(availItem.available_rooms)
        : hasAvailData
        ? 0
        : Number(cat.total_rooms) || 0;

      const accommodates = canCategoryAccommodate(cat, totalGuests, roomsCount);
      const isAvailable = availableRooms > 0;

      const pricing = pricingByCategory[cat.id];
      const nightly = pricing?.nightly ?? (Number(cat.default_price) || 0);
      const subtotal = pricing?.subtotal ?? (nightly * nights * roomsCount);
      const gst = pricing?.gstAmount ?? Math.round(subtotal * 0.05);
      const discount = pricing?.discount ?? 0;
      const finalTotal = pricing?.finalTotal ?? (subtotal + gst - discount);

      return {
        ...cat,
        available_rooms: availableRooms,
        total_rooms: availItem?.total_rooms ?? cat.total_rooms,
        accommodates,
        isAvailable,
        nightly,
        subtotal,
        gst,
        discount,
        finalTotal,
        hasPrice: nightly > 0,
      };
    });

    // 1. Categories that are BOTH available for selected dates AND accommodate the party
    const eligibleCategories = categoriesWithInventory.filter(
      (c) => c.isAvailable && c.accommodates && c.hasPrice
    );

    // 2. Categories that accommodate the party
    const accommodatingCategories = categoriesWithInventory.filter(
      (c) => c.accommodates && c.hasPrice
    );

    // 3. Categories that are available (regardless of exact guest count)
    const availableCategories = categoriesWithInventory.filter(
      (c) => c.isAvailable && c.hasPrice
    );

    // Select candidates for starting price:
    // Highest priority: Eligible (available + accommodates)
    // Secondary: Accommodating categories
    // Tertiary: Available categories
    // Fallback: Any category with a valid price
    const candidates =
      eligibleCategories.length > 0
        ? eligibleCategories
        : accommodatingCategories.length > 0
        ? accommodatingCategories
        : availableCategories.length > 0
        ? availableCategories
        : categoriesWithInventory.filter((c) => c.hasPrice);

    let lowestPriceCat = null;
    if (candidates.length > 0) {
      lowestPriceCat = candidates.reduce(
        (min, curr) => (curr.nightly < min.nightly ? curr : min),
        candidates[0]
      );
    }

    const startingNightly = lowestPriceCat?.nightly || 0;
    const startingSubtotal = lowestPriceCat?.subtotal || 0;
    const startingFinalTotal = lowestPriceCat?.finalTotal || 0;
    const startingGst = lowestPriceCat?.gst || 0;

    const totalAvailableRooms = categoriesWithInventory
      .filter((c) => c.isAvailable)
      .reduce((sum, c) => sum + (Number(c.available_rooms) || 0), 0);

    const hasAvailableRooms = hasAvailData
      ? categoriesWithInventory.some((c) => c.isAvailable)
      : true;

    return {
      startingNightly,
      startingSubtotal,
      startingFinalTotal,
      startingGst,
      lowestPriceCat,
      categoriesWithInventory,
      eligibleCategories,
      accommodatingCategories,
      availableCategories,
      totalAvailableRooms,
      hasAvailableRooms,
      nights,
      roomsCount,
      totalGuests,
    };
  }

  // --------------------------------------------------
  // FILTER + SORT HOTELS
  // --------------------------------------------------

  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // Specific hotel from URL or direct selection
        if (hotelId) {
          return hotel.id === hotelId;
        }

        // Location / Destination matching (city, hotel name, or address)
        if (location) {
          const query = location.toLowerCase().trim();
          const hotelCity = (hotel.city || "").toLowerCase().trim();
          const hotelName = (hotel.hotel_name || "").toLowerCase().trim();
          const hotelAddress = (hotel.address || "").toLowerCase().trim();

          const matchesCity =
            hotelCity === query ||
            hotelCity.includes(query) ||
            query.includes(hotelCity);
          const matchesName = hotelName.includes(query);
          const matchesAddress = hotelAddress.includes(query);

          if (!matchesCity && !matchesName && !matchesAddress) {
            return false;
          }
        }

        // Guest & room occupancy validation
        const hotelCats = categoriesByHotel[hotel.id] || [];
        const totalGuests = Math.max(1, Number(guests) || 1);
        const roomsCount = Math.max(1, Number(searchParams.get("rooms")) || 1);

        if (hotelCats.length > 0) {
          const canAccommodate = hotelCats.some((cat) =>
            canCategoryAccommodate(cat, totalGuests, roomsCount)
          );
          if (!canAccommodate) {
            return false;
          }
        }

        // Date availability filter: exclude properties known to have 0 rooms available for selected stay
        const pricingInfo = getHotelPricingInfo(hotel.id);
        const hasAvailData = availability.length > 0;
        if (hasAvailData && checkIn && checkOut) {
          if (!pricingInfo.hasAvailableRooms) {
            return false;
          }
        }

        // Price filter: compare comparable starting nightly price against budget range
        const nightlyPrice = pricingInfo.startingNightly;
        if (nightlyPrice > 0) {
          if (nightlyPrice < minPrice || nightlyPrice > maxPrice) {
            return false;
          }
        } else if (minPrice > 1000) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priceLow") {
          const priceA = getHotelPricingInfo(a.id).startingNightly || Infinity;
          const priceB = getHotelPricingInfo(b.id).startingNightly || Infinity;
          return priceA - priceB;
        }

        if (sortBy === "priceHigh") {
          const priceA = getHotelPricingInfo(a.id).startingNightly || 0;
          const priceB = getHotelPricingInfo(b.id).startingNightly || 0;
          return priceB - priceA;
        }

        // Recommended preserves database order
        return 0;
      });
  }, [
    hotels,
    hotelId,
    location,
    guests,
    minPrice,
    maxPrice,
    sortBy,
    categoriesByHotel,
    availability,
    pricingByCategory,
    checkIn,
    checkOut,
    searchParams,
  ]);

  const selectedHotel = useMemo(() => {
    if (!hotelId) return null;
    return hotels.find((h) => h.id === hotelId);
  }, [hotels, hotelId]);

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
    (location || hotelId ? 1 : 0) +
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
            <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
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
          selectedHotelName={selectedHotel?.hotel_name}
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

              {/* MOBILE BALANCED FILTER & SORT ROW */}
              <div className="grid grid-cols-2 gap-3 mb-5 lg:hidden">
                {/* 1. Filter Stays Button */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center justify-between h-11 px-3.5 rounded-2xl border border-[#F2E8DC] bg-white text-xs font-bold text-[#0B1527] shadow-sm hover:border-[#D7A441] active:scale-98 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                      <SlidersHorizontal size={13} />
                    </div>
                    <span className="truncate">Filter Stays</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C5922C] px-1.5 text-[10px] font-bold text-white shadow-xs shrink-0">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* 2. Sort Button (Opens mobile sort popup) */}
                <div ref={mobileSortRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className={`flex items-center justify-between w-full h-11 px-3.5 rounded-2xl border bg-white text-xs font-bold text-[#0B1527] shadow-sm active:scale-98 transition cursor-pointer ${
                      sortOpen
                        ? "border-[#D7A441] ring-2 ring-[#D7A441]/20"
                        : "border-[#F2E8DC] hover:border-[#D7A441]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                        <ArrowUpDown size={13} />
                      </div>
                      <span className="truncate">
                        {sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                        sortOpen ? "rotate-180 text-[#C5922C]" : ""
                      }`}
                    />
                  </button>

                  {/* Mobile Sort Dropdown */}
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-64 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-neutral-200/90 bg-white/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
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
                                <p className={`text-xs ${isSelected ? "font-bold text-neutral-950" : "font-medium text-neutral-800"}`}>
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

              {/* RESULTS TOOLBAR (EXACT MATCH TO REFERENCE SCREENSHOT) */}
              <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200/70">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1527] font-serif">
                    Available Stays
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                      Showing {filteredHotels.length} {filteredHotels.length === 1 ? "property" : "properties"}
                    </p>
                    {selectedHotel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7A441]/15 border border-[#D7A441]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#8B651B]">
                        <span>Hotel: {selectedHotel.hotel_name}</span>
                        <button
                          type="button"
                          onClick={() => setHotelId("")}
                          className="hover:text-black transition cursor-pointer p-0.5"
                          title="Show all hotels"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT CONTROLS: SORT PILL DROPDOWN + INDEPENDENT VIEW TOGGLES */}
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  {/* DESKTOP LUXURY SORT DROPDOWN PILL */}
                  <div ref={sortRef} className="relative hidden lg:block">
                    <button
                      type="button"
                      onClick={() => setSortOpen(!sortOpen)}
                      className={`group flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-left shadow-2xs transition-all duration-200 cursor-pointer ${
                        sortOpen
                          ? "border-[#D7A441] ring-2 ring-[#D7A441]/20 shadow-md"
                          : "border-neutral-200/90 hover:border-[#D7A441]/50 hover:shadow-xs"
                      }`}
                      aria-label="Sort stays"
                      aria-expanded={sortOpen}
                    >
                      <ArrowUpDown size={13} className="text-[#C59A45] transition-transform group-hover:scale-110" />
                      <span className="text-xs font-semibold text-neutral-700">
                        SORT: <span className="font-bold text-neutral-900">{sortOptions.find((o) => o.value === sortBy)?.label || "Recommended"}</span>
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-neutral-400 transition-transform duration-200 ml-0.5 ${
                          sortOpen ? "rotate-180 text-[#C59A45]" : "group-hover:text-neutral-700"
                        }`}
                      />
                    </button>

                    {/* Desktop Popup */}
                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-64 origin-top-right rounded-2xl border border-neutral-200/90 bg-white/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 mb-1 border-b border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Sort Stays By
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C59A45]" />
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
                                  <p className={`text-sm ${isSelected ? "font-bold text-neutral-950" : "font-medium text-neutral-800"}`}>
                                    {option.label}
                                  </p>
                                  <p className="text-[10px] text-neutral-400 mt-0.5">
                                    {option.description}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C59A45] text-white shadow-xs">
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

                  {/* Grid / List View Toggle (Individual Golden/White Rounded Buttons) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer active:scale-95 ${
                        viewMode === "grid"
                          ? "bg-[#C59A45] text-white shadow-xs"
                          : "border border-neutral-200/90 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                      title="Grid view"
                      aria-label="Grid view"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleListViewClick}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer active:scale-95 ${
                        viewMode === "list"
                          ? "bg-[#C59A45] text-white shadow-xs"
                          : "border border-neutral-200/90 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                      title="List view"
                      aria-label="List view"
                    >
                      <List size={16} />
                    </button>
                  </div>
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
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredHotels.map((hotel) => {
                  const pricingInfo = getHotelPricingInfo(hotel.id);
                  const {
                    startingNightly,
                    startingSubtotal,
                    startingGst,
                    hasAvailableRooms,
                    categoriesWithInventory,
                    eligibleCategories,
                    accommodatingCategories,
                    availableCategories,
                    nights,
                    roomsCount,
                  } = pricingInfo;

                  // Determine categories to display for party
                  const partyCategories =
                    eligibleCategories.length > 0
                      ? eligibleCategories
                      : accommodatingCategories.length > 0
                      ? accommodatingCategories
                      : availableCategories;

                  const displayedCategories =
                    partyCategories.length > 0
                      ? partyCategories
                      : categoriesWithInventory;

                  const hotelImage = hotelImages[hotel.id];
                  const starlightRating = getStarlightRating(hotel.id);

                  return (
                    <article
                      key={hotel.id}
                      className={`group overflow-hidden rounded-[28px] border border-[#EADBCC] bg-[#FFFDF9] shadow-[0_4px_24px_rgba(11,21,39,0.04)] hover:shadow-[0_20px_48px_rgba(11,21,39,0.08)] hover:border-[#D7A441]/50 transition-all duration-300 p-4 sm:p-5 lg:p-6 flex flex-col ${
                        viewMode === "grid" ? "" : "md:flex-row gap-6 lg:gap-8 items-stretch"
                      }`}
                    >
                      <div className={`flex flex-col ${viewMode === "grid" ? "w-full" : "md:flex-row gap-6 lg:gap-8 flex-1 min-w-0 items-stretch"}`}>

                        {/* 1. REAL HOTEL IMAGE (38% Width on Desktop, Rounded-2xl, Destination Pill & Favorite Heart) */}
                        <div
                          className={`relative shrink-0 overflow-hidden rounded-2xl bg-[#FAF6F0] flex items-center justify-center transition-all duration-300 ${
                            viewMode === "grid"
                              ? "w-full aspect-[16/10] sm:aspect-[4/3] max-h-[260px] mb-4"
                              : "w-full md:w-[38%] h-[230px] sm:h-[260px] md:h-auto md:min-h-[260px] md:self-stretch"
                          }`}
                        >
                          {hotelImage ? (
                            <img
                              src={hotelImage}
                              alt={hotel.hotel_name}
                              className="h-full w-full object-cover rounded-2xl group-hover:scale-104 transition-transform duration-500 ease-out"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FAF6F0] to-[#EFEAE1] text-neutral-400">
                              <span className="text-xs font-bold uppercase tracking-widest">
                                {hotel.hotel_name}
                              </span>
                            </div>
                          )}

                          {/* Real City Badge from Supabase */}
                          {hotel.city && (
                            <div className="absolute top-3.5 left-3.5 z-10">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1527]/85 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/20 shadow-md">
                                <MapPin size={11} className="text-[#D7A441]" />
                                <span>{hotel.city}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 2. REAL HOTEL DETAILS & PRICING (Exact Reference Hierarchy) */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            {/* Top Header Row: Address on Left, Standard Inline Star Rating on Right */}
                            <div className="flex items-center justify-between gap-3">
                              {/* Left: Real City & Address Header */}
                              <div className="flex items-center gap-1.5 font-medium text-neutral-600 text-xs sm:text-[13px] min-w-0">
                                <MapPin size={14} className="text-[#C59A45] shrink-0" />
                                <span className="truncate">{hotel.city}{hotel.address ? `, ${hotel.address}` : ""}</span>
                              </div>

                              {/* Right: Gold Star + Rating + Review count */}
                              <div className="inline-flex items-center gap-1.5 shrink-0">
                                <Star size={15} className="fill-[#E5A93C] text-[#E5A93C]" />
                                <span className="text-sm font-bold text-[#0B1527]">{starlightRating.score}</span>
                                <span className="text-xs text-neutral-500 font-normal">
                                  ({starlightRating.reviews} reviews)
                                </span>
                              </div>
                            </div>

                            {/* Real Hotel Name (Serif Heading) */}
                            <h3 className="mt-2 text-2xl sm:text-[26px] font-bold font-serif tracking-tight text-[#0B1527] group-hover:text-[#B88428] transition-colors">
                              {hotel.hotel_name}
                            </h3>

                            {/* Real Hotel Description (Muted slate, clamped with clean toggle) */}
                            {hotel.description && (
                              <div className="mt-2 text-xs sm:text-[13px] leading-relaxed text-[#556377] font-normal">
                                <p className={expandedDescriptions[hotel.id] ? "" : "line-clamp-2"}>
                                  {hotel.description}
                                </p>
                                {hotel.description.length > 95 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandDescription(hotel.id)}
                                    className="mt-1 text-[11px] font-semibold text-[#B88428] hover:text-[#966A1E] inline-flex items-center gap-0.5 cursor-pointer transition-colors"
                                    aria-expanded={Boolean(expandedDescriptions[hotel.id])}
                                  >
                                    <span>{expandedDescriptions[hotel.id] ? "Show less" : "More description"}</span>
                                    {expandedDescriptions[hotel.id] ? (
                                      <ChevronUp size={11} className="stroke-[2.5]" />
                                    ) : (
                                      <ChevronDown size={11} className="stroke-[2.5]" />
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Real Available Room Categories (ROOMS FOR YOUR PARTY) */}
                            {displayedCategories.length > 0 && (
                              <div className="mt-4 pt-3.5 border-t border-[#F2E8DC]">
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase font-sans">
                                    {partyCategories.length > 0 ? "ROOMS FOR YOUR PARTY" : "AVAILABLE ROOM TYPES"}
                                  </span>
                                  <span className="text-xs font-bold text-[#C59A45]">
                                    {displayedCategories.length} {displayedCategories.length === 1 ? "Option" : "Options"}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                  {(expandedRoomsByHotel[hotel.id]
                                    ? displayedCategories
                                    : displayedCategories.slice(0, viewMode === "grid" ? 2 : 4)
                                  ).map((cat) => {
                                    const { maxGuests } = getCategoryOccupancyLimits(cat);
                                    return (
                                      <div
                                        key={cat.id}
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#EADBCC] bg-[#FFFDF9] px-3.5 py-1.5 text-xs font-medium text-[#0B1527] transition hover:border-[#C59A45]/60 hover:bg-[#FAF6ED]"
                                      >
                                        <BedDouble size={14} className="text-[#C59A45]" />
                                        <span className="font-semibold text-[#0B1527]">{cat.category_name}</span>
                                        {maxGuests ? (
                                          <span className="text-neutral-500 text-[11px] font-normal">
                                            • Max {maxGuests} {maxGuests === 1 ? "guest" : "guests"}
                                          </span>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                  {displayedCategories.length > (viewMode === "grid" ? 2 : 4) && (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandRooms(hotel.id)}
                                      className="inline-flex items-center gap-1 rounded-xl border border-[#EADBCC] bg-[#FFFDF9] hover:bg-[#F7F2E8] hover:border-[#D7A441]/60 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:text-[#966A1E] transition-all cursor-pointer active:scale-95 shadow-2xs"
                                      aria-expanded={Boolean(expandedRoomsByHotel[hotel.id])}
                                      title={
                                        expandedRoomsByHotel[hotel.id]
                                          ? "Show fewer room types"
                                          : `Show all ${displayedCategories.length} room types`
                                      }
                                    >
                                      <span>
                                        {expandedRoomsByHotel[hotel.id]
                                          ? "Show less"
                                          : `+${displayedCategories.length - (viewMode === "grid" ? 2 : 4)} more`}
                                      </span>
                                      {expandedRoomsByHotel[hotel.id] ? (
                                        <ChevronUp size={12} className="text-[#B88428]" />
                                      ) : (
                                        <ChevronDown size={12} className="text-neutral-500" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* REAL AVAILABILITY STATUS & ACTION / PRICING BAR */}
                          <div className="mt-5 pt-4 border-t border-[#F2E8DC] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            {/* Left: Real Live Availability Status (Subtle Green Pill with Check) */}
                            <div className="space-y-1">
                              {hasAvailableRooms ? (
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF7F0] border border-[#C5ECD6] px-3.5 py-1.5 text-xs text-[#187545] font-medium">
                                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#187545] text-white">
                                    <Check size={10} className="stroke-[3]" />
                                  </div>
                                  <span>Rooms available for selected dates</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs text-amber-800 font-medium">
                                  <span>Sold out for selected dates</span>
                                </div>
                              )}
                            </div>

                            {/* Right: Real Starting Price from Supabase & View Hotel CTA Button */}
                            <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                              <div className="text-left sm:text-right">
                                {loadingPricing ? (
                                  <div className="flex items-center gap-1.5 text-xs text-[#B88428] animate-pulse">
                                    <Sparkles size={13} className="text-[#D7A441]" />
                                    <span>Updating live rate...</span>
                                  </div>
                                ) : startingNightly > 0 ? (
                                  <>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                      STARTING FROM
                                    </p>
                                    <div className="flex items-baseline justify-start sm:justify-end gap-1 mt-0.5">
                                      <span className="text-2xl sm:text-[28px] font-bold text-[#0B1527] tracking-tight font-sans">
                                        ₹{startingNightly.toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-xs font-medium text-neutral-500">/ night</span>
                                    </div>
                                    {nights > 1 || roomsCount > 1 ? (
                                      <p className="text-[11px] font-semibold text-[#B88428] mt-0.5">
                                        ₹{startingSubtotal.toLocaleString("en-IN")} total for {nights} {nights === 1 ? "night" : "nights"}{roomsCount > 1 ? ` (${roomsCount} rooms)` : ""}
                                        <span className="text-neutral-400 font-normal ml-1">• + taxes &amp; fees</span>
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-neutral-400 mt-0.5">
                                        + taxes &amp; service fees (approx. ₹{startingGst.toLocaleString("en-IN")})
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

                              {/* Real Link to Hotel Details Page (Navy Rounded-Full Pill with Gold Text & Arrow) */}
                              <Link
                                to={`/hotel/${hotel.id}?checkIn=${encodeURIComponent(
                                  checkIn
                                )}&checkOut=${encodeURIComponent(
                                  checkOut
                                )}&guests=${encodeURIComponent(guests)}${
                                  searchParams.get("rooms")
                                    ? `&rooms=${encodeURIComponent(searchParams.get("rooms"))}`
                                    : ""
                                }`}
                                className="rounded-full bg-[#0B1527] hover:bg-[#162744] text-[#F3CF7A] px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-98 cursor-pointer mt-1"
                              >
                                <span>View Hotel</span>
                                <ArrowRight size={14} className="text-[#F3CF7A] stroke-[2.5]" />
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

      {/* MOBILE DESKTOP-ONLY NOTICE TOAST */}
      {desktopOnlyToast && (
        <aside
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex w-[90%] max-w-sm items-center justify-between gap-3 rounded-2xl bg-[#0B1527] px-4 py-3.5 text-white shadow-[0_16px_40px_rgba(11,21,39,0.45)] border border-[#C59A45]/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C59A45]/20 text-[#F3CF7A] border border-[#C59A45]/30">
              <Monitor size={16} />
            </div>
            <p className="text-xs font-semibold text-neutral-100 leading-snug">
              This option is enabled in desktop only
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDesktopOnlyToast(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            aria-label="Dismiss notice"
          >
            <X size={15} />
          </button>
        </aside>
      )}

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default Availability;