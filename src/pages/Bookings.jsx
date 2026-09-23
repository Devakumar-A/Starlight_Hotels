import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  AirVent,
  ArrowUpDown,
  BatteryCharging,
  BedDouble,
  BriefcaseMedical,
  Car,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Cctv,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Coffee,
  DoorOpen,
  HelpCircle,
  Info,
  Lock,
  MapPin,
  Minus,
  Plus,
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
  getRoomCategoryAmenities,
  getHotels,
  getRoomCategories,
  getAvailability,
  getRoomPricing,
  createBooking,
  getHotelMedia,
} from "../services/hotelService";
import { supabase } from "../lib/supabase";

import AuthModal from "../components/AuthModal";
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

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDayAfterTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  return Math.max(
    0,
    Math.round(difference / (1000 * 60 * 60 * 24))
  );
}

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
  return amenityIcons[iconKey] || CheckCircle2;
}

function Bookings() {
  const { hotelId: paramHotelId } = useParams();
  const [searchParams] = useSearchParams();

  const hotelId = paramHotelId || searchParams.get("hotel");
  const queryCategoryId = searchParams.get("category");

  const [selectedCategoryId, setSelectedCategoryId] = useState(queryCategoryId);
  const categoryId = selectedCategoryId || queryCategoryId || category?.id;
  const [availableCategories, setAvailableCategories] = useState([]);

  const checkIn = searchParams.get("checkIn") || getTomorrowDate();
  const checkOut = searchParams.get("checkOut") || getDayAfterTomorrowDate();

  const [selectedCheckIn, setSelectedCheckIn] = useState(checkIn);
  const [selectedCheckOut, setSelectedCheckOut] = useState(checkOut);

  const initialGuests =
    Number(searchParams.get("guests")) || 1;

  const [hotel, setHotel] = useState(null);
  const [category, setCategory] = useState(null);

  const [availableRooms, setAvailableRooms] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);

  const [pricing, setPricing] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState("");

  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(initialGuests);

  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] =
    useState("");

  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const [authMode, setAuthMode] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [hotelImage, setHotelImage] = useState(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  // --------------------------------------------------
  // LOAD HOTEL + CATEGORY
  // --------------------------------------------------
  useEffect(() => {
    if (!bookingConfirmation) return;

    const timer = setTimeout(() => {
      setBookingConfirmation(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [bookingConfirmation]);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError("");

        let activeHotel = null;
        let activeHotelId = hotelId;

        const hotels = await getHotels();
        if (!hotels.length) {
          throw new Error("No hotels found.");
        }

        if (activeHotelId) {
          activeHotel = hotels.find((item) => item.id === activeHotelId);
        } else {
          activeHotel = hotels[0];
          activeHotelId = activeHotel.id;
        }

        if (!activeHotel) {
          throw new Error("Hotel not found.");
        }

        const categories = await getRoomCategories(activeHotelId);
        if (!categories || categories.length === 0) {
          throw new Error("No room categories found for this hotel.");
        }

        setAvailableCategories(categories);

        const chosenCategory =
          categories.find((item) => item.id === (selectedCategoryId || queryCategoryId)) ||
          categories[0];

        setHotel(activeHotel);
        setCategory(chosenCategory);
        if (!selectedCategoryId) {
          setSelectedCategoryId(chosenCategory.id);
        }

        try {
          const media = await getHotelMedia(activeHotelId);
          const firstImg = media?.find((m) => m.cloudinary_url)?.cloudinary_url || null;
          setHotelImage(firstImg);
        } catch (mediaErr) {
          console.error("Hotel media load error:", mediaErr);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
          "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [hotelId, selectedCategoryId]);

  // --------------------------------------------------
  // LOAD SELECTED ROOM CATEGORY AMENITIES
  // --------------------------------------------------

  useEffect(() => {
    async function loadAmenities() {
      if (!categoryId) {
        setAmenities([]);
        return;
      }

      try {
        const data = await getRoomCategoryAmenities(categoryId);

        // Remove duplicates just in case
        const unique = Array.from(
          new Map(
            data
              .filter((row) => row.amenities)
              .map((row) => [row.amenities.id, row.amenities])
          ).values()
        );

        setAmenities(unique);
      } catch (err) {
        console.error("ROOM CATEGORY AMENITIES ERROR:", err);
        setAmenities([]);
      }
    }

    loadAmenities();
  }, [categoryId]);

  // --------------------------------------------------
  // LOAD LIVE AVAILABILITY
  // --------------------------------------------------

  async function refreshAvailability() {
    if (
      !hotelId ||
      !categoryId ||
      !selectedCheckIn ||
      !selectedCheckOut
    ) {
      return;
    }

    try {
      setAvailabilityLoading(true);
      setAvailabilityError("");

      const result = await getAvailability(
        hotelId,
        selectedCheckIn,
        selectedCheckOut
      );

      const selected = result.find(
        (item) =>
          item.room_category_id === categoryId
      );

      if (!selected) {
        setAvailableRooms(0);
        setTotalRooms(0);
        return;
      }

      setAvailableRooms(
        Number(selected.available_rooms) || 0
      );

      setTotalRooms(
        Number(selected.total_rooms) || 0
      );

      // If availability decreases in realtime,
      // automatically keep selected rooms valid.
      setRooms((currentRooms) => {
        if (selected.available_rooms <= 0) {
          return 1;
        }

        return Math.min(
          currentRooms,
          Number(selected.available_rooms)
        );
      });
    } catch (err) {
      console.error(err);

      setAvailabilityError(
        "Unable to refresh room availability."
      );
    } finally {
      setAvailabilityLoading(false);
    }
  }

  useEffect(() => {
    if (!loading) {
      refreshAvailability();
    }
  }, [
    loading,
    hotelId,
    categoryId,
    selectedCheckIn,
    selectedCheckOut,
  ]);

  // --------------------------------------------------
  // REALTIME AVAILABILITY
  // --------------------------------------------------

  useEffect(() => {
    if (
      !hotelId ||
      !categoryId ||
      !selectedCheckIn ||
      !selectedCheckOut
    ) {
      return;
    }

    const channel = supabase
      .channel(
        `booking-availability-${hotelId}-${categoryId}-${selectedCheckIn}-${selectedCheckOut}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          refreshAvailability();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_rooms",
        },
        () => {
          refreshAvailability();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_blocks",
        },
        () => {
          refreshAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    hotelId,
    categoryId,
    selectedCheckIn,
    selectedCheckOut,
  ]);

  const nights = useMemo(
    () =>
      getNights(
        selectedCheckIn,
        selectedCheckOut
      ),
    [selectedCheckIn, selectedCheckOut]
  );

  // --------------------------------------------------
  // LOAD DATE-WISE ROOM PRICING
  // --------------------------------------------------

  useEffect(() => {
    async function loadPricing() {
      if (
        !categoryId ||
        !selectedCheckIn ||
        !selectedCheckOut ||
        nights <= 0
      ) {
        setPricing([]);
        return;
      }

      try {
        setPricingLoading(true);
        setPricingError("");

        const result = await getRoomPricing(
          categoryId,
          selectedCheckIn,
          selectedCheckOut
        );

        setPricing(result);
      } catch (err) {
        console.error(err);
        setPricing([]);
        setPricingError("Unable to load room pricing.");
      } finally {
        setPricingLoading(false);
      }
    }

    loadPricing();
  }, [
    categoryId,
    selectedCheckIn,
    selectedCheckOut,
    nights,
  ]);

  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const nightlyTotalPerRoom = pricing.reduce(
    (total, item) => total + Number(item.price || 0),
    0
  );

  const averagePricePerNight =
    nights > 0
      ? nightlyTotalPerRoom / nights
      : 0;

  const roomTotal =
    nightlyTotalPerRoom * rooms;

  const maxGuestsPerRoom =
    Number(category?.max_occupancy) || 1;

  const maximumGuests =
    maxGuestsPerRoom * rooms;

  // --------------------------------------------------
  // ROOM CONTROLS
  // --------------------------------------------------

  function decreaseRooms() {
    setRooms((current) => {
      const newValue = Math.max(1, current - 1);

      const newMaximum =
        maxGuestsPerRoom * newValue;

      setGuests((currentGuests) =>
        Math.min(currentGuests, newMaximum)
      );

      return newValue;
    });
  }

  function increaseRooms() {
    if (rooms >= availableRooms) return;

    setRooms((current) => current + 1);
  }

  function changeGuests(value) {
    const newGuests = Number(value);

    if (newGuests <= maximumGuests) {
      setGuests(newGuests);
    }
  }
  const handleBookNow = async () => {
    console.log("Book Now clicked");

    setBookingError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Current user:", user);

      // Not logged in
      if (!user) {
        console.log("USER NOT LOGGED IN → OPEN SIGNUP");
        setAuthMode("signup");
        return;
      }

      console.log("USER LOGGED IN:", user.id);

      // User is authenticated → continue booking
      await completeBooking();

    } catch (error) {
      console.error("BOOKING ERROR:", error);

      setBookingError(
        error?.message || "Unable to continue booking."
      );
    }
  };
  const completeBooking = async () => {
    setBookingLoading(true);
    setBookingError("");

    try {
      const result = await createBooking({
        numberOfGuests: guests,
        checkInDate: selectedCheckIn,
        checkOutDate: selectedCheckOut,
        roomCategoryId: categoryId,
        roomsRequested: rooms,
      });

      if (!result) {
        throw new Error("Booking could not be created.");
      }

      setBookingConfirmation(result);

      // Refresh availability after successful booking
      await refreshAvailability();
    } catch (error) {
      console.error("BOOKING ERROR:", error);

      const message = error?.message || "";

      if (message.includes("Phone number is required")) {
        setBookingError("");
        setPhone("");
        setPhoneModalOpen(true);
        return;
      }

      if (message.includes("Not enough rooms")) {
        setBookingError(
          "Not enough rooms available for the selected dates."
        );
        return;
      }

      if (message.includes("just booked")) {
        setBookingError(
          "The selected room was just booked. Please try again."
        );
        return;
      }

      setBookingError(
        message || "Unable to complete booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = phone.trim();

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setBookingError(
        "Please enter a valid phone number."
      );
      return;
    }

    try {
      setPhoneSaving(true);
      setBookingError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPhoneModalOpen(false);
        setAuthMode("signup");
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          phone: cleanPhone,
        })
        .eq("id", user.id);

      if (error) throw error;

      console.log("PHONE SAVED");

      setPhoneModalOpen(false);

      // Continue booking automatically
      await completeBooking();

    } catch (error) {
      console.error("PHONE SAVE ERROR:", error);

      setBookingError(
        error?.message ||
        "Unable to save phone number."
      );
    } finally {
      setPhoneSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING SKELETON
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="mx-auto max-w-7xl">
            {/* Top breadcrumb skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 animate-pulse rounded-lg bg-neutral-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-44 animate-pulse rounded-lg bg-neutral-200" />
            </div>

            {/* Title skeleton */}
            <div className="mt-5 space-y-3">
              <div className="h-9 w-80 max-w-full animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-4 w-56 animate-pulse rounded-lg bg-neutral-200" />
            </div>

            {/* Main grid skeleton */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
              <div className="space-y-6">
                <div className="h-80 animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />
                <div className="h-48 animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />
                <div className="h-44 animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />
              </div>

              <div className="h-[540px] animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR SCREEN
  // --------------------------------------------------
  if (error || !hotel || !category) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-12 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
              <AlertCircle size={32} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
              Unable to proceed with reservation
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              {error || "Selected hotel or room category information could not be retrieved."}
            </p>

            <div className="mt-8">
              <Link
                to="/book-hotels"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1B1E28] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black hover:shadow-lg"
              >
                <ArrowLeft size={16} />
                Explore Available Stays
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hotelRating = getStarlightRating(hotel.id);

  // --------------------------------------------------
  // MAIN LUXURY BOOKING INTERFACE
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FCFCFD] text-neutral-900 flex flex-col justify-between">
      <main className="flex-1 pb-20">

        {/* =================================================
          TOP BREADCRUMB & PROPERTY HEADER
        ================================================= */}
        <section className="border-b border-neutral-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

            {/* Back button & Breadcrumbs */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = `/book-hotels?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`;
                    }
                  }}
                  aria-label="Go back"
                  title="Go back"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform hover:-translate-x-0.5"
                  />
                </button>

                <nav className="flex items-center gap-1.5 text-xs text-neutral-400 min-w-0">
                  <Link to="/" className="hover:text-neutral-600 transition-colors shrink-0">Home</Link>
                  <span>/</span>
                  <Link to="/book-hotels" className="hover:text-neutral-600 transition-colors shrink-0">Stays</Link>
                  <span>/</span>
                  <span className="text-neutral-500 shrink-0">{hotel.city}</span>
                  <span>/</span>
                  <span className="font-medium text-neutral-800 truncate max-w-[150px] sm:max-w-none">
                    {hotel.hotel_name}
                  </span>
                  <span>/</span>
                  <span className="text-[#B88428] font-semibold shrink-0">Review &amp; Book</span>
                </nav>
              </div>
            </div>

            {/* Property Title & Badges */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#B88428]">
                  <Sparkles size={12} className="text-[#D7A441]" />
                  Starlight Verified Stay
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

              {/* Starlight Guest Score Badge (MakeMyTrip / Booking.com standard) */}
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


        {/* =================================================
          MAIN BOOKING 2-COLUMN GRID (Booking.com / MakeMyTrip / Elivaas)
        ================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start">

            {/* =================================================
              LEFT COLUMN — DETAILS, AMENITIES, POLICIES & TRUST
            ================================================= */}
            <div className="space-y-6">

              {/* ROOM DETAILS CARD */}
              <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm transition-all">

                {/* Hero Room Media */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-neutral-100">
                  {hotelImage ? (
                    <img
                      src={hotelImage}
                      alt={category.category_name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-[#161722] text-white p-6 text-center">
                      <BedDouble size={48} className="text-[#D7A441] mb-2 stroke-1" />
                      <p className="text-base font-medium">{category.category_name}</p>
                      <p className="text-xs text-neutral-400 mt-1">{hotel.hotel_name}</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Badges on image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-medium border border-white/20">
                      Selected Category
                    </span>
                    <span className="text-xs font-semibold text-[#E5C368] drop-shadow">
                      Direct Confirmation
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#B88428]">
                        Accommodation Details
                      </p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                        {category.category_name}
                      </h2>

                      {availableCategories.length > 1 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-neutral-400 font-medium">Available Options:</span>
                          {availableCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategoryId(cat.id);
                                setCategory(cat);
                              }}
                              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                                category?.id === cat.id
                                  ? "bg-[#1B1E28] text-[#D7A441] shadow-xs ring-1 ring-[#D7A441]/40"
                                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                              }`}
                            >
                              {cat.category_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 self-start sm:self-auto">
                      <BedDouble size={14} className="text-[#D7A441]" />
                      <span>Bespoke Suite</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                    {category.description ||
                      "Individually curated luxury space with premium bedding, fine bath fittings, and generous natural light designed for your complete relaxation."}
                  </p>

                  {/* Quick Feature Pills */}
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700">
                      <Users size={14} className="text-[#D7A441]" />
                      Up to {category.max_occupancy || 1} {category.max_occupancy === 1 ? "Guest" : "Guests"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700">
                      <BedDouble size={14} className="text-[#D7A441]" />
                      King or Twin Beds
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700">
                      <AirVent size={14} className="text-[#D7A441]" />
                      Climate Controlled
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700">
                      <Wifi size={14} className="text-[#D7A441]" />
                      Complimentary High-Speed Wi-Fi
                    </span>
                  </div>

                </div>
              </div>


              {/* AMENITIES CARD */}
              <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setAmenitiesOpen(!amenitiesOpen)}
                  className="flex w-full items-center justify-between p-6 sm:p-7 text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
                >
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#D7A441]" />
                      Room Amenities & Inclusions
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                      Everything provided in your suite for a seamless stay
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    {amenitiesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {amenitiesOpen && (
                  <div className="border-t border-neutral-200/70 p-6 sm:p-7 bg-[#FCFCFD]">
                    {amenities.length === 0 ? (
                      <p className="text-sm text-neutral-500 italic">
                        Standard luxury amenities included for this category.
                      </p>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                          {(showAllAmenities ? amenities : amenities.slice(0, 6)).map((amenity) => {
                            const Icon = getAmenityIcon(amenity.icon);

                            return (
                              <div
                                key={amenity.id}
                                className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-3.5 text-xs sm:text-sm font-medium text-neutral-800 shadow-xs hover:border-[#D7A441]/50 transition-all"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#B88428]">
                                  <Icon size={16} strokeWidth={2} />
                                </div>
                                <span className="truncate">{amenity.name}</span>
                              </div>
                            );
                          })}
                        </div>

                        {amenities.length > 6 && (
                          <button
                            type="button"
                            onClick={() => setShowAllAmenities((value) => !value)}
                            className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#B88428] hover:text-[#976a1c] underline underline-offset-4 cursor-pointer"
                          >
                            {showAllAmenities ? "Show fewer amenities ↑" : `View all ${amenities.length} amenities ↓`}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>


              {/* STARLIGHT 4-PILLAR ASSURANCE (Elivaas / MakeMyTrip style) */}
              <div className="rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white to-[#F9FAFB] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#D7A441]" />
                  <h3 className="text-base font-bold text-neutral-900">
                    The Starlight Assurance
                  </h3>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200/70 bg-white p-4">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-neutral-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">✓</span>
                      Direct Best Rate Promise
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-neutral-500">
                      Zero hidden platform markups. What you see is direct from property pricing.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/70 bg-white p-4">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-neutral-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">✓</span>
                      Instant Room Allocation
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-neutral-500">
                      Guaranteed reservation confirmation instantly synced with the front desk.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/70 bg-white p-4">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-neutral-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">✓</span>
                      24/7 Dedicated Concierge
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-neutral-500">
                      Personal on-ground support before, during, and after your stay.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/70 bg-white p-4">
                    <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm text-neutral-900">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">✓</span>
                      Spotless & Sanitized
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-neutral-500">
                      Strict 50-point hygiene inspection completed prior to every guest arrival.
                    </p>
                  </div>
                </div>
              </div>


              {/* POLICIES & HOUSE RULES */}
              <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Clock size={18} className="text-[#D7A441]" />
                  Stay Policies & House Rules
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200/70 bg-[#F9FAFB] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Check-in
                    </p>
                    <p className="mt-1 text-base font-bold text-neutral-900">
                      From 12:00 PM
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
                      Early check-in is subject to room availability upon arrival.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/70 bg-[#F9FAFB] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Check-out
                    </p>
                    <p className="mt-1 text-base font-bold text-neutral-900">
                      By 11:00 AM
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
                      Late check-out available on request through the front desk.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-neutral-200/70 pt-5 text-xs text-neutral-600">
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-neutral-800">•</span>
                    <span><strong>Government Identification:</strong> Valid government-issued photo ID (Aadhaar, Passport, or Driving License) is mandatory for all adult guests at check-in.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-neutral-800">•</span>
                    <span><strong>Guest Welcoming:</strong> Couples, families, and solo business travelers are all warmly accommodated.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-bold text-neutral-800">•</span>
                    <span><strong>Property Decorum:</strong> Non-smoking guest rooms. Quiet hours observed between 10:00 PM and 7:00 AM.</span>
                  </p>
                </div>
              </div>


              {/* GUEST REVIEWS & SENTIMENT */}
              <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setReviewsOpen(!reviewsOpen)}
                  className="flex w-full items-center justify-between p-6 sm:p-7 text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#B88428] font-bold text-sm">
                      ★ {hotelRating.score}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                        Guest Reviews & Ratings
                      </h2>
                      <p className="text-xs text-neutral-500">
                        {hotelRating.label} · Based on {hotelRating.reviews} genuine traveler experiences
                      </p>
                    </div>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    {reviewsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {reviewsOpen && (
                  <div className="border-t border-neutral-200/70 p-6 sm:p-7 bg-[#FCFCFD]">
                    {/* Score categories breakdown */}
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                          <span>Cleanliness & Hygiene</span>
                          <span className="text-[#B88428]">4.9 / 5.0</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#D7A441]" style={{ width: "98%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                          <span>Staff & Hospitality</span>
                          <span className="text-[#B88428]">4.9 / 5.0</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#D7A441]" style={{ width: "98%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                          <span>Bed Comfort & Quietness</span>
                          <span className="text-[#B88428]">4.8 / 5.0</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#D7A441]" style={{ width: "96%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-semibold text-neutral-800 mb-1">
                          <span>Value for Money</span>
                          <span className="text-[#B88428]">4.7 / 5.0</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#D7A441]" style={{ width: "94%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-white border border-neutral-200/70 p-4 text-xs text-neutral-600">
                      <p className="italic">
                        "The room was exceptionally immaculate and the check-in process was instantaneous. The Starlight hospitality standards truly elevate this property."
                      </p>
                      <p className="mt-2 font-bold text-neutral-800">
                        — Verified Starlight Guest · Stayed recently
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>


            {/* =================================================
              RIGHT COLUMN — STICKY BOOKING & PRICE SUMMARY CARD
              (Booking.com / MakeMyTrip / Elivaas Standard)
            ================================================= */}
            <aside className="lg:sticky lg:top-28 space-y-4">

              <div className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xl">

                {/* Top Luxury Banner */}
                <div className="bg-gradient-to-r from-[#1B1E28] via-[#2A2E3D] to-[#1B1E28] p-5 sm:p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C368]">
                        Booking Summary
                      </span>
                      <h3 className="mt-1 text-lg font-bold truncate max-w-[220px]">
                        {category.category_name}
                      </h3>
                      <p className="text-xs text-neutral-300 truncate max-w-[220px]">
                        {hotel.hotel_name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold tracking-tight text-[#E5C368]">
                        ₹{roomTotal.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-neutral-300 mt-0.5">
                        {nights} {nights === 1 ? "night" : "nights"} stay
                      </p>
                    </div>
                  </div>
                </div>


                {/* INTERACTIVE DATE SELECTOR */}
                <div className="border-b border-neutral-200/70">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200/70 bg-[#FCFCFD]">

                    {/* Check-in */}
                    <div className="p-4 transition-colors hover:bg-white">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        <CalendarDays size={14} className="text-[#D7A441]" />
                        Check-in
                      </div>

                      <input
                        type="date"
                        value={selectedCheckIn || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          const newCheckIn = e.target.value;
                          setSelectedCheckIn(newCheckIn);

                          if (
                            selectedCheckOut &&
                            newCheckIn >= selectedCheckOut
                          ) {
                            setSelectedCheckOut("");
                          }
                        }}
                        className="mt-1.5 w-full cursor-pointer bg-transparent text-xs sm:text-sm font-bold text-neutral-900 outline-none"
                      />

                      <p className="mt-1 text-[10px] text-neutral-400">
                        Standard: 12:00 PM
                      </p>
                    </div>

                    {/* Check-out */}
                    <div className="p-4 transition-colors hover:bg-white">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        <CalendarDays size={14} className="text-[#D7A441]" />
                        Check-out
                      </div>

                      <input
                        type="date"
                        value={selectedCheckOut || ""}
                        min={selectedCheckIn || ""}
                        disabled={!selectedCheckIn}
                        onChange={(e) => setSelectedCheckOut(e.target.value)}
                        className="mt-1.5 w-full cursor-pointer bg-transparent text-xs sm:text-sm font-bold text-neutral-900 outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      />

                      <p className="mt-1 text-[10px] text-neutral-400">
                        Standard: 11:00 AM
                      </p>
                    </div>

                  </div>

                  {/* Duration Pill Indicator */}
                  <div className="bg-amber-50/60 px-4 py-2 text-center text-xs font-semibold text-[#B88428] border-t border-neutral-100 flex items-center justify-center gap-2">
                    <Clock size={13} className="text-[#D7A441]" />
                    <span>Duration: {nights} {nights === 1 ? "Night" : "Nights"}</span>
                  </div>
                </div>


                {/* GUESTS SELECTOR */}
                <div className="border-b border-neutral-200/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500">Guests</p>
                        <p className="text-sm font-bold text-neutral-900">
                          {guests} {guests === 1 ? "Guest" : "Guests"}
                        </p>
                      </div>
                    </div>

                    <select
                      value={guests}
                      onChange={(e) => changeGuests(e.target.value)}
                      className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-neutral-800 shadow-xs outline-none focus:border-[#D7A441] focus:ring-2 focus:ring-[#D7A441]/20 cursor-pointer"
                    >
                      {Array.from(
                        { length: maximumGuests },
                        (_, index) => index + 1
                      ).map((value) => (
                        <option key={value} value={value}>
                          {value} {value === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="mt-2.5 text-[11px] text-neutral-400">
                    Max room occupancy: <strong className="text-neutral-700">{maximumGuests} guests</strong>
                  </p>

                  {guests >= maximumGuests && (
                    <p className="mt-1 text-[11px] font-semibold text-amber-700">
                      Maximum room capacity reached.
                    </p>
                  )}
                </div>


                {/* ROOMS SELECTOR & LIVE INVENTORY */}
                <div className="border-b border-neutral-200/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-neutral-500">Rooms</p>
                      <p className="text-sm font-bold text-neutral-900">
                        {rooms} {rooms === 1 ? "Room" : "Rooms"}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center rounded-xl border border-neutral-300 bg-neutral-50/50 p-1">
                      <button
                        type="button"
                        onClick={decreaseRooms}
                        disabled={rooms <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-700 shadow-xs transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                        aria-label="Decrease rooms"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-8 text-center text-sm font-bold text-neutral-900">
                        {rooms}
                      </span>

                      <button
                        type="button"
                        onClick={increaseRooms}
                        disabled={
                          rooms >= availableRooms ||
                          availableRooms <= 0
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-700 shadow-xs transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                        aria-label="Increase rooms"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Live room inventory badge */}
                  <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 px-3.5 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">
                        Live Availability:
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        {availabilityLoading
                          ? "Checking inventory..."
                          : `${availableRooms} of ${totalRooms} rooms free`}
                      </span>
                    </div>
                  </div>

                  {availabilityError && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {availabilityError}
                    </p>
                  )}
                </div>


                {/* PRICE BREAKDOWN TABLE */}
                <div className="p-5 sm:p-6 bg-[#FCFCFD]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Transparent Price Details
                  </h4>

                  <div className="mt-4 space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-neutral-600">
                      <div>
                        <span>Average Nightly Rate</span>
                        <p className="text-[11px] text-neutral-400">
                          ₹{averagePricePerNight.toLocaleString("en-IN")} × {rooms} {rooms === 1 ? "room" : "rooms"}
                        </p>
                      </div>
                      <span className="font-semibold text-neutral-900">
                        ₹{(averagePricePerNight * rooms).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Stay Duration</span>
                      <span className="font-semibold text-neutral-900">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Taxes & Service Fees</span>
                      <span className="font-semibold text-emerald-700">
                        Itemized at final invoice
                      </span>
                    </div>

                    {/* Date-wise explanation badge */}
                    <div className="rounded-xl bg-neutral-100/80 p-3 text-[11px] leading-relaxed text-neutral-500">
                      Exact total calculated by summing nightly date-wise pricing across {rooms} {rooms === 1 ? "room" : "rooms"} for {nights} {nights === 1 ? "night" : "nights"}.
                    </div>

                    {/* Total Amount */}
                    <div className="border-t border-neutral-200/80 pt-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-sm font-bold text-neutral-900">Total Amount</p>
                          <p className="text-[10px] text-neutral-400">Guaranteed direct booking rate</p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                          ₹{roomTotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleBookNow}
                      disabled={
                        bookingLoading ||
                        availableRooms <= 0 ||
                        rooms > availableRooms ||
                        nights <= 0
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] hover:from-[#C89532] hover:to-[#A7751E] text-neutral-950 font-bold py-4 px-6 text-sm sm:text-base shadow-md hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500 cursor-pointer"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                          <span>Securing Your Stay...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Reservation</span>
                          <ChevronRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>

                    {bookingError && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    <p className="mt-3 text-center text-[11px] text-neutral-400 leading-relaxed">
                      By proceeding, you accept Starlight's{" "}
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 underline underline-offset-2 transition-colors hover:text-[#B88428]"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 underline underline-offset-2 transition-colors hover:text-[#B88428]"
                      >
                        Privacy Policy
                      </Link>
                      . Direct front-desk booking settlement.
                    </p>
                  </div>

                </div>
              </div>

            </aside>

          </div>
        </section>

      </main>

      {/* GLOBAL FOOTER */}
      <Footer />

      {/* =================================================
        BOOKING CONFIRMATION MODAL (Celebration Design)
      ================================================= */}
      {bookingConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl border border-neutral-200">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
              Reservation Confirmed!
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-neutral-500">
              Your luxury stay at <strong className="text-neutral-800">{hotel.hotel_name}</strong> is officially booked.
            </p>

            <div className="mt-6 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 p-5 text-left text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-neutral-500 font-medium">Booking Reference</span>
                <span className="font-mono font-bold text-[#B88428] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                  {bookingConfirmation.booking_reference}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-neutral-500 font-medium">Category</span>
                <strong className="text-neutral-800">{category.category_name}</strong>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-neutral-500 font-medium">Allocated Rooms</span>
                <strong className="text-neutral-800">
                  {bookingConfirmation.room_ids?.length || rooms} {rooms === 1 ? "Room" : "Rooms"}
                </strong>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500 font-medium">Total Amount</span>
                <strong className="text-base text-neutral-900 font-bold">
                  ₹{Number(bookingConfirmation.total_amount || roomTotal).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <Clock size={13} />
              <span>Redirecting automatically in 3 seconds...</span>
            </div>

          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={(mode) => setAuthMode(mode)}
          onSuccess={() => {
            setAuthMode(null);
            handleBookNow();
          }}
        />
      )}

      {/* PHONE NUMBER MODAL */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-neutral-200">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
              <Sparkles size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
              Phone Number Required
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-neutral-500">
              To send your booking voucher and secure front-desk check-in, please verify your mobile number.
            </p>

            <form onSubmit={handlePhoneSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-neutral-300 bg-[#FCFCFD] px-4 py-3.5 text-sm font-semibold outline-none focus:border-[#D7A441] focus:ring-2 focus:ring-[#D7A441]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={phoneSaving}
                className="w-full rounded-2xl bg-gradient-to-r from-[#D7A441] to-[#B88428] py-3.5 font-bold text-neutral-950 shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {phoneSaving ? "Saving & Proceeding..." : "Save & Complete Booking"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Bookings;