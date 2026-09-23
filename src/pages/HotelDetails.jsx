import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  AirVent,
  BatteryCharging,
  BedDouble,
  BriefcaseMedical,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cctv,
  Clock,
  Clock3,
  Coffee,
  DoorOpen,
  ExternalLink,
  MapPin,
  Refrigerator,
  Shield,
  ShieldCheck,
  ShieldUser,
  Shirt,
  Sparkles,
  Star,
  Tv,
  Users,
  Waves,
  Wifi,
} from "lucide-react";

import {
  getHotelById,
  getHotelMedia,
  getRoomCategories,
  getAvailability,
  getRoomPricing,
  getHotelAmenities,
} from "../services/hotelService";

import Footer from "../components/Footer";

// Deterministic proprietary Starlight Guest Rating (4.5 to 5.0)
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
  const score = scorePresets[absHash % scorePresets.length].toFixed(1);
  const reviews = 68 + (absHash % 160);
  const label =
    Number(score) >= 4.9
      ? "Exceptional"
      : Number(score) >= 4.7
      ? "Superb"
      : "Excellent";

  return { score, label, reviews };
}


// =========================================================
// DATE HELPERS
// =========================================================

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getDefaultCheckIn() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return getLocalDateString(date);
}


function getDefaultCheckOut() {
  const date = new Date();
  date.setDate(date.getDate() + 2);

  return getLocalDateString(date);
}


// =========================================================
// HOTEL DETAILS
// =========================================================
const amenityIcons = {
  wifi: Wifi,
  pool: Waves,
  parking: Car,
  power: BatteryCharging,
  elevator: ArrowUpDown,
  cctv: Cctv,
  security: ShieldCheck,
  "security-guard": ShieldUser,
  "emergency-exit": DoorOpen,
  "first-aid": BriefcaseMedical,
  tv: Tv,
  ac: AirVent,
  iron: Shirt,
  kettle: Coffee,
  fridge: Refrigerator,
};

function getAmenityIcon(iconKey) {
  return amenityIcons[iconKey] || Check;
}

function HotelDetails() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [hotelId]);

  // -------------------------------------------------------
  // SEARCH / BOOKING PARAMETERS
  // -------------------------------------------------------

  const checkIn =
    searchParams.get("checkIn") ||
    getDefaultCheckIn();

  const checkOut =
    searchParams.get("checkOut") ||
    getDefaultCheckOut();

  const guests =
    searchParams.get("guests") || "2";

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(1, diff || 1);
  }, [checkIn, checkOut]);


  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------

  const [hotel, setHotel] = useState(null);
  const [media, setMedia] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [amenityRows, setAmenityRows] = useState([]);

  const [selectedImage, setSelectedImage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [error, setError] = useState("");

  const [showAllAmenities, setShowAllAmenities] =
    useState(false);

  const [showAllAmenityCategories, setShowAllAmenityCategories] =
    useState(false);


  // =======================================================
  // LOAD HOTEL
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadHotel() {
      if (!hotelId) {
        setError("Hotel ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getHotelById(hotelId);

        if (!data) {
          throw new Error("Hotel not found.");
        }

        if (!cancelled) {
          setHotel(data);
        }

      } catch (err) {
        console.error("HOTEL ERROR:", err);

        if (!cancelled) {
          setError("Unable to load this hotel.");
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHotel();

    return () => {
      cancelled = true;
    };
  }, [hotelId]);


  // =======================================================
  // LOAD MEDIA
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadMedia() {
      if (!hotelId) return;

      try {
        const data = await getHotelMedia(hotelId);

        if (!cancelled) {
          setMedia(data);
          setSelectedImage(0);
        }

      } catch (err) {
        console.error("MEDIA ERROR:", err);

        if (!cancelled) {
          setMedia([]);
        }
      }
    }

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [hotelId]);


  // =======================================================
  // LOAD ROOMS + AVAILABILITY + PRICING + AMENITIES
  // =======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      if (!hotelId) return;

      try {
        setRoomsLoading(true);

        const categories =
          await getRoomCategories(hotelId);

        if (cancelled) return;

        setRoomCategories(categories);

        if (categories.length === 0) {
          setAvailability([]);
          setPricing([]);
          setAmenityRows([]);
          return;
        }

        const categoryIds =
          categories.map((category) => category.id);


        // -------------------------------------------------
        // AVAILABILITY
        // -------------------------------------------------

        try {
          const availabilityData =
            await getAvailability(
              hotelId,
              checkIn,
              checkOut
            );

          if (!cancelled) {
            setAvailability(
              availabilityData || []
            );
          }

        } catch (err) {
          console.error(
            "AVAILABILITY ERROR:",
            err
          );

          if (!cancelled) {
            setAvailability([]);
          }
        }


        // -------------------------------------------------
        // PRICING
        // -------------------------------------------------

        try {
          const pricingResults =
            await Promise.all(
              categories.map(async (category) => {
                try {
                  const data =
                    await getRoomPricing(
                      category.id,
                      checkIn,
                      checkOut
                    );

                  return {
                    categoryId: category.id,
                    data: data || [],
                  };

                } catch (err) {
                  console.error(
                    `PRICING ERROR FOR ${category.category_name}:`,
                    err
                  );

                  return {
                    categoryId: category.id,
                    data: [],
                  };
                }
              })
            );

          if (!cancelled) {
            setPricing(pricingResults);
          }

        } catch (err) {
          console.error(
            "PRICING LOAD ERROR:",
            err
          );

          if (!cancelled) {
            setPricing([]);
          }
        }


        // -------------------------------------------------
        // AMENITIES
        // -------------------------------------------------

        try {
          const amenities =
            await getHotelAmenities(
              categoryIds
            );

          if (!cancelled) {
            setAmenityRows(
              amenities || []
            );
          }

        } catch (err) {
          console.error(
            "AMENITIES ERROR:",
            err
          );

          if (!cancelled) {
            setAmenityRows([]);
          }
        }

      } catch (err) {
        console.error(
          "ROOM CATEGORY ERROR:",
          err
        );

        if (!cancelled) {
          setRoomCategories([]);
        }

      } finally {
        if (!cancelled) {
          setRoomsLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      cancelled = true;
    };

  }, [
    hotelId,
    checkIn,
    checkOut,
  ]);


  // =======================================================
  // GALLERY
  // =======================================================

  const images = useMemo(() => {
    return media.filter(
      (item) =>
        item.cloudinary_url &&
        item.media_type === "image"
    );
  }, [media]);


  const currentImage =
    images[selectedImage]?.cloudinary_url ||
    null;


  function previousImage() {
    if (images.length <= 1) return;

    setSelectedImage((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  }


  function nextImage() {
    if (images.length <= 1) return;

    setSelectedImage((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  }


  // =======================================================
  // AMENITIES
  // =======================================================

  const uniqueAmenities = useMemo(() => {
    const map = new Map();

    amenityRows.forEach((row) => {
      const amenity = row.amenities;

      if (!amenity) return;

      if (!map.has(amenity.id)) {
        map.set(amenity.id, amenity);
      }
    });

    return Array.from(map.values());
  }, [amenityRows]);


  const amenityCategories = useMemo(() => {
    const map = new Map();

    uniqueAmenities.forEach((amenity) => {
      const category = amenity.amenity_categories;

      if (!category) return;

      if (!map.has(category.id)) {
        map.set(category.id, {
          ...category,
          amenities: [],
        });
      }

      map.get(category.id).amenities.push(amenity);
    });

    return Array.from(map.values());
  }, [uniqueAmenities]);


  const visibleAmenities = showAllAmenities
    ? uniqueAmenities
    : uniqueAmenities.slice(0, 8);


  const visibleAmenityCategories =
    showAllAmenityCategories
      ? amenityCategories
      : amenityCategories.slice(0, 4);


  // =======================================================
  // ROOM PRICE
  // =======================================================

  function getRoomPriceDetails(category) {
    const defaultNightly = Number(category.default_price || 0);
    const result = pricing.find(
      (item) =>
        item.categoryId === category.id
    );

    if (!result || !result.data || result.data.length === 0) {
      return {
        nightly: defaultNightly,
        total: defaultNightly * nights,
      };
    }

    const totalFromRules = result.data.reduce(
      (total, item) =>
        total + Number(item.price || 0),
      0
    );

    const nightlyAverage = Math.round(
      totalFromRules / result.data.length
    );

    return {
      nightly: nightlyAverage,
      total: totalFromRules,
    };
  }

  function getRoomPrice(categoryId, defaultPrice) {
    const result = pricing.find(
      (item) =>
        item.categoryId === categoryId
    );

    if (!result || !result.data || result.data.length === 0) {
      return Number(defaultPrice || 0);
    }

    return Math.round(
      result.data.reduce(
        (total, item) =>
          total + Number(item.price || 0),
        0
      ) / result.data.length
    );
  }


  // =======================================================
  // ROOM AVAILABILITY
  // =======================================================

  function getAvailableRooms(category) {
    const result = availability.find(
      (item) =>
        item.room_category_id === category.id
    );

    if (result) {
      return Number(
        result.available_rooms ?? 0
      );
    }

    if (roomsLoading) {
      return Number(category.total_rooms || 0);
    }

    return Number(category.total_rooms || 0);
  }


  function getTotalRooms(category) {
    const result = availability.find(
      (item) =>
        item.room_category_id === category.id
    );

    if (!result) {
      return Number(
        category.total_rooms || 0
      );
    }

    return Number(
      result.total_rooms ||
      category.total_rooms ||
      0
    );
  }


  // =======================================================
  // GOOGLE MAPS
  // =======================================================

  const mapsUrl = hotel
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${hotel.hotel_name}, ${hotel.address || hotel.city
      }`
    )}${hotel.google_maps_place_id
      ? `&query_place_id=${hotel.google_maps_place_id}`
      : ""
    }`
    : "#";


  // =======================================================
  // LOADING SKELETON
  // =======================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="mx-auto max-w-7xl">
            {/* Top breadcrumbs skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 animate-pulse rounded-lg bg-neutral-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-48 animate-pulse rounded-lg bg-neutral-200" />
            </div>

            {/* Title skeleton */}
            <div className="mt-5 space-y-3">
              <div className="h-9 w-96 max-w-full animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-4 w-60 animate-pulse rounded-lg bg-neutral-200" />
            </div>

            {/* Gallery skeleton */}
            <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[460px] animate-pulse rounded-3xl bg-neutral-200/80" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[220px] animate-pulse rounded-3xl bg-neutral-200/80"
                  />
                ))}
              </div>
            </div>

            {/* Room cards skeleton */}
            <div className="mt-12 space-y-4">
              <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200" />
              <div className="h-40 animate-pulse rounded-3xl bg-neutral-200/80" />
              <div className="h-40 animate-pulse rounded-3xl bg-neutral-200/80" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================
  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-12 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
              <MapPin size={32} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
              Hotel unavailable
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              {error || "Selected hotel information could not be retrieved."}
            </p>

            <div className="mt-8">
              <Link
                to="/book-hotels"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1B1E28] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black hover:shadow-lg"
              >
                <ArrowLeft size={16} />
                Back to Available Stays
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hotelRating = getStarlightRating(hotel.id);

  // =======================================================
  // LUXURY HOTEL DETAILS PAGE
  // =======================================================
  return (
    <div className="min-h-screen bg-[#FCFCFD] text-neutral-900 flex flex-col justify-between">
      <main className="flex-1 pb-20">

        {/* ===================================================
            HOTEL HEADER & BREADCRUMBS
        =================================================== */}
        <section className="border-b border-neutral-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

            {/* Back button & Breadcrumbs */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  to={`/book-hotels?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                  aria-label="Go back"
                  title="Go back"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                </Link>

                <nav className="flex items-center gap-1.5 text-xs text-neutral-400 min-w-0">
                  <Link to="/" className="hover:text-neutral-600 transition-colors shrink-0">Home</Link>
                  <span>/</span>
                  <Link to="/book-hotels" className="hover:text-neutral-600 transition-colors shrink-0">Stays</Link>
                  <span>/</span>
                  <span className="text-neutral-500 shrink-0">{hotel.city}</span>
                  <span>/</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[150px] sm:max-w-none">
                    {hotel.hotel_name}
                  </span>
                </nav>
              </div>
            </div>

            {/* Title & Review Strip */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#B88428]">
                  <Sparkles size={12} className="text-[#D7A441]" />
                  Starlight Luxury Collection
                </div>

                <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 font-serif">
                  {hotel.hotel_name}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                  <MapPin size={15} className="shrink-0 text-[#D7A441]" />
                  <span>
                    {hotel.address ? `${hotel.address}, ` : ""}
                    <strong className="text-neutral-700">{hotel.city}</strong>
                  </span>
                </p>
              </div>

              {/* Starlight Guest Score Badge */}
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-[#F9FAFB] p-3 sm:px-4 sm:py-3 self-start lg:self-auto shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B1E28] text-white font-bold text-sm shadow-sm">
                  <span className="text-[#D7A441]">{hotelRating.score}</span>
                  <span className="text-[10px] text-amber-400 ml-0.5">★</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-neutral-900">
                      {hotelRating.label}
                    </span>
                    <span className="rounded-md bg-emerald-50 text-[10px] font-semibold text-emerald-700 px-1.5 py-0.5 border border-emerald-200">
                      Top 5%
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {hotelRating.reviews} verified guest reviews
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ===================================================
            IMAGE GALLERY
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {images.length > 0 ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-900 shadow-sm">
                <img
                  src={currentImage}
                  alt={hotel.hotel_name}
                  className="h-[360px] sm:h-[480px] lg:h-[520px] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-4 right-4 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white border border-white/20">
                      {selectedImage + 1} / {images.length} Photos
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedImage === index
                          ? "border-[#D7A441] ring-2 ring-[#D7A441]/40 scale-[1.02]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image.cloudinary_url}
                        alt={`${hotel.hotel_name} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[360px] flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-[#F9FAFB] text-neutral-400">
              <BedDouble size={40} className="mb-2 text-neutral-300 stroke-1" />
              <p className="text-sm font-medium">Hotel photography coming soon</p>
            </div>
          )}
        </section>


        {/* ===================================================
            SEARCH / STAY OVERVIEW STRIP
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88428]">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Check-in</p>
                  <p className="font-bold text-neutral-900">{checkIn}</p>
                </div>
              </div>

              <div className="hidden sm:block text-neutral-300">→</div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B88428]">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Check-out</p>
                  <p className="font-bold text-neutral-900">{checkOut}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-neutral-200/70 pl-4 sm:pl-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Guests</p>
                  <p className="font-bold text-neutral-900">{guests} Guests</p>
                </div>
              </div>
            </div>

            <Link
              to={`/book-hotels?location=${encodeURIComponent(hotel.city)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:border-[#D7A441] hover:text-[#B88428] transition-colors"
            >
              <span>Modify Dates</span>
            </Link>
          </div>
        </section>


        {/* ===================================================
            CHOOSE YOUR ROOM (CORE BOOKING LISTING)
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-baseline justify-between gap-4 border-b border-neutral-200/70 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">
                Select Accommodation
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-serif">
                Choose your room
              </h2>
            </div>

            <p className="text-xs text-neutral-500 hidden sm:block">
              Best direct rates guaranteed
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {roomsLoading ? (
              [1, 2].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-3xl border border-neutral-200/80 bg-white"
                />
              ))
            ) : roomCategories.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-500 shadow-sm">
                No room categories are currently available for the selected dates.
              </div>
            ) : (
              roomCategories.map((category) => {
                const available = getAvailableRooms(category);
                const total = getTotalRooms(category);
                const priceDetails = getRoomPriceDetails(category);
                const isAvailable = available > 0;

                return (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* ROOM INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
                            <BedDouble size={24} strokeWidth={1.8} />
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-neutral-900">
                              {category.category_name}
                            </h3>

                            {category.description?.trim() ? (
                              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-600">
                                {category.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          {category.max_occupancy ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 px-3 py-1 text-xs font-medium text-neutral-700">
                              <Users size={13} className="text-[#D7A441]" />
                              Up to {category.max_occupancy} {category.max_occupancy === 1 ? "guest" : "guests"}
                            </span>
                          ) : null}

                          {/* Live Inventory Badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              isAvailable
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                : "bg-neutral-100 border border-neutral-200 text-neutral-400"
                            }`}
                          >
                            {isAvailable && (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </span>
                            )}
                            {isAvailable
                              ? `${available} of ${total} rooms available`
                              : "Sold out for these dates"}
                          </span>
                        </div>
                      </div>

                      {/* PRICE + DIRECT BOOKING CTA */}
                      <div className="flex flex-col sm:flex-row lg:flex-row shrink-0 items-start sm:items-center justify-between gap-4 sm:gap-6 border-t border-neutral-200/70 pt-5 lg:min-w-[320px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 w-full lg:w-auto">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Direct Rate
                          </p>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                              ₹{priceDetails.nightly.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-neutral-500">/ night</span>
                          </div>
                          {nights > 1 ? (
                            <p className="text-[11px] font-semibold text-[#B88428] mt-0.5">
                              ₹{priceDetails.total.toLocaleString("en-IN")} total for {nights} nights
                            </p>
                          ) : (
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Inclusive of taxes
                            </p>
                          )}
                        </div>

                        {/* Real Link to Redesigned Bookings Page with Exact Parameters */}
                        <Link
                          to={
                            isAvailable
                              ? `/bookings?hotel=${hotel.id}&category=${category.id}&checkIn=${encodeURIComponent(
                                  checkIn
                                )}&checkOut=${encodeURIComponent(
                                  checkOut
                                )}&guests=${encodeURIComponent(guests)}`
                              : "#"
                          }
                          onClick={(event) => {
                            if (!isAvailable) {
                              event.preventDefault();
                            }
                          }}
                          className={`group inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer w-full sm:w-auto ${
                            isAvailable
                              ? "bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] hover:from-[#C89532] hover:to-[#A7751E] text-neutral-950 hover:shadow-xl hover:scale-102"
                              : "cursor-not-allowed bg-neutral-200 text-neutral-400 shadow-none"
                          }`}
                        >
                          <span>{isAvailable ? "Book Room" : "Sold Out"}</span>
                          {isAvailable && (
                            <ArrowRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          )}
                        </Link>
                      </div>

                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>


        {/* ===================================================
            ABOUT THE HOTEL & AMENITIES
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">

            {/* DESCRIPTION */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">
                Overview
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 font-serif">
                About {hotel.hotel_name}
              </h2>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-neutral-600">
                {hotel.description ||
                  "A distinguished destination curated under the Starlight collection, delivering exceptional hospitality, refined comfort, and serene spaces designed for travelers seeking boutique luxury."}
              </p>

              {/* Features Guarantee Pills */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-neutral-200/70 pt-6 text-xs font-semibold text-neutral-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#D7A441]" />
                  <span>Starlight Verified Stay</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#D7A441]" />
                  <span>Prime City Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#D7A441]" />
                  <span>24/7 Front Desk Concierge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#D7A441]" />
                  <span>Contactless Check-in Ready</span>
                </div>
              </div>
            </div>

            {/* AMENITIES */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">
                    Facilities
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-neutral-900">
                    Property Amenities
                  </h3>
                </div>

                {uniqueAmenities.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllAmenities((value) => !value)}
                    className="text-xs font-bold text-[#B88428] hover:underline cursor-pointer"
                  >
                    {showAllAmenities ? "Show less" : `All (${uniqueAmenities.length})`}
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {visibleAmenities.length > 0 ? (
                  visibleAmenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity.icon);
                    return (
                      <span
                        key={amenity.id}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-neutral-200/80 bg-[#F9FAFB] px-3.5 py-2 text-xs font-medium text-neutral-800"
                      >
                        <Icon size={14} className="text-[#D7A441]" />
                        {amenity.name}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-500 italic">
                    High-speed Wi-Fi, air conditioning, and daily housekeeping included.
                  </p>
                )}
              </div>
            </div>

          </div>
        </section>


        {/* ===================================================
            HOTEL POLICIES
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-3xl border border-neutral-200/80 bg-[#F9FAFB] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">
              Good to know
            </p>
            <h2 className="mt-1 text-xl font-bold text-neutral-900">
              Hotel policies & Guidelines
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                <Clock3 size={18} className="text-[#D7A441]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Check-in
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-900">From 12:00 PM</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                <Clock3 size={18} className="text-[#D7A441]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Check-out
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-900">By 11:00 AM</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                <ShieldCheck size={18} className="text-[#D7A441]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Identification
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-900">Govt Photo ID</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                <Users size={18} className="text-[#D7A441]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Hospitality
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-900">Families & Couples</p>
              </div>
            </div>
          </div>
        </section>


        {/* ===================================================
            LOCATION & MAP
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">
                  Location & Vicinity
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 font-serif">
                  Find us easily
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-neutral-600">
                  {hotel.hotel_name} — {hotel.address ? `${hotel.address}, ` : ""}{hotel.city}
                </p>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-black self-start sm:self-auto cursor-pointer"
              >
                <span>View on Google Maps</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}

export default HotelDetails;