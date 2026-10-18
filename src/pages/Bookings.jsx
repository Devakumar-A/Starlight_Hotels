import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
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
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coffee,
  CreditCard,
  DoorOpen,
  FileText,
  Info,
  Lock,
  Mail,
  MapPin,
  Minus,
  Percent,
  Phone,
  Plus,
  Refrigerator,
  ShieldCheck,
  ShieldUser,
  Shirt,
  Sparkles,
  Star,
  Tv,
  User,
  Users,
  Waves,
  Wifi,
  X,
} from "lucide-react";

import {
  getRoomCategoryAmenities,
  getHotels,
  getRoomCategories,
  getAvailability,
  getRoomPricing,
  calculateRoomPrice,
  createBooking,
  getHotelMedia,
} from "../services/hotelService";
import { supabase } from "../lib/supabase";

import AuthModal from "../components/AuthModal";
import Footer from "../components/Footer";


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

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "Select date";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Bookings() {
  const { hotelId: paramHotelId } = useParams();
  const [searchParams] = useSearchParams();

  const hotelId = paramHotelId || searchParams.get("hotel");
  const queryCategoryId = searchParams.get("category");

  const [selectedCategoryId, setSelectedCategoryId] = useState(queryCategoryId);
  const [availableCategories, setAvailableCategories] = useState([]);

  const checkIn = searchParams.get("checkIn") || getTomorrowDate();
  const checkOut = searchParams.get("checkOut") || getDayAfterTomorrowDate();

  const [selectedCheckIn, setSelectedCheckIn] = useState(checkIn);
  const [selectedCheckOut, setSelectedCheckOut] = useState(checkOut);

  const initialGuests =
    Number(searchParams.get("guests")) || 1;

  const [hotel, setHotel] = useState(null);
  const [category, setCategory] = useState(null);
  const categoryId = selectedCategoryId || queryCategoryId || category?.id;

  const [availableRooms, setAvailableRooms] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);

  const [priceSummary, setPriceSummary] = useState(null);

  const [occupancy, setOccupancy] = useState(null);
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState("");

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

  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState(null); // null | 'calendar' | 'guests'
  const [calendarTarget, setCalendarTarget] = useState("checkIn"); // 'checkIn' | 'checkOut'
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  const calendarContainerRef = useRef(null);
  const guestsDropdownRef = useRef(null);

  // Click outside listener for custom calendar & guests dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      const isInsideCalendar =
        calendarContainerRef.current && calendarContainerRef.current.contains(event.target);
      const isInsideGuests =
        guestsDropdownRef.current && guestsDropdownRef.current.contains(event.target);
      if (!isInsideCalendar && !isInsideGuests) {
        setActiveDropdown(null);
      }
    }
    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Calendar calculations
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const month1Date = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
  const month2Date = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset + 1, 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleCalendarDateClick = (dateStr) => {
    if (calendarTarget === "checkIn") {
      setSelectedCheckIn(dateStr);
      if (selectedCheckOut && dateStr >= selectedCheckOut) {
        setSelectedCheckOut("");
      }
      setCalendarTarget("checkOut");
    } else {
      if (!selectedCheckIn || dateStr <= selectedCheckIn) {
        setSelectedCheckIn(dateStr);
        setSelectedCheckOut("");
        setCalendarTarget("checkOut");
      } else {
        setSelectedCheckOut(dateStr);
        setActiveDropdown(null);
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
      <div className={isMobile ? "w-full max-w-[280px] mx-auto" : "w-full sm:w-[260px]"}>
        <h5 className="text-center font-semibold text-white text-xs sm:text-sm mb-3">
          {monthNames[month]} {year}
        </h5>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-medium text-white/50 mb-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-[#D7A441]">Sat</span>
          <span className="text-[#D7A441]">Sun</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const dayNum = parseInt(dateStr.split("-")[2], 10);
            const isPast = dateStr < todayStr;
            const isCheckIn = dateStr === selectedCheckIn;
            const isCheckOut = dateStr === selectedCheckOut;
            const isInRange =
              selectedCheckIn &&
              selectedCheckOut &&
              dateStr > selectedCheckIn &&
              dateStr < selectedCheckOut;

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
              <div
                key={dateStr}
                className="relative flex items-center justify-center h-8"
              >
                {/* Connecting range track between Check-in and Check-out */}
                {isCheckIn && selectedCheckOut && (
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#D7A441]/20 pointer-events-none" />
                )}
                {isCheckOut && selectedCheckIn && (
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#D7A441]/20 pointer-events-none" />
                )}
                {isInRange && (
                  <div className="absolute inset-0 bg-[#D7A441]/20 pointer-events-none" />
                )}

                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => handleCalendarDateClick(dateStr)}
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

  // Primary Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const draftStorageKey = useMemo(
    () => `starlight_booking_draft_${hotelId || "default"}_${categoryId || "default"}`,
    [hotelId, categoryId]
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  // Restore draft from sessionStorage
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(draftStorageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.guestName) setGuestName(parsed.guestName);
        if (parsed.guestEmail) setGuestEmail(parsed.guestEmail);
        if (parsed.guestPhone) setGuestPhone(parsed.guestPhone);
        if (parsed.specialRequests) setSpecialRequests(parsed.specialRequests);
      }
    } catch (err) {
      console.error("Error reading booking draft:", err);
    }
  }, [draftStorageKey]);

  // Persist draft to sessionStorage
  useEffect(() => {
    try {
      const draft = {
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
      };
      sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch (err) {
      console.error("Error saving booking draft:", err);
    }
  }, [draftStorageKey, guestName, guestEmail, guestPhone, specialRequests]);

  // Authenticated user detection & profile autofill
  useEffect(() => {
    let mounted = true;

    async function initUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from("users")
            .select("full_name, email, phone")
            .eq("id", user.id)
            .single();

          if (mounted) {
            if (profile) {
              setGuestName((prev) => prev || profile.full_name || user.user_metadata?.display_name || "");
              setGuestEmail((prev) => prev || profile.email || user.email || "");
              setGuestPhone((prev) => prev || profile.phone || user.user_metadata?.phone || "");
            } else {
              setGuestEmail((prev) => prev || user.email || "");
              setGuestName((prev) => prev || user.user_metadata?.display_name || "");
              setGuestPhone((prev) => prev || user.user_metadata?.phone || "");
            }
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("User init error:", err);
      }
    }

    initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("full_name, email, phone")
            .eq("id", user.id)
            .single();

          if (mounted) {
            if (profile) {
              setGuestName((prev) => prev || profile.full_name || user.user_metadata?.display_name || "");
              setGuestEmail((prev) => prev || profile.email || user.email || "");
              setGuestPhone((prev) => prev || profile.phone || user.user_metadata?.phone || "");
            } else {
              setGuestEmail((prev) => prev || user.email || "");
              setGuestName((prev) => prev || user.user_metadata?.display_name || "");
            }
          }
        } catch (e) {
          console.error("Profile fetch error on auth change:", e);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);


  // LOAD ROOM OCCUPANCY CONFIGURATION
  useEffect(() => {
    let cancelled = false;

    async function loadOccupancy() {
      if (!categoryId) {
        setOccupancy(null);
        return;
      }

      try {
        setOccupancyLoading(true);
        setOccupancyError("");

        const { data, error } = await supabase
          .from("room_category_occupancy")
          .select(
            "minimum_accommodation, preferred_accommodation, maximum_accommodation"
          )
          .eq("room_category_id", categoryId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          const maxOcc = Number(category?.max_occupancy) || 3;
          if (!cancelled) {
            setOccupancy({ minimum: 1, preferred: Math.min(2, maxOcc), maximum: maxOcc });
            setOccupancyError("");
            setGuests((curr) => {
              const minG = 1 * rooms;
              const maxG = maxOcc * rooms;
              return Math.min(maxG, Math.max(minG, curr || 1));
            });
          }
          return;
        }

        let minimum = Number(data.minimum_accommodation);
        let preferred = Number(data.preferred_accommodation);
        let maximum = Number(data.maximum_accommodation);

        const fallbackMin = Number(category?.min_occupancy) || 1;
        const fallbackMax = Number(category?.max_occupancy) || 3;

        if (!Number.isInteger(minimum) || minimum < 1) {
          minimum = fallbackMin;
        }
        if (!Number.isInteger(maximum) || maximum < minimum) {
          maximum = Math.max(minimum, fallbackMax);
        }
        if (
          !Number.isInteger(preferred) ||
          preferred < minimum ||
          preferred > maximum
        ) {
          preferred = Math.min(maximum, Math.max(minimum, 2));
        }

        if (!cancelled) {
          setOccupancy({ minimum, preferred, maximum });
          setGuests((curr) => {
            const minG = minimum * rooms;
            const maxG = maximum * rooms;
            return Math.min(maxG, Math.max(minG, curr || minimum));
          });
        }
      } catch (error) {
        if (!cancelled) {
          setOccupancy(null);
          setOccupancyError(
            error.message || "Unable to load occupancy limits."
          );
        }
      } finally {
        if (!cancelled) {
          setOccupancyLoading(false);
        }
      }
    }

    loadOccupancy();

    return () => {
      cancelled = true;
    };
  }, [categoryId, category]);


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
  // LOAD HOTEL + CATEGORY
  // --------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadHotelAndCategory() {
      try {
        setLoading(true);
        setError("");

        if (!hotelId || !categoryId) {
          throw new Error("Hotel or room category information is missing.");
        }

        const hotels = await getHotels();
        const selectedHotel = hotels.find(
          (item) => item.id === hotelId
        );

        if (!selectedHotel) {
          throw new Error("Hotel not found.");
        }

        const categories = await getRoomCategories(hotelId);
        const selectedCategory = categories.find(
          (item) => item.id === categoryId
        );

        if (!selectedCategory) {
          throw new Error("Room category not found.");
        }

        if (!cancelled) {
          setHotel(selectedHotel);
          setCategory(selectedCategory);
          setAvailableCategories(categories);

          try {
            let resolvedImage = null;

            // 1. Check if there is specific room category image
            if (categoryId) {
              const { data: catMedia } = await supabase
                .from("media")
                .select("cloudinary_url")
                .eq("room_category_id", categoryId)
                .eq("media_type", "image")
                .order("sort_order", { ascending: true })
                .limit(1);

              if (catMedia && catMedia.length > 0 && catMedia[0].cloudinary_url) {
                resolvedImage = catMedia[0].cloudinary_url;
              }
            }

            // 2. Fallback to hotel primary media
            if (!resolvedImage) {
              const media = await getHotelMedia(hotelId);
              const firstImage =
                media?.find((item) => item.media_type === "image")?.cloudinary_url ||
                media?.[0]?.cloudinary_url;

              if (firstImage) {
                resolvedImage = firstImage;
              }
            }

            if (!cancelled && resolvedImage) {
              setHotelImage(resolvedImage);
            }
          } catch (e) {
            console.warn("Hotel media load error:", e);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("HOTEL/CATEGORY ERROR:", err);
          setError(err.message || "Unable to load booking details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHotelAndCategory();

    return () => {
      cancelled = true;
    };
  }, [hotelId, categoryId]);


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
  // LOAD PRICE SUMMARY FROM BACKEND
  // --------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadPriceSummary() {
      if (!categoryId || !selectedCheckIn || !selectedCheckOut || nights <= 0) {
        setPriceSummary(null);
        return;
      }

      try {
        setPricingLoading(true);
        setPricingError("");

        const result = await calculateRoomPrice({
          roomCategoryId: categoryId,
          checkInDate: selectedCheckIn,
          checkOutDate: selectedCheckOut,
          numberOfGuests: guests,
          roomsRequested: rooms,
          defaultPrice: Number(category?.default_price) || 0,
        });

        if (!cancelled) {
          setPriceSummary(result);
        }
      } catch (err) {
        console.error("PRICE SUMMARY ERROR:", {
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
        });

        if (!cancelled) {
          setPriceSummary(null);
          setPricingError("Unable to calculate booking price.");
        }
      } finally {
        if (!cancelled) {
          setPricingLoading(false);
        }
      }
    }

    loadPriceSummary();

    return () => {
      cancelled = true;
    };
  }, [
    categoryId,
    selectedCheckIn,
    selectedCheckOut,
    guests,
    rooms,
    nights,
    currentUser,
  ]);
  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const roomPrices = priceSummary?.room_prices || [];
  const guestCounts = priceSummary?.guest_counts || [];

  const subtotal = Number(priceSummary?.subtotal) || 0;
  const gstAmount = Number(priceSummary?.gst_amount) || 0;
  const signInDiscount = Number(priceSummary?.sign_in_discount) || 0;
  const finalTotal = Number(priceSummary?.final_total) || 0;

  const roomTotal = finalTotal;

  const minimumGuestsPerRoom = occupancy?.minimum ?? (Number(category?.min_occupancy) || 1);
  const maxGuestsPerRoom = occupancy?.maximum ?? (Number(category?.max_occupancy) || 3);

  const minimumGuests = minimumGuestsPerRoom * rooms;
  const maximumGuests = maxGuestsPerRoom * rooms;

  const filteredRooms = availableCategories.filter((cat) => {
    const maxOccupancy = Number(cat?.max_occupancy) || 3;
    const minOccupancy = Number(cat?.min_occupancy) || 1;

    return (
      guests >= minOccupancy * rooms &&
      guests <= maxOccupancy * rooms
    );
  });

  // --------------------------------------------------
  // ROOM CONTROLS
  // --------------------------------------------------

  function decreaseRooms() {
    setRooms((current) => {
      const newValue = Math.max(1, current - 1);
      const newMaximum = maxGuestsPerRoom * newValue;
      const newMinimum = minimumGuestsPerRoom * newValue;

      setGuests((currentGuests) =>
        Math.min(
          newMaximum,
          Math.max(newMinimum, currentGuests)
        )
      );

      return newValue;
    });
  }

  function increaseRooms() {
    if (rooms >= availableRooms) return;

    const newRooms = rooms + 1;

    setRooms(newRooms);

    setGuests((currentGuests) =>
      Math.max(
        currentGuests,
        minimumGuestsPerRoom * newRooms
      )
    );
  }

  function changeGuests(value) {
    const newGuests = Number(value);

    if (
      Number.isInteger(newGuests) &&
      newGuests >= minimumGuests &&
      newGuests <= maximumGuests
    ) {
      setGuests(newGuests);
    }
  }

  const handleBookNow = async () => {
    setBookingError("");

    if (!guestName.trim()) {
      setBookingError("Please enter the primary guest's full name.");
      return;
    }

    const cleanPhone = guestPhone.trim();

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setBookingError("Please enter a valid mobile number.");
      return;
    }

    if (
      guestEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())
    ) {
      setBookingError("Please enter a valid email address.");
      return;
    }
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      // Allow guests when there is no active login session.
      if (error && error.name !== "AuthSessionMissingError") {
        throw error;
      }

      setCurrentUser(user || null);

      if (user) {
        // Update the signed-in user's profile.
        const { error: updateError } = await supabase
          .from("users")
          .update({
            phone: cleanPhone,
            full_name: guestName.trim(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;
      }

      // Continue for both guests and signed-in customers.
      await completeBooking();
    } catch (error) {
      console.error("BOOKING ERROR:", error);
      setBookingError(error?.message || "Unable to continue booking.");
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
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || null,
        guestAddress: null,
      });

      if (!result) {
        throw new Error("Booking could not be created.");
      }

      setBookingConfirmation(result);

      try {
        sessionStorage.removeItem(draftStorageKey);
      } catch (error) {
        console.warn("Could not clear booking draft:", error);
      }

      await refreshAvailability();
    } catch (error) {
      console.error("BOOKING ERROR:", error);
      const message = error?.message || "";

      if (message.includes("Not enough rooms")) {
        setBookingError("Not enough rooms available for the selected dates.");
      } else if (message.includes("just booked")) {
        setBookingError("The selected room was just booked. Please try again.");
      } else {
        setBookingError(message || "Unable to complete booking.");
      }
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

  // --------------------------------------------------
  // MAIN LUXURY BOOKING INTERFACE
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-neutral-900 flex flex-col justify-between selection:bg-[#D7A441]/20">
      <main className="flex-1 pb-16">

        {/* =================================================
          TOP NAVIGATION & PROPERTY BANNER
        ================================================= */}
        <header className="border-b border-[#EAE6DF] bg-white sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

            {/* Back Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.state && window.history.state.idx > 0) {
                      navigate(-1);
                    } else {
                      navigate(`/book-hotels?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`);
                    }
                  }}
                  aria-label="Return to previous page"
                  title="Return to previous page"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" />
                </button>

                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400 min-w-0">
                  <Link to="/" className="hover:text-neutral-700 transition-colors shrink-0">Home</Link>
                  <span>/</span>
                  <Link to="/book-hotels" className="hover:text-neutral-700 transition-colors shrink-0">Hotels</Link>
                  <span>/</span>
                  <span className="text-neutral-600 shrink-0">{hotel.city}</span>
                  <span>/</span>
                  <span className="text-neutral-800 font-medium truncate max-w-[130px] sm:max-w-[200px]">
                    {hotel.hotel_name}
                  </span>
                  <span>/</span>
                  <span className="text-[#B88428] font-semibold shrink-0">Reservation</span>
                </nav>
              </div>

              {/* Security Pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Verified Direct Booking</span>
              </div>
            </div>

            {/* Property Headline */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pt-1">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#B88428]">
                  Starlight Luxury Stays
                </span>
                <h1 className="mt-0.5 text-2xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-900">
                  {hotel.hotel_name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
                  <MapPin size={14} className="shrink-0 text-[#D7A441]" />
                  <span>
                    {hotel.address ? `${hotel.address}, ` : ""}
                    <strong className="text-neutral-700 font-medium">{hotel.city}</strong>
                  </span>
                </p>
              </div>
            </div>


          </div>
        </header>

        {/* =================================================
          MAIN BOOKING WORKFLOW
        ================================================= */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

          {/* 1. ACCOMMODATION OVERVIEW CARD */}
          <section
            aria-label="Selected Room Category"
            className="rounded-2xl border border-[#EAE6DF] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Room Image */}
              <div className="relative md:w-80 lg:w-96 shrink-0 bg-neutral-100 min-h-[200px] md:min-h-full overflow-hidden">
                {hotelImage ? (
                  <img
                    src={hotelImage}
                    alt={category.category_name}
                    className="h-full w-full object-cover min-h-[200px] transition-transform duration-500 hover:scale-105"
                    onError={() => setHotelImage(null)}
                  />
                ) : (
                  <div className="flex h-full w-full min-h-[200px] flex-col items-center justify-center bg-[#171922] text-white p-6 text-center">
                    <BedDouble size={36} className="text-[#D7A441] mb-2 stroke-1" />
                    <p className="text-sm font-serif font-medium">{category.category_name}</p>
                    <p className="text-xs text-neutral-400 mt-1">{hotel.hotel_name}</p>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-black/70 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase border border-white/20">
                    Selected Sanctuary
                  </span>
                </div>
              </div>

              {/* Room Information & Controls */}
              <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88428]">
                      Confirmed Room Category
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100/80 px-2.5 py-0.5 rounded-full border border-neutral-200/60 font-medium">
                      <Users size={13} className="text-neutral-500" />
                      Up to {category.max_occupancy || 1} {category.max_occupancy === 1 ? "Guest" : "Guests"} per room
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl sm:text-2xl font-serif font-normal text-neutral-900 tracking-tight">
                    {category.category_name}
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl">
                    {category.description || "Thoughtfully appointed guest sanctuary featuring bespoke Starlight bedding, dedicated workspace, and signature hospitality touches for a restorative stay."}
                  </p>

                  {/* Room Switcher Pills */}
                  {availableCategories.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                        Switch Category
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {availableCategories.map((cat) => {
                          const isSelected = category?.id === cat.id;
                          const fitsParty =
                            guests >= (Number(cat?.min_occupancy) || 1) * rooms &&
                            guests <= (Number(cat?.max_occupancy) || 3) * rooms;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategoryId(cat.id);
                                setCategory(cat);
                              }}
                              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                                  ? "bg-[#171922] text-white shadow-xs"
                                  : fitsParty
                                    ? "bg-amber-50 text-[#966A1E] hover:bg-amber-100/80 border border-amber-200/80"
                                    : "bg-neutral-100/90 text-neutral-700 hover:bg-neutral-200/90 border border-neutral-200/60"
                                }`}
                            >
                              <span>{cat.category_name}</span>
                              {fitsParty && !isSelected && (
                                <span className="text-[10px] text-[#D7A441] font-bold">• Fits</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>


          {/* 2. TOTAL BOOKING SUMMARY GRID (Directly Below Accommodation Details) */}
          <section
            aria-label="Booking Summary and Guest Contact"
            className="rounded-2xl border border-[#EAE6DF] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.03)] relative"
          >
            {/* Header bar */}
            <div className="rounded-t-2xl border-b border-[#EAE6DF] bg-[#FAF9F6] px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-medium text-neutral-900">
                  Reservation Summary &amp; Guest Contact
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Confirm your stay itinerary and primary contact for front-desk check-in
                </p>
              </div>

              <div className="flex items-baseline gap-2 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Total Payable:
                </span>
                <span className="text-lg sm:text-xl font-bold font-serif text-neutral-900">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Two-Column Grid: Left = Stay Itinerary & Primary Guest; Right = Folio & CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EAE6DF]">

              {/* LEFT SUB-GRID: Dates & Rooms/Occupancy */}
              <div className="lg:col-span-6 p-5 sm:p-7 space-y-6">

                {/* Sub-section: Stay Dates */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[#D7A441]" />
                      Stay Itinerary
                    </h4>
                    <span className="text-xs font-medium text-[#B88428] bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 rounded-md">
                      {nights} {nights === 1 ? "Night" : "Nights"} Stay
                    </span>
                  </div>

                  {/* Custom Calendar Trigger Cards & Dropdown Container */}
                  <div ref={calendarContainerRef} className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Check-In Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarTarget("checkIn");
                          setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkIn" ? null : "calendar");
                        }}
                        className={`group relative flex items-center justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${activeDropdown === "calendar" && calendarTarget === "checkIn"
                            ? "border-[#D7A441] bg-white ring-2 ring-[#D7A441]/25 shadow-xs"
                            : "border-neutral-200/90 bg-[#FAFAFA] hover:border-[#D7A441]/60 hover:bg-white"
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Check-In
                            </span>
                            <span className="text-[10px] text-neutral-400">From 12:00 PM</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <CalendarDays size={16} className="text-[#D7A441] shrink-0" />
                            <span className="text-sm font-semibold text-neutral-900 truncate">
                              {formatDateDisplay(selectedCheckIn)}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-neutral-400 transition-transform ml-2 shrink-0 ${activeDropdown === "calendar" && calendarTarget === "checkIn" ? "rotate-180 text-[#B88428]" : ""
                            }`}
                        />
                      </button>

                      {/* Check-Out Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarTarget("checkOut");
                          setActiveDropdown(activeDropdown === "calendar" && calendarTarget === "checkOut" ? null : "calendar");
                        }}
                        className={`group relative flex items-center justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${activeDropdown === "calendar" && calendarTarget === "checkOut"
                            ? "border-[#D7A441] bg-white ring-2 ring-[#D7A441]/25 shadow-xs"
                            : "border-neutral-200/90 bg-[#FAFAFA] hover:border-[#D7A441]/60 hover:bg-white"
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Check-Out
                            </span>
                            <span className="text-[10px] text-neutral-400">By 11:00 AM</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <CalendarDays size={16} className="text-[#D7A441] shrink-0" />
                            <span className="text-sm font-semibold text-neutral-900 truncate">
                              {formatDateDisplay(selectedCheckOut)}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-neutral-400 transition-transform ml-2 shrink-0 ${activeDropdown === "calendar" && calendarTarget === "checkOut" ? "rotate-180 text-[#B88428]" : ""
                            }`}
                        />
                      </button>
                    </div>
                    {/* FLOATING CALENDAR POPOVER (HOME SEARCH LUXURY DESIGN WITH SQUARE DATES) */}
                    {activeDropdown === "calendar" && (
                      <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2.5 w-full sm:w-[600px] max-w-[calc(100vw-32px)] rounded-3xl border border-white/15 bg-[#0D0E12] p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-50 text-left animate-in fade-in duration-200">
                        {/* Calendar Header matching Home Search */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                          <button
                            type="button"
                            disabled={calendarMonthOffset <= 0}
                            onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Previous month"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          <div className="rounded-full border border-[#D7A441]/40 bg-[#D7A441]/10 px-3.5 sm:px-4 py-1 text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.2em] text-[#D7A441] uppercase">
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

                        {/* Dual Month Calendar View */}
                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                          {renderMonthCalendar(month1Date)}
                          <div className="hidden sm:block w-px bg-white/10" />
                          <div className="hidden sm:block">
                            {renderMonthCalendar(month2Date)}
                          </div>
                        </div>

                        {/* Calendar Footer */}
                        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCheckIn("");
                              setSelectedCheckOut("");
                              setCalendarTarget("checkIn");
                            }}
                            className="text-xs font-semibold text-white/50 hover:text-white transition cursor-pointer"
                          >
                            Clear dates
                          </button>

                          <span className="text-white/70 text-xs font-medium">
                            {selectedCheckIn && selectedCheckOut
                              ? `${nights} ${nights === 1 ? "night" : "nights"} stay`
                              : calendarTarget === "checkIn"
                                ? "Select check-in date"
                                : "Select check-out date"}
                          </span>

                          <button
                            type="button"
                            onClick={() => setActiveDropdown(null)}
                            className="rounded-xl bg-[#D7A441] text-neutral-950 px-4 py-1.5 font-bold text-xs hover:bg-[#E5B555] shadow-xs transition-colors cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-section: Rooms & Guests */}
                <div className="border-t border-neutral-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-1.5">
                    <Users size={14} className="text-[#D7A441]" />
                    Rooms &amp; Occupancy
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Professional Guests Dropdown */}
                    <div ref={guestsDropdownRef} className="relative">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Total Guests
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === "guests" ? null : "guests")}
                        className={`group w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${activeDropdown === "guests"
                            ? "border-[#D7A441] bg-white ring-2 ring-[#D7A441]/25 shadow-xs"
                            : "border-neutral-200/90 bg-[#FAFAFA] hover:border-[#D7A441]/60 hover:bg-white"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D7A441]/10 text-[#B88428]">
                            <Users size={16} />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900 leading-tight">
                              {guests} {guests === 1 ? "Guest" : "Guests"}
                            </span>
                            <span className="block text-[10px] text-neutral-400 mt-0.5">
                              Allowed: {minimumGuests}–{maximumGuests} for {rooms} {rooms === 1 ? "room" : "rooms"}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-neutral-400 group-hover:text-[#B88428] transition-transform ml-2 shrink-0 ${activeDropdown === "guests" ? "rotate-180 text-[#B88428]" : ""
                            }`}
                        />
                      </button>

                      {/* Professional Guest Dropdown Popover */}
                      {activeDropdown === "guests" && (
                        <div className="absolute left-0 top-full mt-2 w-full sm:w-[340px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 text-left animate-in fade-in duration-150">
                          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                                <Users size={14} className="text-[#D7A441]" />
                                Guest Selection
                              </h5>
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                For {rooms} {rooms === 1 ? "room" : "rooms"} ({minimumGuests}–{maximumGuests} guests permitted)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveDropdown(null)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
                              aria-label="Close guest dropdown"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          {/* Guest Stepper */}
                          <div className="py-4 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                              <span className="text-sm font-semibold text-neutral-900 block">Total Guests</span>
                              <span className="text-[11px] text-neutral-400">Adults &amp; Children included</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={guests <= minimumGuests}
                                onClick={() => changeGuests(guests - 1)}
                                aria-label="Decrease guest count"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="text-base font-bold text-neutral-900 min-w-[24px] text-center">
                                {guests}
                              </span>
                              <button
                                type="button"
                                disabled={guests >= maximumGuests}
                                onClick={() => changeGuests(guests + 1)}
                                aria-label="Increase guest count"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Quick selection options */}
                          <div className="pt-3.5 pb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                              Quick Select
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(
                                { length: maximumGuests - minimumGuests + 1 },
                                (_, index) => minimumGuests + index
                              ).map((count) => {
                                const isSelected = guests === count;
                                return (
                                  <button
                                    key={count}
                                    type="button"
                                    onClick={() => {
                                      changeGuests(count);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isSelected
                                        ? "bg-[#D7A441] text-neutral-950 shadow-xs"
                                        : "bg-neutral-100/80 text-neutral-700 hover:bg-neutral-200"
                                      }`}
                                  >
                                    <span>{count} {count === 1 ? "Guest" : "Guests"}</span>
                                    {isSelected && <Check size={12} className="stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Additional Guest Charges Warning - Displays when maximum guest count is reached */}
                          {guests >= maximumGuests && (
                            <div className="mt-3.5 rounded-xl bg-[#FAF5EC] border border-[#EEDDB8] p-3 text-[#8C6214] animate-in fade-in duration-200 shadow-2xs">
                              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#8C6214]">
                                <Info size={15} className="shrink-0 text-[#966A1E]" />
                                <span>Additional Guest Charges</span>
                              </div>
                              <p className="mt-1 text-[11px] text-[#8C6214]/90 pl-5 leading-relaxed">
                                Additional charges apply for extra guests as per hotel policy.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Professional Room Count Stepper */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Number of Rooms
                      </label>
                      <div className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-[#FAFAFA] p-2 hover:border-[#D7A441]/60 transition-all">
                        <div className="flex items-center gap-2.5 pl-1.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D7A441]/10 text-[#B88428] shrink-0">
                            <BedDouble size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-neutral-900 block leading-tight truncate">
                              {rooms} {rooms === 1 ? "Room" : "Rooms"}
                            </span>
                            <span className="text-[10px] text-neutral-400 block truncate">
                              Up to {maxGuestsPerRoom} guests/room
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-neutral-200/90 shadow-2xs shrink-0">
                          <button
                            type="button"
                            onClick={decreaseRooms}
                            disabled={rooms <= 1}
                            aria-label="Decrease room count"
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-bold text-neutral-900 px-1.5 min-w-[18px] text-center">
                            {rooms}
                          </span>
                          <button
                            type="button"
                            onClick={increaseRooms}
                            disabled={rooms >= availableRooms || availableRooms <= 0}
                            aria-label="Increase room count"
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${availableRooms > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                          {availabilityLoading ? "Checking inventory..." : `${availableRooms} of ${totalRooms} rooms available`}
                        </span>
                        {rooms >= availableRooms && availableRooms > 0 && (
                          <span className="text-amber-600 font-medium text-[10px]">Max available reached</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Guest Charges Notice when maximum guests reached */}
                  {guests >= maximumGuests && (
                    <div className="mt-3 rounded-xl bg-[#FAF5EC] border border-[#EEDDB8] p-3 text-[#8C6214] animate-in fade-in duration-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-[#8C6214]">
                        <Info size={14} className="shrink-0 text-[#966A1E]" />
                        <span>Additional Guest Charges</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#8C6214]/90 pl-5 leading-relaxed">
                        Additional charges apply for extra guests as per hotel policy.
                      </p>
                    </div>
                  )}

                  {occupancyError && (
                    <div className="mt-2.5 rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700 flex items-center gap-1.5">
                      <AlertCircle size={14} className="shrink-0 text-red-600" />
                      <span>{occupancyError}</span>
                    </div>
                  )}
                  {availabilityError && (
                    <div className="mt-2.5 rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700 flex items-center gap-1.5">
                      <AlertCircle size={14} className="shrink-0 text-red-600" />
                      <span>{availabilityError}</span>
                    </div>
                  )}
                </div>

                {/* Sub-section: PRIMARY GUEST INFORMATION (Moved to Left Side) */}
                <div className="border-t border-neutral-100 pt-5">
                  <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 relative overflow-hidden shadow-xs">
                    {/* Decorative golden corner swoop */}
                    <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-bl from-amber-200/60 via-amber-100/30 to-transparent" />
                    <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 border-t-2 border-r-2 border-amber-300/50 rounded-tr-2xl" />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF5EC] border border-[#EFE5D3] text-[#B88428] shrink-0 shadow-2xs">
                        <User size={20} className="text-[#B88428]" />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900 font-sans">
                        PRIMARY GUEST INFORMATION
                      </h4>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="guest-full-name" className="block text-xs font-semibold text-neutral-800 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-xl border border-neutral-200/90 bg-[#FDFCFB] hover:border-neutral-300 focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition-all">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                            <User size={16} />
                          </div>
                          <input
                            id="guest-full-name"
                            type="text"
                            placeholder="e.g. Vikram Malhotra"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            required
                            className="w-full bg-transparent pl-10 pr-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-medium"
                          />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label htmlFor="guest-phone-number" className="block text-xs font-semibold text-neutral-800 mb-1.5">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-xl border border-neutral-200/90 bg-[#FDFCFB] hover:border-neutral-300 focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition-all">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                            <Phone size={16} />
                          </div>
                          <input
                            id="guest-phone-number"
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            required
                            className="w-full bg-transparent pl-10 pr-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-[11px] text-neutral-500 leading-relaxed relative z-10">
                      Booking voucher, reservation SMS, and front-desk check-in credentials will be registered to this contact.
                    </p>
                  </div>
                </div>

              </div>

              {/* RIGHT SUB-GRID: TARIFF, FOLIO & PAYMENT SETTLEMENT */}
              <div className="lg:col-span-6 p-5 sm:p-6 lg:p-7 space-y-4 bg-[#FAF9F6] lg:sticky lg:top-24 self-start">

                {/* 1. TARIFF & FOLIO SUMMARY CARD */}
                <div className="rounded-2xl border border-amber-200/60 bg-[#FCF9F3]/90 p-4 sm:p-6 space-y-4 shadow-xs">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#F5EEDF] border border-[#E8DAC2] text-[#B88428] shrink-0 shadow-2xs">
                        <FileText size={18} className="text-[#B88428]" />
                      </div>
                      <h4 className="text-xs sm:text-base font-bold uppercase tracking-wider text-neutral-900 font-sans leading-tight">
                        TARIFF &amp; FOLIO SUMMARY
                      </h4>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 bg-amber-100/50 border border-amber-200/50 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                      INR (₹)
                    </span>
                  </div>

                  {/* Inner White Breakdown Card */}
                  <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 sm:p-5 space-y-3.5 text-xs sm:text-sm shadow-2xs">
                    {/* Individual Room Rates with Bed icon */}
                    {roomPrices.map((price, index) => (
                      <div key={index} className="flex items-start sm:items-center justify-between gap-2 text-neutral-700">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                          <BedDouble size={15} className="text-neutral-400 shrink-0" />
                          <span className="font-medium text-neutral-800">Room {index + 1}</span>
                          <span className="text-xs text-neutral-400">
                            ({guestCounts[index]} {guestCounts[index] === 1 ? "guest" : "guests"})
                          </span>
                        </div>
                        <div className="text-right shrink-0 whitespace-nowrap">
                          <span className="font-bold text-neutral-900">
                            ₹{(Number(price) / Math.max(nights, 1)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] font-normal text-neutral-400"> / night</span>
                        </div>
                      </div>
                    ))}

                    {/* Stay Duration with Calendar icon */}
                    <div className="flex items-center justify-between gap-2 text-neutral-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <CalendarDays size={15} className="text-neutral-400 shrink-0" />
                        <span>Stay Duration</span>
                      </div>
                      <span className="font-bold text-neutral-900 shrink-0 text-right whitespace-nowrap">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                    </div>

                    {/* Room Subtotal with FileText icon */}
                    <div className="flex items-center justify-between gap-2 text-neutral-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <FileText size={15} className="text-neutral-400 shrink-0" />
                        <span>Room Subtotal</span>
                      </div>
                      <span className="font-bold text-neutral-900 shrink-0 text-right whitespace-nowrap">
                        ₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Goods & Services Tax (5% GST) with Percent icon */}
                    <div className="flex items-start sm:items-center justify-between gap-2 text-neutral-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <Percent size={15} className="text-neutral-400 shrink-0" />
                        <span className="leading-snug">Goods &amp; Services Tax (5% GST)</span>
                      </div>
                      <span className="font-bold text-neutral-900 shrink-0 text-right whitespace-nowrap">
                        ₹{gstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Member Privilege Savings Banner with Star icon */}
                    {signInDiscount > 0 && (
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50/90 border border-emerald-200/80 px-2.5 sm:px-3 py-2 text-emerald-800">
                        <div className="flex items-center gap-1.5 sm:gap-2 font-medium min-w-0 flex-1">
                          <Star size={15} className="text-emerald-600 fill-emerald-600 shrink-0" />
                          <span className="leading-snug">Member Privilege Savings (10%)</span>
                        </div>
                        <span className="font-bold text-emerald-800 shrink-0 text-right whitespace-nowrap pl-2">
                          −₹{signInDiscount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>

                  {pricingError && (
                    <div className="rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700">
                      {pricingError}
                    </div>
                  )}
                </div>

                {/* 2. TOTAL PAYABLE GOLDEN CARD */}
                <div className="rounded-2xl border border-[#E9D9B8] bg-gradient-to-r from-[#F9F3E5] via-[#FFFDF9] to-[#F7EDD7] p-4 sm:p-5 flex items-center justify-between gap-3 relative overflow-hidden shadow-xs">
                  {/* Subtle golden corner ambient ribbons */}
                  <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-tr from-amber-300/30 to-transparent blur-xs" />
                  <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-bl from-amber-200/30 to-transparent blur-xs" />

                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 z-10 flex-1">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#EFE3C8] border border-[#DECDA6] text-[#8C6218] shrink-0 shadow-2xs">
                      <CreditCard size={18} className="text-[#8C6218]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 font-sans leading-tight">
                        Total Payable
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5 leading-tight">
                        Inclusive of all room tariffs and GST
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 z-10 pl-2">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#4A3511] whitespace-nowrap block">
                      ₹{finalTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* 3. COMPLETE RESERVATION ACTION BUTTON */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBookNow}
                    disabled={
                      bookingLoading || occupancyLoading || !occupancy || !!occupancyError ||
                      availableRooms <= 0 ||
                      rooms > availableRooms ||
                      nights <= 0 ||
                      pricingLoading || !priceSummary
                    }
                    className="w-full rounded-xl bg-[#171922] hover:bg-black active:scale-[0.99] text-white py-3.5 sm:py-4 px-6 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Confirming Reservation...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Reservation</span>
                        <ChevronRight size={17} className="text-[#D7A441]" />
                      </>
                    )}
                  </button>

                  {bookingError && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700">
                      <AlertCircle size={15} className="shrink-0 text-red-600" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {/* Guaranteed Trust & Terms - Guarantee shield directly inline before Guaranteed */}
                  <div className="mt-3.5 text-center space-y-1.5">
                    <p className="text-xs text-neutral-600 max-w-sm mx-auto text-center leading-snug">
                      <ShieldCheck size={14} className="inline-block -mt-0.5 mr-1 text-neutral-500 align-middle shrink-0" />
                      <span>Guaranteed reservation with front-desk settlement.</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 max-w-sm mx-auto leading-normal">
                      By completing this booking, you agree to Starlight's{" "}
                      <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-neutral-600 underline hover:text-neutral-900">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-neutral-600 underline hover:text-neutral-900">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </section>


          {/* 3. ROOM AMENITIES & INCLUSIONS */}
          <section
            aria-label="Room Inclusions and Amenities"
            className="rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-medium text-neutral-900">
                  Room Inclusions &amp; Amenities
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Complementary conveniences provided in {category.category_name}
                </p>
              </div>

              {amenities.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllAmenities((val) => !val)}
                  className="text-xs font-semibold text-[#B88428] hover:text-[#976a1c] cursor-pointer"
                >
                  {showAllAmenities ? "Show fewer" : `View all (${amenities.length})`}
                </button>
              )}
            </div>

            {amenities.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-2">Standard Starlight guest room amenities included.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {(showAllAmenities ? amenities : amenities.slice(0, 8)).map((amenity) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  return (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-[#FAFAFA] p-3 text-xs text-neutral-700 transition-colors hover:border-[#D7A441]/40 hover:bg-amber-50/20"
                    >
                      <Icon size={16} className="text-[#D7A441] shrink-0" />
                      <span className="font-medium truncate">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>


          {/* 4. ESSENTIAL HOSPITALITY POLICIES & GUIDELINES */}
          <section
            aria-label="Hotel Guidelines"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-xs mb-1.5">
                <Clock size={16} className="text-[#D7A441] shrink-0" />
                <span>Check-in &amp; Check-out</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Check-in starts from <strong>12:00 PM</strong>. Check-out is scheduled by <strong>11:00 AM</strong>. Early check-in subject to front-desk availability.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-xs mb-1.5">
                <ShieldCheck size={16} className="text-[#D7A441] shrink-0" />
                <span>Guest Verification</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                A valid government-issued photo ID (Aadhaar, Passport, Voter ID or Driver's License) is required for each guest upon physical check-in.
              </p>
            </div>
          </section>

        </div>

      </main>

      {/* GLOBAL FOOTER */}
      < Footer />

      {/* =================================================
        BOOKING CONFIRMATION MODAL (Yellow / Pending Design)
      ================================================= */}
      {
        bookingConfirmation && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-7 sm:p-8 text-center shadow-2xl border border-neutral-200">

              {/* Close 'X' Button */}
              <button
                type="button"
                onClick={() => setBookingConfirmation(null)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Yellow / Amber Indicator */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-[#B88428] ring-8 ring-amber-100/70 shadow-sm">
                <Clock size={40} className="stroke-[2.2] text-[#B88428]" />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 font-serif">
                Reservation Request Sent!
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Your reservation request for <strong className="text-neutral-900">{hotel.hotel_name}</strong> has been submitted. Please wait for confirmation.
              </p>

              {/* Yellow Status Info Notice */}
              <div className="mt-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 text-left">
                <Sparkles size={16} className="text-[#B88428] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Pending Confirmation:</strong> To view the real-time status of your booking, please check the <strong>My Bookings</strong> page.
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 p-5 text-left text-xs sm:text-sm space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-[#B88428] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                    {bookingConfirmation.booking_reference}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Booking Status</span>
                  <span className="font-semibold text-[#B88428] bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200 text-xs">
                    Pending Confirmation
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

              {/* Action Buttons */}

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setBookingConfirmation(null);
                    navigate("/my-bookings");
                  }}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] text-neutral-950 font-bold py-3.5 text-sm sm:text-base transition-all shadow-md cursor-pointer"
                >
                  Check Status in My Bookings →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setBookingConfirmation(null)}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] text-neutral-950 font-bold py-3.5 text-sm sm:text-base transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              )}


              <button
                type="button"
                onClick={() => setBookingConfirmation(null)}
                className="mt-2.5 w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                Close Window
              </button>

            </div>
          </div>
        )
      }

      {/* AUTH MODAL */}
      {
        authMode && (
          <AuthModal
            mode={authMode}
            initialEmail={guestEmail}
            initialPhone={guestPhone}
            initialName={guestName}
            onClose={() => setAuthMode(null)}
            onSwitch={(mode) => setAuthMode(mode)}
            onSuccess={async (loggedInUser) => {
              setAuthMode(null);
              const {
                data: { session },
              } = await supabase.auth.getSession();

              const activeUser = loggedInUser || session?.user;
              if (activeUser && session) {
                setCurrentUser(activeUser);
                if (guestPhone) {
                  try {
                    await supabase
                      .from("users")
                      .update({
                        phone: guestPhone.trim(),
                        full_name: guestName.trim(),
                      })
                      .eq("id", activeUser.id);
                  } catch (e) {
                    console.warn("Phone sync error:", e);
                  }
                }
                await completeBooking();
              }
            }}
          />
        )
      }

      {/* PHONE NUMBER MODAL */}
      {
        phoneModalOpen && (
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
        )
      }

    </div >
  );
}

export default Bookings;