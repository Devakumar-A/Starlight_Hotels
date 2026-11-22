import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AirVent,
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BatteryCharging,
  BedDouble,
  BriefcaseMedical,
  Car,
  CalendarDays,
  Cctv,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  DoorOpen,
  FileText,
  Info,
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
  getHotels,
  getHotelMedia,
  getRoomCategories,
  getRoomCategoryMedia,
  getRoomCategoryAmenities,
  getHotelAmenities,
  getAvailabilityV2,
  calculateHourlyRoomPrice,
  getCategoryOccupancyLimits,
} from "../../services/hotelService";
import { supabase } from "../../lib/supabase";
import AuthModal from "../../components/AuthModal";
import Footer from "../../components/Footer";
import { trackEvent, trackAdsConversion } from "../../lib/analytics";

// =========================================================
// TAX & MEMBER OFFER
// ---------------------------------------------------------
// Rates mirror the only GST / sign-in logic in the project:
// calculateRoomPrice() in hotelService.js (5% GST on the room subtotal,
// 10% member saving on the subtotal when signed in, total = subtotal +
// GST - saving). calculateHourlyRoomPrice() returns only the hourly
// package price, so these two rates are applied to it here, once, in
// getHourlyPriceSummary(). Confirm they are the intended hourly rates.
// =========================================================
const GST_RATE = 0.05;
const MEMBER_DISCOUNT_RATE = 0.1;

function getHourlyPriceSummary({ ratePerRoom, rooms, guests, signedIn }) {
  if (!(ratePerRoom > 0)) return null;
  const roomCount = Math.max(1, Number(rooms) || 1);
  const guestCount = Math.max(1, Number(guests) || 1);
  const base = Math.floor(guestCount / roomCount);
  const extra = guestCount % roomCount;
  const guestCounts = Array.from({ length: roomCount }, (_, i) => base + (i < extra ? 1 : 0));

  const subtotal = ratePerRoom * roomCount;
  const gstAmount = Math.round(subtotal * GST_RATE);
  const signInDiscount = signedIn ? Math.round(subtotal * MEMBER_DISCOUNT_RATE) : 0;
  const finalTotal = Math.max(0, subtotal + gstAmount - signInDiscount);

  return { ratePerRoom, roomCount, guestCounts, subtotal, gstAmount, signInDiscount, finalTotal };
}

// =========================================================
// HOURLY BOOKING CREATION
// ---------------------------------------------------------
// hotelService.js only exposes createBooking(), which takes a
// check-in / check-out DATE range (a full-day booking). It has no
// hourly variant, and calling it would record an overnight stay, so
// hourly submission goes through this single function.
// HOURLY_BOOKING_RPC and the p_* argument names must match the real
// hourly booking function in your database - confirm them before going
// live. If it doesn't exist the page shows an error and never reports
// a booking as successful.
// =========================================================
const HOURLY_BOOKING_RPC = "create_booking_v2";

async function createHourlyBooking({
  hotelId,
  roomCategoryId,
  stayDate,
  startTime,
  durationHours,
  numberOfGuests,
  roomsRequested,
  guestName,
  guestPhone,
  guestEmail,
}) {
  const { data, error } = await supabase.rpc(HOURLY_BOOKING_RPC, {
    p_hotel_id: hotelId,
    p_room_category_id: roomCategoryId,
    p_stay_type: "hourly",
    p_check_in_date: stayDate,
    p_check_out_date: stayDate,
    p_start_time: startTime,
    p_duration_hours: durationHours,
    p_number_of_guests: numberOfGuests,
    p_rooms_requested: roomsRequested,
    p_guest_name: guestName,
    p_guest_phone: guestPhone,
    p_guest_email: guestEmail,
  });

  if (error) {
    const message = error.message || "";
    if (error.code === "PGRST202" || /could not find the function/i.test(message)) {
      throw new Error("Hourly booking isn't enabled on the server yet. No booking was created.");
    }
    throw error;
  }

  return Array.isArray(data) ? data[0] || null : data || null;
}

// =========================================================
// HOURLY RULES & HELPERS
// =========================================================

const PACKAGES = [3, 6];
// Hourly check-in window (9 AM - 3 PM), same as the hourly search
const FIRST_START_HOUR = 9;
const LAST_START_HOUR = 15;

// before 12:00 PM -> 3h and 6h | exactly 12:00 PM -> 6h only | after 12:00 PM -> 3h only
function getAllowedDurations(time) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  const minutes = (h || 0) * 60 + (m || 0);
  if (minutes === 12 * 60) return [6];
  if (minutes > 12 * 60) return [3];
  return PACKAGES;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartSlots(stayDate) {
  const now = new Date();
  let first = FIRST_START_HOUR;
  if (stayDate === formatDateValue(now)) {
    const next = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
    first = Math.max(FIRST_START_HOUR, next);
  }
  const slots = [];
  for (let h = first; h <= LAST_START_HOUR; h++) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

// Returns a message when the date / time can't be booked, otherwise null
function getSlotProblem(stayDate, startTime) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stayDate || "")) return "The stay date is missing or invalid.";
  if (!/^\d{2}:\d{2}$/.test(startTime || "")) return "The check-in time is missing or invalid.";
  if (stayDate < formatDateValue(new Date())) return "That date has already passed.";
  const [h, m] = startTime.split(":").map(Number);
  if (m !== 0 || h < FIRST_START_HOUR || h > LAST_START_HOUR) {
    return "Hourly check-in is available between 9:00 AM and 3:00 PM.";
  }
  if (!getStartSlots(stayDate).includes(startTime)) return "That check-in time has already passed today.";
  return null;
}

function formatTime12(time, addHours = 0) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  const total = ((h || 0) + addHours) % 24;
  const suffix = total >= 12 ? "PM" : "AM";
  const hour12 = total % 12 === 0 ? 12 : total % 12;
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatLongDate(dateStr) {
  const [y, m, d] = String(dateStr || "").split("-");
  if (!y || !m || !d) return dateStr || "";
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1] || ""} ${y}`;
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

const rupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const controlClass =
  "w-full bg-transparent text-sm font-semibold text-neutral-900 outline-none cursor-pointer min-h-[24px]";

// =========================================================
// HOURLY BOOKING PAGE
// =========================================================

export default function BookingsHr() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ---------------- booking data passed from HotelDetails-hr ----------------
  const hotelId = searchParams.get("hotel") || "";
  const categoryId = searchParams.get("category") || "";
  const stayDate = searchParams.get("stayDate") || searchParams.get("date") || "";
  const startTime = searchParams.get("startTime") || "";
  const guests = Math.max(1, Number(searchParams.get("guests")) || 1);
  const rooms = Math.max(1, Number(searchParams.get("rooms")) || 1);
  const rawDuration = Number(searchParams.get("duration")) || null;

  const today = formatDateValue(new Date());
  const slotProblem = useMemo(() => getSlotProblem(stayDate, startTime), [stayDate, startTime]);
  const allowedDurations = slotProblem ? [] : getAllowedDurations(startTime);
  const requestedValid = PACKAGES.includes(rawDuration) && allowedDurations.includes(rawDuration);
  const durationProblem = !slotProblem && rawDuration !== null && !requestedValid;

  // package in effect: valid request, else the only allowed one, else the guest must choose
  const duration = requestedValid
    ? rawDuration
    : allowedDurations.length === 1
    ? allowedDurations[0]
    : null;
  const checkoutTime = duration ? formatTime12(startTime, duration) : null;

  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
          });
          if ("stayDate" in updates) next.delete("date");
          next.set("stayType", "hourly");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // ---------------- state ----------------
  const [hotel, setHotel] = useState(null);
  const [categories, setCategories] = useState([]);
  const [roomMedia, setRoomMedia] = useState({});
  const [hotelImage, setHotelImage] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [roomAmenities, setRoomAmenities] = useState([]);
  const [hotelAmenityRows, setHotelAmenityRows] = useState([]);
  const [showAllRoomAmenities, setShowAllRoomAmenities] = useState(false);
  const [showAllHotelAmenities, setShowAllHotelAmenities] = useState(false);

  const [occupancy, setOccupancy] = useState(null);
  const [occupancyLoading, setOccupancyLoading] = useState(false);

  const [slotData, setSlotData] = useState({ key: "", map: {}, error: "" });
  const [slotTick, setSlotTick] = useState(0);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [authMode, setAuthMode] = useState(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [notice, setNotice] = useState("");

  const guestInfoRef = useRef(null);
  const termsCheckboxRef = useRef(null);
  const submittingRef = useRef(false);

  const category = useMemo(() => categories.find((c) => c.id === categoryId) || null, [categories, categoryId]);

  const draftStorageKey = useMemo(
    () => `starlight_booking_hr_draft_${hotelId || "default"}`,
    [hotelId]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // ---------------- invalid direct-URL package is corrected ----------------
  useEffect(() => {
    if (!durationProblem) return;
    const only = allowedDurations.length === 1 ? allowedDurations[0] : "";
    setNotice(
      PACKAGES.includes(rawDuration)
        ? `The ${rawDuration}-hour package isn't offered for a ${formatTime12(startTime)} check-in. ${
            only ? `Only the ${only}-hour package is available.` : "Please choose a package."
          }`
        : "Please choose a 3 or 6 hour package."
    );
    updateParams({ duration: only });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationProblem, rawDuration, startTime]);

  // ---------------- contact draft (sessionStorage, same convention as full-day) ----------------
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.guestName) setGuestName(parsed.guestName);
        if (parsed.guestEmail) setGuestEmail(parsed.guestEmail);
        if (parsed.guestPhone) setGuestPhone(parsed.guestPhone);
      }
    } catch (err) {
      console.error("Error reading booking draft:", err);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(draftStorageKey, JSON.stringify({ guestName, guestEmail, guestPhone }));
    } catch (err) {
      console.error("Error saving booking draft:", err);
    }
  }, [draftStorageKey, guestName, guestEmail, guestPhone]);

  // ---------------- signed-in user + profile autofill ----------------
  useEffect(() => {
    let mounted = true;

    async function applyUser(user) {
      if (!mounted) return;
      setCurrentUser(user || null);
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("full_name, email, phone")
          .eq("id", user.id)
          .single();
        if (!mounted) return;
        setGuestName((p) => p || profile?.full_name || user.user_metadata?.display_name || "");
        setGuestEmail((p) => p || profile?.email || user.email || "");
        setGuestPhone((p) => p || profile?.phone || user.user_metadata?.phone || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (!mounted) return;
        setGuestEmail((p) => p || user.email || "");
        setGuestName((p) => p || user.user_metadata?.display_name || "");
      }
    }

    supabase.auth
      .getUser()
      .then(({ data }) => applyUser(data?.user))
      .catch((err) => console.error("User init error:", err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => applyUser(session?.user));

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // ---------------- hotel, ALL of its room categories, room photos, hotel amenities ----------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        if (!hotelId || !categoryId) {
          throw new Error("Hotel or room category information is missing.");
        }

        const hotels = await getHotels();
        const selectedHotel = (hotels || []).find((h) => h.id === hotelId);
        if (!selectedHotel) throw new Error("Hotel not found.");
        if (selectedHotel.is_hourly_active !== true) {
          throw new Error("This hotel doesn't offer hourly stays.");
        }

        const cats = (await getRoomCategories(hotelId)) || [];
        if (!cats.some((c) => c.id === categoryId)) throw new Error("Room category not found.");

        if (cancelled) return;
        setHotel(selectedHotel);
        setCategories(cats);

        // photos + amenities never block the page
        const [catMedia, hotelMedia, amenityRows] = await Promise.all([
          getRoomCategoryMedia(hotelId).catch((err) => {
            console.warn("Room media load error:", err);
            return [];
          }),
          getHotelMedia(hotelId).catch((err) => {
            console.warn("Hotel media load error:", err);
            return [];
          }),
          getHotelAmenities(cats.map((c) => c.id)).catch((err) => {
            console.error("HOTEL AMENITIES ERROR:", err);
            return [];
          }),
        ]);
        if (cancelled) return;

        const mediaMap = {};
        (catMedia || []).forEach((item) => {
          if (item.room_category_id && item.cloudinary_url) {
            (mediaMap[item.room_category_id] ||= []).push(item.cloudinary_url);
          }
        });
        setRoomMedia(mediaMap);
        setHotelImage(
          hotelMedia?.find((m) => m.media_type === "image")?.cloudinary_url || hotelMedia?.[0]?.cloudinary_url || null
        );
        setHotelAmenityRows(amenityRows || []);
      } catch (err) {
        if (!cancelled) {
          console.error("HOURLY BOOKING LOAD ERROR:", err);
          setError(err.message || "Unable to load booking details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // category is validated once per hotel; switching category later never reloads the hotel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  // ---------------- amenities of the SELECTED room category ----------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!categoryId) {
        setRoomAmenities([]);
        return;
      }
      try {
        const data = await getRoomCategoryAmenities(categoryId);
        const unique = Array.from(
          new Map((data || []).filter((r) => r.amenities).map((r) => [r.amenities.id, r.amenities])).values()
        );
        if (!cancelled) setRoomAmenities(unique);
      } catch (err) {
        console.error("ROOM CATEGORY AMENITIES ERROR:", err);
        if (!cancelled) setRoomAmenities([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => setPhotoIndex(0), [categoryId]);

  const hotelAmenities = useMemo(() => {
    const map = new Map();
    hotelAmenityRows.forEach((row) => {
      if (row.amenities && !map.has(row.amenities.id)) map.set(row.amenities.id, row.amenities);
    });
    return Array.from(map.values());
  }, [hotelAmenityRows]);

  // ---------------- occupancy limits of the selected category (per room) ----------------
  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setOccupancy(null);

    (async () => {
      try {
        setOccupancyLoading(true);
        const { data, error: occError } = await supabase
          .from("room_category_occupancy")
          .select("minimum_accommodation, preferred_accommodation, maximum_accommodation")
          .eq("room_category_id", category.id)
          .maybeSingle();
        if (occError) throw occError;

        const fallbackMax = getCategoryOccupancyLimits(category).maxGuests;
        let minimum = Number(data?.minimum_accommodation);
        let maximum = Number(data?.maximum_accommodation);
        if (!Number.isInteger(minimum) || minimum < 1) minimum = Number(category.min_occupancy) || 1;
        if (!Number.isInteger(maximum) || maximum < minimum) maximum = Math.max(minimum, fallbackMax);

        if (!cancelled) setOccupancy({ minimum, maximum });
      } catch (err) {
        console.error("OCCUPANCY ERROR:", err);
        if (!cancelled) setOccupancy({ minimum: 1, maximum: getCategoryOccupancyLimits(category).maxGuests });
      } finally {
        if (!cancelled) setOccupancyLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const minGuestsPerRoom = occupancy?.minimum ?? 1;
  const maxGuestsPerRoom = occupancy?.maximum ?? (Number(category?.max_occupancy) || 1);
  const minGuests = minGuestsPerRoom * rooms;
  const maxGuests = maxGuestsPerRoom * rooms;
  const guestsValid = Boolean(occupancy) && guests >= minGuests && guests <= maxGuests;

  // ---------------- live hourly availability + hourly price for EVERY category ----------------
  const slotKey = `${hotelId}|${stayDate}|${startTime}|${duration}`;
  const slotReady = Boolean(hotel && categories.length && !slotProblem && duration && allowedDurations.includes(duration));

  const fetchSlots = useCallback(async () => {
    const data = await getAvailabilityV2({
      hotelId,
      stayType: "hourly",
      checkInDate: stayDate,
      checkOutDate: stayDate,
      startTime,
      durationHours: duration,
    });

    const rows = new Map((data || []).map((r) => [r.room_category_id, r]));
    const entries = await Promise.all(
      categories.map(async (cat) => {
        const row = rows.get(cat.id);
        const available = Number(row?.available_rooms) || 0;
        const total = Number(row?.total_rooms) || null;
        let price = null;
        let priceError = false;

        if (available > 0) {
          try {
            const result = await calculateHourlyRoomPrice({
              hotelId,
              roomCategoryId: cat.id,
              stayDate,
              durationHours: duration,
            });
            const value = Number(result?.hourly_price);
            if (value > 0) price = value;
            else priceError = true;
          } catch (err) {
            console.error(`HOURLY PRICE ERROR: ${cat.category_name}`, err);
            priceError = true;
          }
        }
        return [cat.id, { available, total, price, priceError }];
      })
    );
    return Object.fromEntries(entries);
  }, [hotelId, stayDate, startTime, duration, categories]);

  useEffect(() => {
    if (!slotReady) return;
    let cancelled = false;

    (async () => {
      try {
        const map = await fetchSlots();
        if (!cancelled) setSlotData({ key: slotKey, map, error: "" });
      } catch (err) {
        console.error("HOURLY SLOT ERROR:", err);
        if (!cancelled) {
          setSlotData({ key: slotKey, map: {}, error: err.message || "Unable to check availability for this slot." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slotReady, slotKey, fetchSlots, slotTick]);

  // realtime: refresh when bookings / blocks change (same tables as the full-day page)
  useEffect(() => {
    if (!slotReady) return;
    const refresh = () => setSlotTick((t) => t + 1);
    const channel = supabase
      .channel(`booking-hr-${hotelId}-${stayDate}-${startTime}-${duration}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "booking_rooms" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_blocks" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [slotReady, hotelId, stayDate, startTime, duration]);

  // data for another slot is never shown: it only counts when its key matches
  const slotFresh = slotData.key === slotKey;
  const slotLoading = slotReady && !slotFresh;
  const slotError = slotFresh ? slotData.error : "";
  const selectedSlot = slotFresh ? slotData.map[categoryId] : null;
  const availableRooms = selectedSlot?.available || 0;
  const ratePerRoom = selectedSlot?.price || 0;

  const priceSummary = useMemo(
    () => getHourlyPriceSummary({ ratePerRoom, rooms, guests, signedIn: Boolean(currentUser) }),
    [ratePerRoom, rooms, guests, currentUser]
  );

  // rooms / guests are kept inside what the selected room and slot can take
  useEffect(() => {
    if (!slotFresh || !selectedSlot || selectedSlot.available < 1) return;
    if (rooms > selectedSlot.available) {
      setNotice(`Only ${selectedSlot.available} ${selectedSlot.available === 1 ? "room is" : "rooms are"} available for this slot.`);
      updateParams({ rooms: selectedSlot.available });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotFresh, selectedSlot, rooms]);

  useEffect(() => {
    if (!occupancy) return;
    if (guests > maxGuests || guests < minGuests) {
      const adjusted = Math.min(maxGuests, Math.max(minGuests, guests));
      setNotice(
        `${category?.category_name || "This room"} accommodates ${minGuestsPerRoom}–${maxGuestsPerRoom} guests per room. Your guest count was set to ${adjusted}.`
      );
      updateParams({ guests: adjusted });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupancy, guests, rooms]);

  const soldOut = slotReady && slotFresh && !slotError && availableRooms < 1;
  const canSubmit =
    slotReady &&
    slotFresh &&
    !slotError &&
    availableRooms >= rooms &&
    Boolean(priceSummary) &&
    !occupancyLoading &&
    guestsValid &&
    !bookingLoading;

  // ---------------- navigation ----------------
  const detailsHref = `/hourly/hotel/${encodeURIComponent(hotelId)}?stayType=hourly&stayDate=${encodeURIComponent(
    stayDate
  )}&startTime=${encodeURIComponent(startTime)}${duration ? `&duration=${duration}` : ""}&guests=${guests}`;
  const listingHref = `/hourly-availability?stayDate=${encodeURIComponent(stayDate)}&startTime=${encodeURIComponent(
    startTime
  )}${duration ? `&duration=${duration}` : ""}&guests=${guests}`;

  // ---------------- search modifiers ----------------
  const slotsForDate = getStartSlots(stayDate);

  function applySlotChange({ nextDate = stayDate, nextTime = startTime, nextDuration = duration }) {
    const slots = getStartSlots(nextDate);
    if (nextDate < today || slots.length === 0) {
      setNotice("There are no more hourly check-in times on that date. Please choose another date.");
      return;
    }
    const time = slots.includes(nextTime) ? nextTime : slots[0];
    const allowed = getAllowedDurations(time);
    // keep the package when still valid, clear it when not
    const keep = nextDuration && allowed.includes(nextDuration) ? nextDuration : allowed.length === 1 ? allowed[0] : "";

    setNotice(
      nextDuration && !allowed.includes(nextDuration)
        ? `The ${nextDuration}-hour package isn't offered for a ${formatTime12(time)} check-in.${
            keep ? ` Switched to the ${keep}-hour package.` : " Please choose a package."
          }`
        : ""
    );
    setBookingError("");
    updateParams({ stayDate: nextDate, startTime: time, duration: keep });
  }

  const changeDate = (value) => value && applySlotChange({ nextDate: value });
  const changeTime = (value) => applySlotChange({ nextTime: value });
  const choosePackage = (d) => {
    if (!allowedDurations.includes(d)) return;
    setNotice("");
    setBookingError("");
    updateParams({ duration: d });
  };

  const changeGuests = (value) => {
    const next = Number(value);
    if (Number.isInteger(next) && next >= minGuests && next <= maxGuests) {
      setNotice("");
      updateParams({ guests: next });
    }
  };

  const roomCap = Math.max(1, selectedSlot?.available || 1);
  const changeRooms = (value) => {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 1 || next > roomCap) return;
    const newMin = minGuestsPerRoom * next;
    const newMax = maxGuestsPerRoom * next;
    setNotice("");
    updateParams({ rooms: next, guests: Math.min(newMax, Math.max(newMin, guests)) });
  };

  const switchCategory = (id) => {
    if (id === categoryId) return;
    setNotice("");
    setBookingError("");
    updateParams({ category: id });
  };

  // ---------------- submission ----------------
  function validateBooking() {
    if (!hotelId || !categoryId) return "Hotel or room category information is missing.";
    const slotIssue = getSlotProblem(stayDate, startTime);
    if (slotIssue) return `${slotIssue} Please choose another slot.`;
    if (!PACKAGES.includes(duration) || !allowedDurations.includes(duration)) {
      return `Please choose a package available for a ${formatTime12(startTime)} check-in.`;
    }
    if (!guestsValid) return `This room accommodates ${minGuestsPerRoom}–${maxGuestsPerRoom} guests per room.`;
    return "";
  }

  const completeBooking = async () => {
    if (submittingRef.current) return; // prevents duplicate submissions
    submittingRef.current = true;
    setBookingLoading(true);
    setBookingError("");

    try {
      const problem = validateBooking();
      if (problem) throw new Error(problem);

      // re-check availability and price right before creating the booking
      const fresh = await fetchSlots();
      setSlotData({ key: slotKey, map: fresh, error: "" });
      const current = fresh[categoryId];
      if (!current || current.available < rooms) {
        throw new Error(
          current && current.available > 0
            ? `Only ${current.available} ${current.available === 1 ? "room is" : "rooms are"} left for your slot.`
            : "This room was just booked for your slot. Please choose another time or room."
        );
      }
      if (current.price !== ratePerRoom) {
        throw new Error(`The price for this slot is now ${rupees(current.price)} per room. Please review and confirm again.`);
      }

      const result = await createHourlyBooking({
        hotelId,
        roomCategoryId: categoryId,
        stayDate,
        startTime,
        durationHours: duration,
        numberOfGuests: guests,
        roomsRequested: rooms,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || null,
      });

      if (!result) throw new Error("Booking could not be created.");
      setBookingConfirmation(result);

      try {
        const transactionId = result.booking_reference || result.id || "";
        const bookingValue = Number(result.total_amount || priceSummary?.finalTotal || 0);
        trackEvent("purchase", { transaction_id: transactionId, value: bookingValue, currency: "INR" });
        trackAdsConversion(bookingValue, "INR", transactionId);
      } catch (analyticsErr) {
        console.warn("[Analytics] Booking event error:", analyticsErr);
      }

      try {
        sessionStorage.removeItem(draftStorageKey);
      } catch (err) {
        console.warn("Could not clear booking draft:", err);
      }

      setSlotTick((t) => t + 1);
    } catch (err) {
      console.error("HOURLY BOOKING ERROR:", err);
      const message = err?.message || "";
      if (/not enough rooms/i.test(message)) setBookingError("Not enough rooms available for the selected slot.");
      else if (/just booked/i.test(message)) setBookingError("The selected room was just booked. Please try again.");
      else setBookingError(message || "Unable to complete booking.");
    } finally {
      submittingRef.current = false;
      setBookingLoading(false);
    }
  };

  const scrollToGuestInfo = (focusId) => {
    guestInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (focusId) setTimeout(() => document.getElementById(focusId)?.focus(), 350);
  };

  const handleBookNow = async () => {
    if (bookingLoading || submittingRef.current) return;
    setBookingError("");
    setTermsError("");

    const problem = validateBooking();
    if (problem) {
      setBookingError(problem);
      return;
    }

    if (!termsAgreed) {
      setTermsError("Please confirm guest details and agree to the Terms of Service and Privacy Policy.");
      termsCheckboxRef.current?.focus();
      return;
    }
    if (!guestName.trim()) {
      setBookingError("Please enter the primary guest's full name.");
      scrollToGuestInfo("guest-full-name");
      return;
    }
    const cleanPhone = guestPhone.trim();
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setBookingError("Please enter a valid mobile number.");
      scrollToGuestInfo("guest-phone-number");
      return;
    }
    if (guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      setBookingError("Please enter a valid email address.");
      scrollToGuestInfo("guest-email");
      return;
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      // guests without a login session may still book
      if (authError && authError.name !== "AuthSessionMissingError") throw authError;

      setCurrentUser(user || null);
      if (user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ phone: cleanPhone, full_name: guestName.trim() })
          .eq("id", user.id);
        if (updateError) throw updateError;
      }

      await completeBooking();
    } catch (err) {
      console.error("BOOKING ERROR:", err);
      setBookingError(err?.message || "Unable to continue booking.");
      scrollToGuestInfo();
    }
  };

  // =======================================================
  // LOADING / ERROR SCREENS
  // =======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 animate-pulse rounded-lg bg-neutral-200" />
              <div className="h-4 w-44 animate-pulse rounded-lg bg-neutral-200" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="h-9 w-80 max-w-full animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-4 w-56 animate-pulse rounded-lg bg-neutral-200" />
            </div>
            <div className="mt-8 space-y-6">
              <div className="h-72 animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />
              <div className="h-[460px] animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const blockingProblem =
    error || slotProblem || (!hotel || !category ? "Selected hotel or room category information could not be retrieved." : "");

  if (blockingProblem) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-12 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
              <AlertCircle size={32} />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">Unable to proceed with reservation</h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">{blockingProblem}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {hotelId && !error && (
                <Link to={`/hourly/hotel/${encodeURIComponent(hotelId)}`} className="inline-flex items-center gap-2 rounded-2xl bg-[#1B1E28] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black">
                  <ArrowLeft size={16} />
                  Back to hotel
                </Link>
              )}
              <Link to="/hourly-availability" className="inline-flex items-center gap-2 rounded-2xl border border-[#D7A441] px-6 py-3.5 text-sm font-semibold text-[#966A1E] hover:bg-[#FAF5EB]">
                Explore Hourly Stays
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const photos = roomMedia[categoryId] || [];
  const heroImage = photos[photoIndex] || photos[0] || hotelImage;
  const showPrice = !slotLoading && priceSummary;
  const folioRows = [
    ["Stay date", formatLongDate(stayDate)],
    ["Check-in", formatTime12(startTime)],
    ["Package", duration ? `${duration} Hours` : "Choose a package"],
    ["Expected check-out", checkoutTime || "—"],
    ["Guests", `${guests} ${guests === 1 ? "Guest" : "Guests"}`],
    ["Rooms", `${rooms} ${rooms === 1 ? "Room" : "Rooms"}`],
  ];

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-neutral-900 flex flex-col justify-between selection:bg-[#D7A441]/20">
      <main className="flex-1 pb-28">
        {/* ============ HEADER ============ */}
        <header className="border-b border-[#EAE6DF] bg-white sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(detailsHref)}
                  aria-label="Back to hotel details"
                  title="Back to hotel details"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-[#D7A441] hover:text-[#B88428] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft size={17} />
                </button>
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400 min-w-0">
                  <Link to="/" className="hover:text-neutral-700 transition-colors shrink-0">Home</Link>
                  <span>/</span>
                  <Link to={listingHref} className="hover:text-neutral-700 transition-colors shrink-0">Hotels</Link>
                  <span className="hidden sm:inline">/</span>
                  <span className="hidden sm:inline text-neutral-600 shrink-0">{hotel.city}</span>
                  <span>/</span>
                  <Link to={detailsHref} className="text-neutral-800 font-medium truncate max-w-[110px] sm:max-w-[200px] hover:text-[#B88428]">
                    {hotel.hotel_name}
                  </Link>
                  <span>/</span>
                  <span className="text-[#B88428] font-semibold shrink-0">Reservation</span>
                </nav>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Verified Direct Booking</span>
              </div>
            </div>

            <div className="mt-4 pt-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#B88428]">Starlight Hourly Stays</span>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-900">{hotel.hotel_name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
                <MapPin size={14} className="shrink-0 text-[#D7A441]" />
                <span>
                  {hotel.address ? `${hotel.address}, ` : ""}
                  <strong className="text-neutral-700 font-medium">{hotel.city}</strong>
                </span>
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {notice && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900" role="status">
              <Info size={16} className="mt-0.5 shrink-0 text-[#B88428]" />
              <p className="flex-1">{notice}</p>
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss" className="shrink-0 cursor-pointer p-1 text-amber-700 hover:text-amber-900">
                <X size={14} />
              </button>
            </div>
          )}

          {/* 1. SELECTED ROOM + ROOM SWITCHER */}
          <section aria-label="Selected Room Category" className="rounded-2xl border border-[#EAE6DF] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="md:w-80 lg:w-96 shrink-0 bg-neutral-100">
                <div className="relative min-h-[200px] h-[220px] md:h-full md:min-h-[260px] overflow-hidden">
                  {heroImage ? (
                    <img
                      key={heroImage}
                      src={heroImage}
                      alt={category.category_name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={() => setHotelImage(null)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171922] text-white p-6 text-center">
                      <BedDouble size={36} className="text-[#D7A441] mb-2 stroke-1" />
                      <p className="text-sm font-serif font-medium">{category.category_name}</p>
                      <p className="text-xs text-neutral-400 mt-1">{hotel.hotel_name}</p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase border border-white/20">
                      Selected Room
                    </span>
                  </div>
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-2 bg-white border-t border-neutral-100">
                    {photos.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setPhotoIndex(i)}
                        aria-label={`Show photo ${i + 1}`}
                        className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 cursor-pointer ${
                          i === photoIndex ? "border-[#D7A441]" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88428]">Confirmed Room Category</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100/80 px-2.5 py-0.5 rounded-full border border-neutral-200/60 font-medium">
                      <Users size={13} className="text-neutral-500" />
                      Up to {maxGuestsPerRoom} {maxGuestsPerRoom === 1 ? "Guest" : "Guests"} per room
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl sm:text-2xl font-serif font-normal text-neutral-900 tracking-tight">{category.category_name}</h2>
                  {category.description?.trim() && (
                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl">{category.description}</p>
                  )}
                  <span
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      slotLoading
                        ? "bg-neutral-100 text-neutral-400"
                        : availableRooms > 0
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-neutral-100 border border-neutral-200 text-neutral-500"
                    }`}
                  >
                    {slotLoading
                      ? "Checking availability…"
                      : availableRooms > 0
                      ? `${availableRooms}${selectedSlot?.total ? ` of ${selectedSlot.total}` : ""} rooms available for your slot`
                      : "Not available for this slot"}
                  </span>
                </div>

                {categories.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Switch Category</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {categories.map((cat) => {
                        const isSelected = cat.id === categoryId;
                        const info = slotFresh ? slotData.map[cat.id] : null;
                        const { maxGuests: catMax } = getCategoryOccupancyLimits(cat);
                        const fits = guests <= catMax * rooms && guests >= rooms;
                        const catSoldOut = info && info.available < 1;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => switchCategory(cat.id)}
                            aria-pressed={isSelected}
                            className={`rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#171922] text-white shadow-xs"
                                : catSoldOut
                                ? "bg-neutral-100/90 text-neutral-400 border border-neutral-200/60"
                                : fits
                                ? "bg-amber-50 text-[#966A1E] hover:bg-amber-100/80 border border-amber-200/80"
                                : "bg-neutral-100/90 text-neutral-700 hover:bg-neutral-200/90 border border-neutral-200/60"
                            }`}
                          >
                            <span>{cat.category_name}</span>
                            {catSoldOut ? (
                              <span className="text-[10px] font-bold">• Sold out</span>
                            ) : info && info.price > 0 ? (
                              <span className={`text-[10px] font-bold ${isSelected ? "text-[#D7A441]" : "text-[#B88428]"}`}>• {rupees(info.price)}</span>
                            ) : fits && !isSelected ? (
                              <span className="text-[10px] text-[#D7A441] font-bold">• Fits</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. RESERVATION SUMMARY */}
          <section aria-label="Booking Summary and Guest Contact" className="rounded-2xl border border-[#EAE6DF] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.03)] relative">
            <div className="rounded-t-2xl border-b border-[#EAE6DF] bg-[#FAF9F6] px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-medium text-neutral-900">Reservation Summary &amp; Guest Contact</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Confirm your hourly slot and the primary contact for front-desk check-in</p>
              </div>
              <div className="flex items-baseline gap-2 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Total Payable:</span>
                <span className="text-lg sm:text-xl font-bold font-serif text-neutral-900">
                  {slotLoading ? "…" : priceSummary ? rupees(priceSummary.finalTotal) : "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EAE6DF]">
              {/* LEFT: search modifiers + guests + contact */}
              <div className="lg:col-span-6 p-5 sm:p-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[#D7A441]" />
                      Hourly Itinerary
                    </h4>
                    <span className="text-xs font-medium text-[#B88428] bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 rounded-md">
                      {duration ? `${duration} Hour Stay` : "Choose package"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                    <label className="block rounded-xl border border-neutral-200/90 bg-[#FAFAFA] p-3.5 hover:border-[#D7A441]/60 focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition cursor-pointer">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stay Date</span>
                      <div className="mt-1 flex items-center gap-2">
                        <CalendarDays size={16} className="text-[#D7A441] shrink-0" />
                        <input type="date" min={today} value={stayDate} onChange={(e) => changeDate(e.target.value)} className={controlClass} aria-label="Stay date" />
                      </div>
                    </label>
                    <label className="block rounded-xl border border-neutral-200/90 bg-[#FAFAFA] p-3.5 hover:border-[#D7A441]/60 focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition cursor-pointer">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Check-in Time</span>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock size={16} className="text-[#D7A441] shrink-0" />
                        <select value={startTime} onChange={(e) => changeTime(e.target.value)} className={controlClass} aria-label="Check-in time">
                          {slotsForDate.map((s) => (
                            <option key={s} value={s}>{formatTime12(s)}</option>
                          ))}
                        </select>
                      </div>
                    </label>
                  </div>

                  <div className="mt-3.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Package</span>
                    <div className="flex gap-2">
                      {PACKAGES.map((d) => {
                        const allowed = allowedDurations.includes(d);
                        const active = duration === d;
                        return (
                          <button
                            key={d}
                            type="button"
                            disabled={!allowed}
                            onClick={() => choosePackage(d)}
                            aria-pressed={active}
                            className={`flex-1 rounded-xl border px-3 py-3 min-h-[44px] text-sm font-semibold transition ${
                              !allowed
                                ? "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                                : active
                                ? "border-[#D7A441] bg-[#FAF5EB] text-[#966A1E] ring-2 ring-[#D7A441]/20 cursor-pointer"
                                : "border-neutral-200 bg-white text-neutral-700 hover:border-[#D7A441]/60 cursor-pointer"
                            }`}
                          >
                            {d} Hours
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-[#8B651B]">
                      {allowedDurations.length === 1
                        ? `For a ${formatTime12(startTime)} check-in, only the ${allowedDurations[0]}-hour package is offered.`
                        : "Check-ins before 12:00 PM can choose the 3-hour or 6-hour package."}
                    </p>
                  </div>

                  <div className="mt-3.5 rounded-xl border border-[#EEDDB8] bg-[#FAF5EC] p-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6214]">
                      <Clock size={15} className="text-[#966A1E]" />
                      Expected check-out
                    </div>
                    <span className="text-sm font-bold text-[#4A3511]">
                      {checkoutTime ? `${checkoutTime}, ${formatLongDate(stayDate)}` : "Choose a package"}
                    </span>
                  </div>
                </div>

                {/* guests + rooms */}
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-neutral-700 mb-1.5">Guests</span>
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-[#FAFAFA] p-2 hover:border-[#D7A441]/60 transition-all">
                      <div className="flex items-center gap-2.5 pl-1.5 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D7A441]/10 text-[#B88428] shrink-0"><Users size={16} /></div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-neutral-900 block leading-tight">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
                          <span className="text-[10px] text-neutral-400 block truncate">{minGuests}–{maxGuests} allowed</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" disabled={guests <= minGuests} onClick={() => changeGuests(guests - 1)} aria-label="Decrease guest count" className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><Minus size={14} /></button>
                        <button type="button" disabled={guests >= maxGuests} onClick={() => changeGuests(guests + 1)} aria-label="Increase guest count" className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-neutral-700 mb-1.5">Number of Rooms</span>
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-[#FAFAFA] p-2 hover:border-[#D7A441]/60 transition-all">
                      <div className="flex items-center gap-2.5 pl-1.5 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D7A441]/10 text-[#B88428] shrink-0"><BedDouble size={16} /></div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-neutral-900 block leading-tight">{rooms} {rooms === 1 ? "Room" : "Rooms"}</span>
                          <span className="text-[10px] text-neutral-400 block truncate">Up to {maxGuestsPerRoom} guests/room</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" disabled={rooms <= 1} onClick={() => changeRooms(rooms - 1)} aria-label="Decrease room count" className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><Minus size={14} /></button>
                        <button type="button" disabled={rooms >= roomCap} onClick={() => changeRooms(rooms + 1)} aria-label="Increase room count" className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {guests >= maxGuests && (
                  <div className="rounded-xl bg-[#FAF5EC] border border-[#EEDDB8] p-3 text-[#8C6214]">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Info size={15} className="shrink-0 text-[#966A1E]" />
                      <span>Maximum occupancy reached</span>
                    </div>
                    <p className="mt-1 text-[11px] pl-5 leading-relaxed">
                      {rooms} {rooms === 1 ? "room holds" : "rooms hold"} up to {maxGuests} guests. Add a room for more guests.
                    </p>
                  </div>
                )}

                {/* contact */}
                <div ref={guestInfoRef} className="rounded-2xl border border-[#EAE6DF] bg-[#FDFCFB] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <User size={14} className="text-[#D7A441]" />
                      Primary Guest
                    </h4>
                    {currentUser ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check size={11} /> Signed in
                      </span>
                    ) : (
                      <button type="button" onClick={() => setAuthMode("login")} className="text-[11px] font-bold text-[#B88428] hover:underline cursor-pointer">
                        Sign in
                      </button>
                    )}
                  </div>

                  {!currentUser && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900">
                      <Star size={14} className="mt-0.5 shrink-0 fill-[#D7A441] text-[#D7A441]" />
                      <p className="leading-relaxed">
                        Sign in to unlock the <strong>Member Privilege Savings ({Math.round(MEMBER_DISCOUNT_RATE * 100)}%)</strong> on your booking.{" "}
                        <button type="button" onClick={() => setAuthMode("login")} className="font-bold underline cursor-pointer">Sign in</button>{" "}or{" "}
                        <button type="button" onClick={() => setAuthMode("signup")} className="font-bold underline cursor-pointer">create an account</button>.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="guest-full-name" className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-xl border border-neutral-200/90 bg-white hover:border-neutral-300 focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400"><User size={16} /></div>
                        <input id="guest-full-name" type="text" autoComplete="name" placeholder="e.g. Vikram Malhotra" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full bg-transparent pl-10 pr-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-medium" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="guest-phone-number" className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-xl border border-neutral-200/90 bg-white hover:border-neutral-300 focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400"><Phone size={16} /></div>
                        <input id="guest-phone-number" type="tel" autoComplete="tel" placeholder="e.g. 9876543210" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full bg-transparent pl-10 pr-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-medium" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="guest-email" className="block text-xs font-semibold text-neutral-800 mb-1.5">Email <span className="text-neutral-400 font-normal">(optional)</span></label>
                    <input id="guest-email" type="email" autoComplete="email" placeholder="you@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full rounded-xl border border-neutral-200/90 bg-white px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-medium hover:border-neutral-300 focus:border-[#D7A441] focus:ring-2 focus:ring-[#D7A441]/20 transition" />
                  </div>
                  <p className="mt-4 text-[11px] text-neutral-500 leading-relaxed">
                    Booking voucher, reservation SMS, and front-desk check-in details will be registered to this contact.
                  </p>
                </div>
              </div>

              {/* RIGHT: folio + CTA */}
              <div className="lg:col-span-6 p-5 sm:p-6 lg:p-7 space-y-4 bg-[#FAF9F6] lg:sticky lg:top-28 self-start">
                <div className="rounded-2xl border border-amber-200/60 bg-[#FCF9F3]/90 p-4 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#F5EEDF] border border-[#E8DAC2] text-[#B88428] shrink-0">
                        <FileText size={18} />
                      </div>
                      <h4 className="text-xs sm:text-base font-bold uppercase tracking-wider text-neutral-900 leading-tight">Hourly Folio Summary</h4>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 bg-amber-100/50 border border-amber-200/50 px-2 py-0.5 rounded-md shrink-0">INR (₹)</span>
                  </div>

                  <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 sm:p-5 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex items-start justify-between gap-2 text-neutral-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <BedDouble size={15} className="text-neutral-400 shrink-0" />
                        <span className="font-medium text-neutral-800 truncate">{category.category_name}</span>
                      </div>
                    </div>

                    {folioRows.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 text-neutral-700">
                        <span>{label}</span>
                        <span className="font-bold text-neutral-900 text-right">{value}</span>
                      </div>
                    ))}

                    <div className="border-t border-neutral-100 pt-3.5 space-y-3.5">
                      {showPrice &&
                        priceSummary.guestCounts.map((count, index) => (
                          <div key={index} className="flex items-start sm:items-center justify-between gap-2 text-neutral-700">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                              <BedDouble size={15} className="text-neutral-400 shrink-0" />
                              <span className="font-medium text-neutral-800">Room {index + 1}</span>
                              <span className="text-xs text-neutral-400">({count} {count === 1 ? "guest" : "guests"})</span>
                            </div>
                            <div className="text-right shrink-0 whitespace-nowrap">
                              <span className="font-bold text-neutral-900">{rupees(priceSummary.ratePerRoom)}</span>
                              <span className="text-[11px] font-normal text-neutral-400"> / {duration} hrs</span>
                            </div>
                          </div>
                        ))}

                      <div className="flex items-center justify-between gap-2 text-neutral-700">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={15} className="text-neutral-400 shrink-0" />
                          <span>Room Subtotal</span>
                        </div>
                        <span className="font-bold text-neutral-900 whitespace-nowrap">{slotLoading ? "Calculating…" : showPrice ? rupees(priceSummary.subtotal) : "—"}</span>
                      </div>

                      <div className="flex items-start sm:items-center justify-between gap-2 text-neutral-700">
                        <div className="flex items-center gap-2 min-w-0">
                          <Percent size={15} className="text-neutral-400 shrink-0" />
                          <span className="leading-snug">Goods &amp; Services Tax ({Math.round(GST_RATE * 100)}% GST)</span>
                        </div>
                        <span className="font-bold text-neutral-900 whitespace-nowrap">{showPrice ? rupees(priceSummary.gstAmount) : "—"}</span>
                      </div>

                      {showPrice && priceSummary.signInDiscount > 0 && (
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50/90 border border-emerald-200/80 px-2.5 sm:px-3 py-2 text-emerald-800">
                          <div className="flex items-center gap-1.5 sm:gap-2 font-medium min-w-0 flex-1">
                            <Star size={15} className="text-emerald-600 fill-emerald-600 shrink-0" />
                            <span className="leading-snug">Member Privilege Savings ({Math.round(MEMBER_DISCOUNT_RATE * 100)}%)</span>
                          </div>
                          <span className="font-bold shrink-0 whitespace-nowrap pl-2">−{rupees(priceSummary.signInDiscount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {slotError && <div className="rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700">{slotError}</div>}
                  {!slotError && !slotLoading && availableRooms >= 1 && !priceSummary && (
                    <div className="rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700">
                      The hourly price for this room couldn&apos;t be confirmed. Please try again or choose another room.
                    </div>
                  )}
                  {soldOut && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-2.5 text-xs text-amber-900">
                      This room is no longer available for your slot. Pick another category above, or change the time.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#E9D9B8] bg-gradient-to-r from-[#F9F3E5] via-[#FFFDF9] to-[#F7EDD7] p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#EFE3C8] border border-[#DECDA6] text-[#8C6218] shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 leading-tight">Total Payable</h4>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5 leading-tight">Hourly package rate and GST</p>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#4A3511] whitespace-nowrap">
                    {slotLoading ? "…" : showPrice ? rupees(priceSummary.finalTotal) : "—"}
                  </span>
                </div>

                <div className="pt-3 space-y-3">
                  <div className="rounded-xl border border-neutral-200/90 bg-[#FAF9F6] p-3 text-left">
                    <label className="flex items-start gap-2.5 text-xs text-neutral-700 cursor-pointer select-none">
                      <input
                        ref={termsCheckboxRef}
                        type="checkbox"
                        id="booking-terms-consent"
                        checked={termsAgreed}
                        onChange={(e) => {
                          setTermsAgreed(e.target.checked);
                          if (e.target.checked) setTermsError("");
                        }}
                        className="mt-0.5 h-5 w-5 rounded border-neutral-300 accent-neutral-900 shrink-0 cursor-pointer"
                      />
                      <span className="leading-relaxed">
                        I confirm the guest details and agree to the{" "}
                        <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-neutral-900 underline hover:text-[#9B111E]">Terms of Service</Link>{" "}
                        and{" "}
                        <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-neutral-900 underline hover:text-[#9B111E]">Privacy Policy</Link>.
                      </span>
                    </label>
                    {termsError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-7">{termsError}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleBookNow}
                    disabled={!canSubmit}
                    className="w-full rounded-xl bg-[#171922] hover:bg-black active:scale-[0.99] text-white py-4 px-6 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Confirming Reservation...</span>
                      </>
                    ) : (
                      <>
                        <span>{!duration ? "Choose a package" : "Complete Reservation"}</span>
                        <ChevronRight size={17} className="text-[#D7A441]" />
                      </>
                    )}
                  </button>

                  {bookingError && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200/80 p-2.5 text-xs text-red-700" role="alert">
                      <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="text-center pt-1">
                    <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-snug">
                      <ShieldCheck size={14} className="inline-block -mt-0.5 mr-1 text-neutral-500 align-middle shrink-0" />
                      <span>Guaranteed reservation with front-desk settlement.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ROOM AMENITIES */}
          <section aria-label="Room Inclusions and Amenities" className="rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-neutral-100">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-medium text-neutral-900">Room Inclusions &amp; Amenities</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Provided in {category.category_name}</p>
              </div>
              {roomAmenities.length > 8 && (
                <button type="button" onClick={() => setShowAllRoomAmenities((v) => !v)} className="text-xs font-semibold text-[#B88428] hover:text-[#976a1c] cursor-pointer shrink-0">
                  {showAllRoomAmenities ? "Show fewer" : `View all (${roomAmenities.length})`}
                </button>
              )}
            </div>
            {roomAmenities.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-2">No amenities have been listed for this room yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {(showAllRoomAmenities ? roomAmenities : roomAmenities.slice(0, 8)).map((amenity) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  return (
                    <div key={amenity.id} className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-[#FAFAFA] p-3 text-xs text-neutral-700">
                      <Icon size={16} className="text-[#D7A441] shrink-0" />
                      <span className="font-medium truncate">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4. HOTEL AMENITIES */}
          {hotelAmenities.length > 0 && (
            <section aria-label="Hotel Amenities" className="rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-medium text-neutral-900">Hotel Amenities</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Across {hotel.hotel_name}</p>
                </div>
                {hotelAmenities.length > 8 && (
                  <button type="button" onClick={() => setShowAllHotelAmenities((v) => !v)} className="text-xs font-semibold text-[#B88428] hover:text-[#976a1c] cursor-pointer shrink-0">
                    {showAllHotelAmenities ? "Show fewer" : `View all (${hotelAmenities.length})`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(showAllHotelAmenities ? hotelAmenities : hotelAmenities.slice(0, 8)).map((amenity) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  return (
                    <span key={amenity.id} className="inline-flex items-center gap-2 rounded-xl border border-[#EBE3D5] bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2C2C2E]">
                      <Icon size={14} className="text-[#C59B27] shrink-0" />
                      {amenity.name}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. GUIDELINES */}
          <section aria-label="Hourly Stay Guidelines" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-xs mb-1.5">
                <Clock size={16} className="text-[#D7A441] shrink-0" />
                <span>Your Hourly Slot</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {duration ? (
                  <>Your stay runs from <strong>{formatTime12(startTime)}</strong> to <strong>{checkoutTime}</strong> on {formatLongDate(stayDate)}.</>
                ) : (
                  "Choose a package to see your check-in and check-out times."
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-xs mb-1.5">
                <ShieldCheck size={16} className="text-[#D7A441] shrink-0" />
                <span>Guest Verification</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                A valid government-issued photo ID (Aadhaar, Passport, Voter ID or Driver&apos;s License) is required for each guest upon physical check-in.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* ============ CONFIRMATION MODAL ============ */}
      {bookingConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-neutral-200">
            <button type="button" onClick={() => setBookingConfirmation(null)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 cursor-pointer" aria-label="Close modal">
              <X size={18} />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-[#B88428] ring-8 ring-amber-100/70 shadow-sm">
              <Clock size={40} className="stroke-[2.2]" />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 font-serif">Reservation Request Sent!</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Your hourly reservation request for <strong className="text-neutral-900">{hotel.hotel_name}</strong> has been submitted. Please wait for confirmation.
            </p>

            <div className="mt-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 text-left">
              <Sparkles size={16} className="text-[#B88428] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Pending Confirmation:</strong> To view the real-time status of your booking, please check the <strong>My Bookings</strong> page.
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 p-5 text-left text-xs sm:text-sm space-y-2.5">
              {[
                ["Booking Reference", bookingConfirmation.booking_reference || "—", true],
                ["Booking Status", "Pending Confirmation", false],
                ["Room Category", category.category_name, false],
                ["Rooms", String(bookingConfirmation.room_ids?.length || rooms), false],
                ["Stay Date", formatLongDate(stayDate), false],
                ["Time", `${formatTime12(startTime)} – ${checkoutTime}`, false],
                ["Package", `${duration} Hours`, false],
                ["Guests", String(guests), false],
              ].map(([label, value, mono]) => (
                <div key={label} className="flex justify-between items-center gap-3 py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">{label}</span>
                  <strong className={mono ? "font-mono text-[#B88428] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80" : "text-neutral-800 text-right"}>{value}</strong>
                </div>
              ))}
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-500 font-medium">Total Amount</span>
                <strong className="text-base text-neutral-900 font-bold">{rupees(bookingConfirmation.total_amount || priceSummary?.finalTotal)}</strong>
              </div>
              {bookingConfirmation.total_amount && priceSummary && Number(bookingConfirmation.total_amount) !== priceSummary.finalTotal && (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  The amount recorded for your booking differs from the total shown before booking. Please verify it in My Bookings.
                </p>
              )}
            </div>

            {currentUser ? (
              <button type="button" onClick={() => { setBookingConfirmation(null); navigate("/my-bookings"); }} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] text-neutral-950 font-bold py-3.5 text-sm sm:text-base transition-all hover:shadow-lg cursor-pointer">
                Check Status in My Bookings →
              </button>
            ) : (
              <button type="button" onClick={() => { setBookingConfirmation(null); navigate("/"); }} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] text-neutral-950 font-bold py-3.5 text-sm sm:text-base transition-all hover:shadow-lg cursor-pointer">
                Done
              </button>
            )}
            <button type="button" onClick={() => setBookingConfirmation(null)} className="mt-2.5 w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer">
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* ============ AUTH MODAL (existing component) ============ */}
      {authMode && (
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
                    .update({ phone: guestPhone.trim(), full_name: guestName.trim() })
                    .eq("id", activeUser.id);
                } catch (e) {
                  console.warn("Phone sync error:", e);
                }
              }
            }
          }}
        />
      )}
    </div>
  );
}