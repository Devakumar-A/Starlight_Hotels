import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AirVent,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BatteryCharging,
  BedDouble,
  BriefcaseMedical,
  CalendarDays,
  Car,
  Cctv,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  DoorOpen,
  ExternalLink,
  Images,
  Maximize2,
  MapPin,
  Minus,
  Navigation,
  Pencil,
  Plus,
  Refrigerator,
  ShieldCheck,
  ShieldUser,
  Shirt,
  Sparkles,
  Timer,
  Tv,
  Users,
  Waves,
  Wifi,
  X,
} from "lucide-react";

import {
  getHotels,
  getHotelById,
  getHotelMedia,
  getRoomCategories,
  getRoomCategoryMedia,
  getHotelAmenities,
  getAvailabilityV2,
  calculateHourlyRoomPrice,
  getCategoryOccupancyLimits,
  canCategoryAccommodate,
} from "../../services/hotelService";

import Footer from "../../components/Footer";
import { setSeo, clearPageJsonLd } from "../../lib/seo";

// =========================================================
// CONSTANTS & HELPERS
// =========================================================

const PACKAGES = [3, 6];
// Hourly check-in window used by the existing hourly search (9 AM – 3 PM)
const FIRST_START_HOUR = 9;
const LAST_START_HOUR = 15;

// Hourly package rules:
//   up to and including 1:00 PM -> 3 and 6 hours
//   after 1:00 PM               -> 3 hours only
function getAllowedDurations(time) {
  const [hours, minutes] = String(time || "00:00")
    .split(":")
    .map(Number);

  const totalMinutes = hours * 60 + minutes;

  return totalMinutes >= 13 * 60 ? [3] : [3, 6];
}

// The availability RPC may reject a package/time combination with P0001.
// Treat this expected validation response as unavailable in the UI.
function isInvalidHourlyBookingTime(err) {
  return (
    err?.code === "P0001" &&
    String(err?.message || "").toLowerCase().includes("invalid hourly booking time")
  );
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getHourlyDefaults() {
  const now = new Date();
  const date = new Date(now);
  let hour = now.getHours();

  if (hour < FIRST_START_HOUR) hour = FIRST_START_HOUR;
  else hour = now.getMinutes() > 0 ? hour + 1 : hour;

  if (hour > LAST_START_HOUR) {
    date.setDate(date.getDate() + 1);
    hour = FIRST_START_HOUR;
  }

  return {
    stayDate: formatDateValue(date),
    startTime: `${String(hour).padStart(2, "0")}:00`,
  };
}

function getStartSlots(stayDate) {
  const now = new Date();
  let first = FIRST_START_HOUR;
  if (stayDate === formatDateValue(now)) {
    const next = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
    first = Math.max(FIRST_START_HOUR, next);
  }
  const slots = [];
  for (let h = first; h <= LAST_START_HOUR; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
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

function formatShortDate(dateStr) {
  const [y, m, d] = String(dateStr || "").split("-");
  if (!y || !m || !d) return dateStr || "";
  return `${parseInt(d, 10)} ${(MONTHS[parseInt(m, 10) - 1] || "").slice(0, 3)}`;
}

// Same deterministic Starlight guest rating generator used on the full-day pages
function getStarlightRating(id) {
  if (!id) return { score: "4.8", label: "Superb", reviews: 142 };

  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const presets = [4.7, 4.8, 4.9, 4.6, 4.8, 5.0, 4.7, 4.9, 4.8, 4.6];
  const score = presets[absHash % presets.length].toFixed(1);
  const reviews = 68 + (absHash % 160);
  const label = Number(score) >= 4.9 ? "Exceptional" : Number(score) >= 4.7 ? "Superb" : "Excellent";
  return { score, label, reviews };
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
  return amenityIcons[iconKey] || Check;
}

// =========================================================
// FULL-SCREEN PHOTO VIEWER (hotel gallery + room photos)
// =========================================================

function Lightbox({ images, index, title, onClose, onIndex }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const count = images.length;
  const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);
  const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, next, prev]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { });
    };
  }, []);

  useEffect(() => setLoaded(false), [index]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { });
    else containerRef.current?.requestFullscreen?.().catch(() => { });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs text-white/60">
            <span className="text-[#D7A441]">{index + 1}</span> / {count}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
            aria-label={isFullscreen ? "Exit full screen" : "View full screen"}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
            aria-label="Close photo viewer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16">
        {!loaded && <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#D7A441]" />}
        <img
          key={images[index]}
          src={images[index]}
          alt={`${title} - photo ${index + 1}`}
          onClick={(e) => e.stopPropagation()}
          onLoad={() => setLoaded(true)}
          className={`max-h-full max-w-full object-contain transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 justify-start sm:justify-center" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => onIndex(i)}
              className={`h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${i === index ? "border-[#D7A441]" : "border-transparent opacity-60 hover:opacity-100"
                }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StayItem({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="mt-0.5 truncate text-sm lg:text-base font-bold text-neutral-900 font-serif">{value}</p>
        {hint && <p className="text-[10px] text-neutral-400">{hint}</p>}
      </div>
    </div>
  );
}

// =========================================================
// HOURLY HOTEL DETAILS
// =========================================================

export default function HotelDetailsHr() {
  const { hotelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [hotelId]);

  // -------------------------------------------------------
  // URL-DRIVEN HOURLY SEARCH
  // -------------------------------------------------------

  const defaults = useMemo(() => getHourlyDefaults(), []);
  const today = formatDateValue(new Date());

  const rawDate = searchParams.get("stayDate") || searchParams.get("date") || "";
  const rawTime = searchParams.get("startTime") || "";
  const stayDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : defaults.stayDate;
  const startTime = /^\d{2}:\d{2}$/.test(rawTime) ? rawTime : defaults.startTime;
  const guests = Math.max(1, Number(searchParams.get("guests")) || 2);

  // date / time must be a real, still-bookable hourly slot
  const slotProblem = useMemo(() => {
    if (stayDate < today) return "That date has already passed.";
    const [h, m] = startTime.split(":").map(Number);
    if (m !== 0 || h < FIRST_START_HOUR || h > LAST_START_HOUR) {
      return "Hourly check-in is available between 9:00 AM and 3:00 PM.";
    }
    if (stayDate === today && !getStartSlots(today).includes(startTime)) {
      return "That check-in time has already passed today.";
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stayDate, startTime, today]);

  const allowedDurations = getAllowedDurations(startTime);
  const rawDuration = searchParams.get("duration");
  const requestedDuration = rawDuration ? Number(rawDuration) : null;
  const requestedValid = PACKAGES.includes(requestedDuration) && allowedDurations.includes(requestedDuration);
  const durationProblem = Boolean(rawDuration) && !requestedValid;

  // Package selection is explicit; no package is auto-selected.
  // A package must always be explicitly selected on a room card.
  // Keep availability loaded for every package allowed at this check-in time.
  const duration = requestedValid ? requestedDuration : null;
  const activeDurations = allowedDurations;
  const activeKey = activeDurations.join(",");
  const checkoutTime = duration ? formatTime12(startTime, duration) : null;

  const [selectedPackages, setSelectedPackages] = useState(() =>
    requestedValid ? { __all: requestedDuration } : {}
  );

  useEffect(() => {
    setSelectedPackages({});
  }, [stayDate, startTime]);

  const [notice, setNotice] = useState("");
  const modifiedRef = useRef(false);

  const updateParams = useCallback(
    (updates, replace = true) => {
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
        { replace }
      );
    },
    [setSearchParams]
  );

  // Direct URLs are validated: bad slot / bad package are corrected in the URL
  useEffect(() => {
    if (slotProblem) {
      setNotice(`${slotProblem} We moved your search to the next available slot.`);
      updateParams({ stayDate: defaults.stayDate, startTime: defaults.startTime, duration: "" });
      return;
    }
    if (durationProblem) {
      setNotice(
        PACKAGES.includes(requestedDuration)
          ? `The ${requestedDuration}-hour package isn't offered for a ${formatTime12(startTime)} check-in. Please select an available package.`
          : "Please choose a 3 or 6 hour package."
      );
      updateParams({ duration: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotProblem, durationProblem, startTime, rawDuration]);

  // -------------------------------------------------------
  // DATA STATE
  // -------------------------------------------------------

  const [hotel, setHotel] = useState(null);
  const [hourlyEnabled, setHourlyEnabled] = useState(null);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [hotelError, setHotelError] = useState("");

  const [media, setMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [roomMedia, setRoomMedia] = useState({});
  const [amenityRows, setAmenityRows] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [avail, setAvail] = useState({ byDur: {}, priceByDur: {}, errByDur: {} });
  const [availLoading, setAvailLoading] = useState(true);

  const [showAllRooms, setShowAllRooms] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [bookError, setBookError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [mainLoading, setMainLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { images, index, title }

  // ---- hotel + hourly flag ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hotelId) {
        setHotelError("Hotel ID is missing.");
        setHotelLoading(false);
        return;
      }
      try {
        setHotelLoading(true);
        setHotelError("");
        const [data, all] = await Promise.all([
          getHotelById(hotelId),
          getHotels().catch(() => null),
        ]);
        if (cancelled) return;
        if (!data) throw new Error("Hotel not found.");
        setHotel(data);
        setHourlyEnabled(
          Array.isArray(all) ? Boolean(all.find((h) => h.id === hotelId)?.is_hourly_active) : null
        );
      } catch (err) {
        console.error("HOURLY HOTEL ERROR:", err);
        if (!cancelled) setHotelError("Unable to load this hotel.");
      } finally {
        if (!cancelled) setHotelLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  // ---- gallery media ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hotelId) return;
      try {
        setMediaLoading(true);
        const data = await getHotelMedia(hotelId);
        if (!cancelled) {
          setMedia(data || []);
          setSelectedImage(0);
        }
      } catch (err) {
        console.error("HOURLY MEDIA ERROR:", err);
        if (!cancelled) setMedia([]);
      } finally {
        if (!cancelled) setMediaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  // ---- room categories, room photos, amenities ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hotelId) return;
      try {
        setRoomsLoading(true);
        const cats = (await getRoomCategories(hotelId)) || [];
        if (cancelled) return;
        setCategories(cats);

        if (!cats.length) {
          setAmenityRows([]);
          setRoomMedia({});
          return;
        }

        const [amenities, catMedia] = await Promise.all([
          getHotelAmenities(cats.map((c) => c.id)).catch((err) => {
            console.error("HOURLY AMENITIES ERROR:", err);
            return [];
          }),
          getRoomCategoryMedia(hotelId).catch((err) => {
            console.error("HOURLY ROOM MEDIA ERROR:", err);
            return [];
          }),
        ]);
        if (cancelled) return;

        setAmenityRows(amenities || []);
        const map = {};
        (catMedia || []).forEach((item) => {
          if (item.room_category_id && item.cloudinary_url) {
            (map[item.room_category_id] ||= []).push(item.cloudinary_url);
          }
        });
        setRoomMedia(map);
      } catch (err) {
        console.error("HOURLY ROOM CATEGORY ERROR:", err);
        if (!cancelled) {
          setCategories([]);
          setAmenityRows([]);
          setRoomMedia({});
        }
      } finally {
        if (!cancelled) setRoomsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  // ---- hourly availability + hourly prices (re-run on date / time / package change) ----
  useEffect(() => {
    if (!hotelId || slotProblem || roomsLoading || hourlyEnabled === false) return;
    if (!categories.length) {
      setAvail({ byDur: {}, priceByDur: {}, errByDur: {} });
      setAvailLoading(false);
      return;
    }

    let cancelled = false;
    setAvailLoading(true);
    setBookError("");

    (async () => {
      const byDur = {};
      const priceByDur = {};
      const errByDur = {};

      await Promise.all(
        (activeKey.split(",").map(Number).filter((d) => {
          return startTime >= "13:00" ? d === 3 : true;
        })).map(async (d) => {
          try {
            const data = await getAvailabilityV2({
              hotelId,
              stayType: "hourly",
              checkInDate: stayDate,
              checkOutDate: stayDate,
              startTime,
              durationHours: d,
            });

            const map = {};
            (data || []).forEach((row) => {
              map[row.room_category_id] = {
                available: Number(row.available_rooms) || 0,
                total: Number(row.total_rooms) || null,
              };
            });
            byDur[d] = map;

            const priceMap = {};
            await Promise.all(
              categories
                .filter((c) => (map[c.id]?.available || 0) > 0)
                .map(async (c) => {
                  try {
                    const p = await calculateHourlyRoomPrice({
                      hotelId,
                      roomCategoryId: c.id,
                      stayDate,
                      durationHours: d,
                    });
                    const value = Number(p?.hourly_price);
                    priceMap[c.id] = value > 0 ? value : null;
                  } catch (err) {
                    console.error(`HOURLY ${d}H PRICE ERROR: ${c.category_name}`, err);
                    priceMap[c.id] = null;
                  }
                })
            );
            priceByDur[d] = priceMap;
          } catch (err) {
            // An RPC time-validation rejection means this package cannot be
            // offered for the selected slot. Keep it unavailable without
            // surfacing a raw Supabase error to the customer.
            if (!isInvalidHourlyBookingTime(err)) {
              console.error(`HOURLY ${d}H AVAILABILITY ERROR:`, err);
            }
            errByDur[d] = true;
            byDur[d] = {};
            priceByDur[d] = {};
          }
        })
      );

      if (!cancelled) {
        setAvail({ byDur, priceByDur, errByDur });
        setAvailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hotelId, stayDate, startTime, activeKey, categories, roomsLoading, slotProblem, hourlyEnabled]);

  // -------------------------------------------------------
  // DERIVED DATA
  // -------------------------------------------------------

  const images = useMemo(
    () => media.filter((item) => item.cloudinary_url && item.media_type === "image"),
    [media]
  );
  const imageUrls = useMemo(() => images.map((i) => i.cloudinary_url), [images]);
  const currentImage = images[selectedImage]?.cloudinary_url || null;

  useEffect(() => {
    if (images.length > 0 && selectedImage >= images.length) setSelectedImage(0);
  }, [images.length, selectedImage]);

  useEffect(() => setMainLoading(true), [selectedImage, currentImage]);

  const uniqueAmenities = useMemo(() => {
    const map = new Map();
    amenityRows.forEach((row) => {
      const a = row.amenities;
      if (a && !map.has(a.id)) map.set(a.id, a);
    });
    return Array.from(map.values());
  }, [amenityRows]);

  const roomAmenities = useMemo(() => {
    const map = {};
    amenityRows.forEach((row) => {
      if (row.amenities && row.room_category_id) {
        (map[row.room_category_id] ||= []).push(row.amenities);
      }
    });
    return map;
  }, [amenityRows]);

  const roomViews = useMemo(
    () =>
      categories.map((cat) => {
        const { maxGuests } = getCategoryOccupancyLimits(cat);
        const perDur = activeDurations.map((d) => {
          const row = avail.byDur[d]?.[cat.id];
          const available = row?.available || 0;
          const price = avail.priceByDur[d]?.[cat.id] ?? null;
          return {
            d,
            available,
            price,
            error: Boolean(avail.errByDur[d]),
            bookable: available > 0 && price > 0,
          };
        });
        const firstRow = activeDurations.map((d) => avail.byDur[d]?.[cat.id]).find(Boolean);
        return {
          cat,
          maxGuests,
          accommodates: canCategoryAccommodate(cat, guests, 1),
          perDur,
          availableMax: Math.max(0, ...perDur.map((p) => p.available)),
          total: firstRow?.total || Number(cat.total_rooms) || null,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, avail, guests, activeKey]
  );

  const fittingViews = roomViews.filter((v) => v.accommodates);
  const displayedViews = showAllRooms || fittingViews.length === 0 ? roomViews : fittingViews;
  const maxGuestsAllowed = useMemo(
    () => Math.max(2, ...categories.map((c) => getCategoryOccupancyLimits(c).maxGuests)),
    [categories]
  );

  const locationData = useMemo(() => {
    if (!hotel) return null;
    const parts = [hotel.address, hotel.city].filter((p) => p && String(p).trim());
    const queryParts = [hotel.hotel_name, hotel.address, hotel.city].filter((p) => p && String(p).trim());
    const q = encodeURIComponent(queryParts.join(", "));
    const placeId = hotel.google_maps_place_id;
    return {
      displayAddress: parts.length ? parts.join(", ") : null,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${q}${placeId ? `&destination_place_id=${placeId}` : ""
        }`,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}${placeId ? `&query_place_id=${placeId}` : ""}`,
      embedMapUrl: q ? `https://maps.google.com/maps?q=${q}&hl=en&z=15&output=embed` : null,
    };
  }, [hotel]);

  // ---- SEO ----
  useEffect(() => {
    if (!hotel) return;
    const desc = (hotel.description || "").trim() || `Book an hourly stay at ${hotel.hotel_name} in ${hotel.city}.`;
    setSeo({
      title: `${hotel.hotel_name} – Hourly Stay | Starlight Hotels`,
      description: desc.length > 155 ? `${desc.slice(0, 152).trimEnd()}…` : desc,
      canonicalPath: `/hourly/hotel/${hotel.id || hotelId}`,
      image: imageUrls[0] || "https://starlighthotels.in/og-image.jpg",
      type: "website",
      jsonLd: null,
    });
  }, [hotel, hotelId, imageUrls]);

  useEffect(() => () => clearPageJsonLd(), []);

  // -------------------------------------------------------
  // NAVIGATION
  // -------------------------------------------------------

  const listingHref = `/hourly-availability?stayDate=${encodeURIComponent(stayDate)}&startTime=${encodeURIComponent(
    startTime
  )}${duration ? `&duration=${duration}` : ""}&guests=${guests}`;

  const goBack = () => {
    // untouched search -> true history back (restores the listing exactly);
    // modified search -> listing with the current hourly selections
    if (!modifiedRef.current && window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate(listingHref);
  };

  // ---- gallery touch / keyboard ----
  const touch = useRef({ sx: 0, sy: 0, ex: 0, ey: 0 });
  const nextImage = () => images.length > 1 && setSelectedImage((c) => (c + 1) % images.length);
  const previousImage = () => images.length > 1 && setSelectedImage((c) => (c - 1 + images.length) % images.length);
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (t) touch.current = { sx: t.clientX, sy: t.clientY, ex: t.clientX, ey: t.clientY };
  };
  const onTouchMove = (e) => {
    const t = e.touches?.[0];
    if (t) touch.current = { ...touch.current, ex: t.clientX, ey: t.clientY };
  };
  const onTouchEnd = () => {
    const dx = touch.current.sx - touch.current.ex;
    const dy = touch.current.sy - touch.current.ey;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) (dx > 0 ? nextImage : previousImage)();
  };

  const openHotelLightbox = (index = 0) =>
    imageUrls.length && setLightbox({ images: imageUrls, index, title: hotel?.hotel_name || "Hotel" });
  const openRoomLightbox = (title, urls, index = 0) =>
    urls?.length && setLightbox({ images: urls, index, title });
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const setLightboxIndex = useCallback((index) => setLightbox((p) => (p ? { ...p, index } : p)), []);

  // -------------------------------------------------------
  // MODIFY SEARCH MODAL
  // -------------------------------------------------------

  const [tDate, setTDate] = useState(stayDate);
  const [tTime, setTTime] = useState(startTime);
  const [tDuration, setTDuration] = useState(duration);
  const [tGuests, setTGuests] = useState(guests);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [y, m] = stayDate.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const tSlots = getStartSlots(tDate);
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarFirstDay = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const calendarDays = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarCells = [
    ...Array(calendarFirstDay).fill(null),
    ...Array.from({ length: calendarDays }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7) calendarCells.push(null);
  const dateFromParts = (day) =>
    `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const todayDate = new Date(`${today}T00:00:00`);
  const tAllowed = getAllowedDurations(tTime);
  const tValid =
    tDate >= today &&
    tSlots.includes(tTime) &&
    (tDuration === null || tAllowed.includes(tDuration)) &&
    tGuests >= 1;

  const openModal = () => {
    setTDate(stayDate);
    const [year, month] = stayDate.split("-").map(Number);
    setCalendarMonth(new Date(year, month - 1, 1));
    setCalendarOpen(false);
    setTTime(startTime);
    setTDuration(duration);
    setTGuests(guests);
    setModalOpen(true);
  };

  const changeTDate = (value) => {
    if (!value) return;
    setTDate(value);
    const [year, month] = value.split("-").map(Number);
    setCalendarMonth(new Date(year, month - 1, 1));
    setCalendarOpen(false);
    const slots = getStartSlots(value);
    if (slots.length && !slots.includes(tTime)) {
      const nextTime = slots[0];
      setTTime(nextTime);
      const allowed = getAllowedDurations(nextTime);
      setTDuration((d) => (d && allowed.includes(d) ? d : null));
    }
  };

  const changeTTime = (value) => {
    setTTime(value);
    const allowed = getAllowedDurations(value);
    // keep the package when still valid, clear it when not
    setTDuration((d) => (d && allowed.includes(d) ? d : null));
  };

  const applyModify = () => {
    if (!tValid) return;
    modifiedRef.current = true;
    setNotice("");
    setSelectedPackages(tDuration ? { __all: tDuration } : {});
    updateParams({
      stayDate: tDate,
      startTime: tTime,
      duration: tDuration ?? "",
      guests: tGuests,
    });
    setModalOpen(false);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  // -------------------------------------------------------
  // BOOKING (validated before navigating to the hourly booking page)
  // -------------------------------------------------------

  const handleBook = (view, d) => {
    const pd = view.perDur.find((p) => p.d === d);
    let problem = "";
    if (!hotel?.id) problem = "Hotel details are missing.";
    else if (!view.cat?.id) problem = "Please choose a room category.";
    else if (slotProblem) problem = slotProblem;
    else if (!PACKAGES.includes(d) || !allowedDurations.includes(d))
      problem = `The ${d}-hour package isn't available for a ${formatTime12(startTime)} check-in.`;
    else if (!view.accommodates)
      problem = `${view.cat.category_name} holds up to ${view.maxGuests} guests. Please change the guest count or pick another room.`;
    else if (!pd || pd.available < 1) problem = "This package is not available for the selected time.";
    else if (!(pd.price > 0)) problem = "The hourly price for this room could not be confirmed. Please try again.";

    if (problem) {
      setBookError(problem);
      return;
    }

    navigate(
      `/hourly/booking?hotel=${encodeURIComponent(hotel.id)}&category=${encodeURIComponent(
        view.cat.id
      )}&stayType=hourly&stayDate=${encodeURIComponent(stayDate)}&startTime=${encodeURIComponent(
        startTime
      )}&duration=${d}&guests=${guests}`
    );
  };

  // =======================================================
  // LOADING / ERROR STATES
  // =======================================================

  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 animate-pulse rounded-lg bg-neutral-200" />
              <div className="h-4 w-48 animate-pulse rounded-lg bg-neutral-200" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="h-9 w-96 max-w-full animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-4 w-60 animate-pulse rounded-lg bg-neutral-200" />
            </div>
            <div className="mt-8 h-[300px] sm:h-[460px] animate-pulse rounded-3xl bg-neutral-200/80" />
            <div className="mt-6 h-28 animate-pulse rounded-3xl bg-neutral-200/80" />
            <div className="mt-10 space-y-4">
              <div className="h-40 animate-pulse rounded-3xl bg-neutral-200/80" />
              <div className="h-40 animate-pulse rounded-3xl bg-neutral-200/80" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (hotelError || !hotel || hourlyEnabled === false) {
    const notHourly = hotel && hourlyEnabled === false;
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-12 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
              <MapPin size={32} />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
              {notHourly ? "Hourly stays unavailable" : "Hotel unavailable"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              {notHourly
                ? "This property doesn't offer hourly stays. You can still book it for a full-day stay."
                : hotelError || "Selected hotel information could not be retrieved."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={listingHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1B1E28] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-black"
              >
                <ArrowLeft size={16} />
                Back to Hourly Stays
              </Link>
              {notHourly && (
                <Link
                  to={`/hotel/${hotel.id}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#D7A441] px-6 py-3.5 text-sm font-semibold text-[#966A1E] hover:bg-[#FAF5EB]"
                >
                  View full-day stay
                </Link>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rating = getStarlightRating(hotel.id);
  const visibleAmenities = showAllAmenities ? uniqueAmenities : uniqueAmenities.slice(0, 8);
  const guestLabel = `${guests} ${guests === 1 ? "Guest" : "Guests"}`;
  const packageNote =
    allowedDurations.length === 1
      ? `For a ${formatTime12(startTime)} check-in, only the ${allowedDurations[0]}-hour package is offered.`
      : "3-hour and 6-hour packages are available for this check-in time.";

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-neutral-900 flex flex-col justify-between">
      <main className="flex-1 pb-24">
        {/* ================= HEADER ================= */}
        <section className="border-b border-[#EAE6DF] bg-[#FAF8F5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={goBack}
                aria-label="Back to hourly stays"
                title="Back to hourly stays"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <ArrowLeft size={17} />
              </button>
              <nav className="flex items-center gap-1.5 text-xs text-neutral-400 min-w-0">
                <Link to="/" className="hover:text-neutral-600 transition-colors shrink-0">Home</Link>
                <span>/</span>
                <Link to={listingHref} className="hover:text-neutral-600 transition-colors shrink-0">Hotels &amp; Resorts</Link>
                <span className="hidden sm:inline">/</span>
                <span className="hidden sm:inline text-neutral-500 shrink-0">{hotel.city}</span>
                <span>/</span>
                <span className="font-semibold text-neutral-900 truncate max-w-[120px] sm:max-w-none">{hotel.hotel_name}</span>
              </nav>
            </div>

            <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-serif font-bold text-neutral-900 tracking-tight leading-tight">
                  {hotel.hotel_name}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-neutral-600">
                  <MapPin size={16} className="shrink-0 text-[#C6922C]" />
                  <span>
                    {hotel.address ? `${hotel.address}, ` : ""}
                    <strong className="font-semibold text-neutral-800">{hotel.city}</strong>
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#EAE6DF] bg-white p-2.5 px-3.5 lg:p-3 lg:px-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-fit max-w-full shrink-0">
                <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl bg-[#0E131F] text-[#F59E0B] font-bold text-xs lg:text-base">
                  <span>{rating.score}</span>
                  <span className="text-[10px] lg:text-xs ml-0.5">★</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs sm:text-sm font-bold text-neutral-900">{rating.label}</span>
                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-[10px] font-semibold text-[#16874E]">Top 5%</span>
                  </div>
                  <p className="text-[11px] lg:text-xs text-neutral-500 mt-0.5">{rating.reviews} verified guest reviews</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= GALLERY ================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {mediaLoading ? (
            <div className="h-[260px] sm:h-[380px] lg:h-[480px] animate-pulse rounded-2xl bg-neutral-200/80" />
          ) : images.length > 0 ? (
            <div>
              {/* desktop mosaic */}
              <div className="hidden md:block select-none">
                {images.length === 1 && (
                  <div
                    onClick={() => openHotelLightbox(0)}
                    className="booking-gallery-hero h-[380px] lg:h-[480px] rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer shadow-xs"
                    title="Click to view photo"
                  >
                    <img src={images[0].cloudinary_url} alt={`${hotel.hotel_name} - Main`} className="w-full h-full object-cover object-center" />
                    <div className="booking-gallery-scrim" />
                  </div>
                )}

                {images.length === 2 && (
                  <div className="grid grid-cols-2 gap-2 lg:gap-2.5 h-[360px] lg:h-[460px]">
                    {images.map((img, i) => (
                      <div
                        key={img.id || i}
                        onClick={() => openHotelLightbox(i)}
                        className="booking-gallery-hero rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer shadow-xs group"
                        title="Click to enlarge photo"
                      >
                        <img src={img.cloudinary_url} alt={`${hotel.hotel_name} - Photo ${i + 1}`} className="w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-500 ease-out" />
                        <div className="booking-gallery-scrim" />
                      </div>
                    ))}
                  </div>
                )}

                {images.length >= 3 && (
                  <div className="booking-gallery-root">
                    <div className="booking-gallery-top">
                      <div onClick={() => openHotelLightbox(0)} className="booking-gallery-hero rounded-xl lg:rounded-2xl shadow-xs group" title="Click to enlarge photo">
                        <img src={images[0].cloudinary_url} alt={`${hotel.hotel_name} - Main`} className="group-hover:scale-[1.025] transition-transform duration-500 ease-out" />
                        <div className="booking-gallery-scrim" />
                      </div>
                      <div className="booking-gallery-stacked">
                        {images.slice(1, 3).map((img, i) => (
                          <div
                            key={img.id || i}
                            onClick={() => openHotelLightbox(i + 1)}
                            className="booking-gallery-stacked-item rounded-xl lg:rounded-2xl shadow-xs group"
                            title="Click to enlarge photo"
                          >
                            <img src={img.cloudinary_url} alt={`${hotel.hotel_name} - Photo ${i + 2}`} className="group-hover:scale-[1.03] transition-transform duration-500 ease-out" />
                            <div className="booking-gallery-scrim" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {images.length > 3 && (
                      <div
                        className="booking-gallery-bottom"
                        style={{ gridTemplateColumns: `repeat(${Math.min(images.length - 3, 5)}, minmax(0, 1fr))` }}
                      >
                        {images.slice(3, 8).map((img, i) => {
                          const actualIndex = i + 3;
                          const remaining = images.length - 8;
                          return (
                            <div
                              key={img.id || actualIndex}
                              onClick={() => openHotelLightbox(actualIndex)}
                              className="booking-gallery-thumb rounded-xl lg:rounded-2xl shadow-xs group"
                              title="Click to enlarge photo"
                            >
                              <img src={img.cloudinary_url} alt={`${hotel.hotel_name} - Photo ${actualIndex + 1}`} className="group-hover:scale-[1.04] transition-transform duration-500 ease-out" loading="lazy" />
                              <div className="booking-gallery-scrim" />
                              {i === 4 && remaining > 0 && (
                                <div className="booking-gallery-overlay">
                                  <span className="booking-gallery-overlay-text">+{remaining} photos</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* mobile carousel */}
              <div className="block md:hidden space-y-3 select-none">
                <div
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") { e.preventDefault(); previousImage(); }
                    else if (e.key === "ArrowRight") { e.preventDefault(); nextImage(); }
                  }}
                  onClick={() => openHotelLightbox(selectedImage)}
                  className="hotel-gallery-frame relative w-full overflow-hidden rounded-2xl border-0 bg-transparent shadow-none cursor-pointer"
                  aria-label={`Photo gallery for ${hotel.hotel_name}. Tap to enlarge.`}
                >
                  <div
                    className="hotel-gallery-main relative w-full h-full min-w-0 min-h-0 flex items-center justify-center overflow-hidden bg-transparent"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {mainLoading && <div className="absolute inset-0 animate-pulse bg-neutral-200/80" />}
                    <img
                      key={currentImage}
                      src={currentImage}
                      alt={`${hotel.hotel_name} - Photo ${selectedImage + 1} of ${images.length}`}
                      onLoad={() => setMainLoading(false)}
                      onError={() => setMainLoading(false)}
                      className="block w-full h-full object-contain object-center rounded-2xl transition-opacity duration-200"
                      loading="eager"
                    />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button type="button" onClick={(e) => { e.stopPropagation(); previousImage(); }} className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-md active:scale-95 transition cursor-pointer" aria-label="Previous photo">
                        <ChevronLeft size={18} className="stroke-[2.2]" />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-md active:scale-95 transition cursor-pointer" aria-label="Next photo">
                        <ChevronRight size={18} className="stroke-[2.2]" />
                      </button>
                      <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md border border-white/15">
                        <span className="text-[#D7A441]">{selectedImage + 1}</span>
                        <span className="text-white/60">/</span>
                        <span>{images.length}</span>
                      </div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                    {images.map((image, index) => (
                      <button
                        key={image.id || index}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${selectedImage === index ? "border-[#D7A441] ring-2 ring-[#D7A441]/40" : "border-transparent opacity-65 hover:opacity-100"
                          }`}
                      >
                        <img src={image.cloudinary_url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-[300px] sm:h-[360px] flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-neutral-200 bg-[#F5F5F5] text-neutral-400">
              <BedDouble size={40} className="mb-2 text-neutral-300 stroke-1" />
              <p className="text-sm font-medium">Hotel photography coming soon</p>
            </div>
          )}
        </section>

        {/* ================= YOUR HOURLY STAY ================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          {notice && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900" role="status">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#B88428]" />
              <p className="flex-1">{notice}</p>
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss" className="shrink-0 cursor-pointer text-amber-700 hover:text-amber-900">
                <X size={14} />
              </button>
            </div>
          )}

          {/* desktop */}
          <div className="hidden sm:block rounded-3xl border border-[#EAE1D2] bg-[#FFFDF9] p-6 lg:px-8 shadow-[0_4px_24px_rgba(180,140,75,0.06)]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[2.5px] bg-[#9C7335] rounded-full" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">Your Hourly Stay</span>
              </div>
              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-full border border-[#D7A441]/60 bg-white px-4 py-2 text-xs font-bold text-[#966A1E] hover:bg-[#FAF5EB] transition cursor-pointer"
              >
                <Pencil size={13} />
                Modify search
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-5">
              <StayItem icon={CalendarDays} label="Stay Date" value={formatLongDate(stayDate)} />
              <StayItem icon={Clock} label="Check-in" value={formatTime12(startTime)} />
              <StayItem icon={Timer} label="Duration" value={duration ? `${duration} Hours` : "Choose a package"} />
              <StayItem icon={Clock} label="Expected Check-out" value={checkoutTime || "—"} hint={!duration ? "Shown once a package is chosen" : undefined} />
              <StayItem icon={Users} label="Guests" value={guestLabel} />
            </div>
            <p className="mt-4 border-t border-[#EDE7DC] pt-3 text-xs text-neutral-500">{packageNote}</p>
          </div>

          {/* mobile */}
          <div className="sm:hidden rounded-3xl border border-[#EAE1D2] bg-[#FFFDF9] p-4 shadow-[0_4px_24px_rgba(180,140,75,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-[2.5px] bg-[#9C7335] rounded-full" />
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-800">Your Hourly Stay</span>
              </div>
              <button type="button" onClick={openModal} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#966A1E] cursor-pointer">
                <Pencil size={12} />
                Modify
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Stay Date", formatShortDate(stayDate)],
                ["Check-in", formatTime12(startTime)],
                ["Duration", duration ? `${duration} Hours` : "Choose below"],
                ["Check-out", checkoutTime || "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#EDE7DC] bg-white px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
                  <p className="mt-0.5 text-sm font-bold text-neutral-900 font-serif">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#EDE7DC] bg-white px-3 py-2">
              <Users size={15} className="text-[#9C7335]" />
              <span className="text-sm font-bold text-neutral-900">{guestLabel}</span>
            </div>
            <p className="mt-3 text-[11px] text-neutral-500">{packageNote}</p>
          </div>
        </section>

        {/* ================= ROOMS ================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">Select Accommodation</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF5EB] border border-[#D7A441]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#966A1E]">
                  <Users size={12} className="text-[#D7A441]" />
                  {guestLabel}
                </span>
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-serif">Choose your room</h2>
            </div>
            {fittingViews.length > 0 && fittingViews.length < roomViews.length && (
              <button type="button" onClick={() => setShowAllRooms((v) => !v)} className="text-xs font-semibold text-[#B88428] hover:underline cursor-pointer">
                {showAllRooms ? `Show rooms for ${guests} guests (${fittingViews.length})` : `Show all room types (${roomViews.length})`}
              </button>
            )}
          </div>

          {bookError && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 text-xs sm:text-sm text-red-700" role="alert">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1">{bookError}</p>
              <button type="button" onClick={() => setBookError("")} aria-label="Dismiss" className="cursor-pointer"><X size={14} /></button>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {roomsLoading ? (
              [1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-3xl border border-neutral-200/80 bg-white" />)
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-500 shadow-sm">
                No room categories are currently listed for this hotel.
              </div>
            ) : (
              displayedViews.map((view) => {
                const { cat } = view;
                const photos = roomMedia[cat.id] || [];
                const amenities = roomAmenities[cat.id] || [];
                const selectedDuration = selectedPackages[cat.id] ?? selectedPackages.__all ?? null;
                const selectedPackage = view.perDur.find((p) => p.d === selectedDuration) || null;
                const canBook = Boolean(selectedPackage?.bookable && view.accommodates);

                let status = null;
                if (!availLoading && selectedPackage) {
                  if (selectedPackage.error || selectedPackage.available < 1) status = "Not available for selected time";
                  else if (!(selectedPackage.price > 0)) status = "Hourly price unavailable right now";
                }

                return (
                  <article key={cat.id} className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch">
                    {/* photo */}
                    <div
                      className={`relative md:w-72 lg:w-80 shrink-0 bg-neutral-100 min-h-[200px] md:min-h-full overflow-hidden group ${photos.length ? "cursor-pointer" : ""}`}
                      onClick={() => photos.length && openRoomLightbox(cat.category_name, photos, 0)}
                    >
                      {photos.length > 0 ? (
                        <>
                          <img src={photos[0]} alt={cat.category_name} className="h-full w-full object-cover min-h-[200px] transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white border border-white/20">
                            <Images size={13} className="text-[#D7A441]" />
                            <span>{photos.length} {photos.length === 1 ? "Photo" : "Photos"}</span>
                          </div>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white border border-white/30 flex items-center gap-1.5">
                              <Sparkles size={13} className="text-[#D7A441]" />
                              View Photos
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full min-h-[200px] flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-[#171922] text-white p-6 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D7A441] mb-2">
                            <BedDouble size={26} strokeWidth={1.8} />
                          </div>
                          <p className="text-sm font-semibold">{cat.category_name}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{hotel.hotel_name}</p>
                        </div>
                      )}
                    </div>

                    {/* info + price */}
                    <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-4">
                            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#B88428]">
                              <BedDouble size={24} strokeWidth={1.8} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">{cat.category_name}</h3>
                              {cat.description?.trim() && (
                                <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-600">{cat.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 px-3 py-1 text-xs font-medium text-neutral-700">
                              <Users size={13} className="text-[#D7A441]" />
                              Up to {view.maxGuests} {view.maxGuests === 1 ? "guest" : "guests"}
                            </span>
                            {view.accommodates ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-semibold text-[#966A1E]">
                                <Check size={12} className="text-[#D7A441]" />
                                Fits {guests} {guests === 1 ? "guest" : "guests"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700">
                                Too small for {guests} guests
                              </span>
                            )}
                            {availLoading ? (
                              <span className="inline-block h-6 w-36 animate-pulse rounded-full bg-neutral-200" />
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${view.availableMax > 0
                                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                    : "bg-neutral-100 border border-neutral-200 text-neutral-400"
                                  }`}
                              >
                                {view.availableMax > 0 && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  </span>
                                )}
                                {view.availableMax > 0
                                  ? `${view.availableMax}${view.total ? ` of ${view.total}` : ""} rooms available`
                                  : "No rooms available for selected time"}
                              </span>
                            )}
                          </div>

                          {amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {amenities.slice(0, 5).map((a) => {
                                const Icon = getAmenityIcon(a.icon);
                                return (
                                  <span key={a.id} className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-medium text-[#2C2C2E]">
                                    <Icon size={12} className="text-[#C59B27]" />
                                    {a.name}
                                  </span>
                                );
                              })}
                              {amenities.length > 5 && (
                                <span className="inline-flex items-center rounded-lg border border-[#EBE3D5] bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                                  +{amenities.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* hourly price + CTA */}
                        <div className="flex flex-col shrink-0 gap-4 border-t border-neutral-200/70 pt-5 lg:min-w-[300px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                          {availLoading ? (
                            <div className="space-y-2">
                              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
                              <div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
                            </div>
                          ) : (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Choose a package</p>
                              <div className="mt-1.5 flex gap-2">
                                {view.perDur.map((p) => {
                                  const availableForPackage = p.available > 0 && p.price > 0 && view.accommodates;
                                  const selected = selectedDuration === p.d;
                                  return (
                                    <button
                                      key={p.d}
                                      type="button"
                                      disabled={!availableForPackage}
                                      onClick={() => setSelectedPackages((prev) => ({ ...prev, [cat.id]: p.d }))}
                                      aria-pressed={selected}
                                      className={`flex-1 rounded-xl border px-3 py-2 text-center transition ${!availableForPackage
                                          ? "border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed"
                                          : selected
                                            ? "border-[#D7A441] bg-[#FAF5EB] ring-1 ring-[#D7A441]/40 cursor-pointer"
                                            : "border-[#EADBCC] bg-white hover:border-[#D7A441] hover:bg-[#FAF5EB] cursor-pointer"
                                        }`}
                                    >
                                      <span className="block text-base font-bold text-neutral-900">
                                        {p.price > 0 ? `₹${p.price.toLocaleString("en-IN")}` : "—"}
                                      </span>
                                      <span className="block text-[11px] font-semibold text-[#B88428]">
                                        {p.d} Hours{p.available < 1 || !(p.price > 0) ? " · Not available for selected time" : ""}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={!selectedDuration || !canBook || availLoading}
                            onClick={() => canBook && selectedDuration && handleBook(view, selectedDuration)}
                            className={`group inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-xs sm:text-sm font-bold shadow-md transition-all w-full ${selectedDuration && canBook && !availLoading
                                ? "bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] hover:from-[#C89532] hover:to-[#A7751E] text-neutral-950 hover:shadow-xl cursor-pointer"
                                : "cursor-not-allowed bg-neutral-200 text-neutral-400 shadow-none"
                              }`}
                          >
                            <span>
                              {!selectedDuration
                                ? "Select a package to book a room"
                                : !view.accommodates
                                  ? "Doesn't fit your party"
                                  : canBook
                                    ? "Book Room"
                                    : selectedPackage?.available < 1
                                      ? "Not available for selected time"
                                      : "Unavailable"}
                            </span>
                            {selectedDuration && canBook && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            {!roomsLoading && !availLoading && categories.length > 0 && roomViews.every((v) => v.availableMax < 1) && (
              <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-8 text-center">
                <h4 className="text-base sm:text-lg font-bold text-neutral-900">No rooms available for this slot</h4>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                  Every room is taken for {formatLongDate(stayDate)} at {formatTime12(startTime)}. Try another time or date.
                </p>
                <button type="button" onClick={openModal} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0B1527] px-4 py-2 text-xs font-semibold text-[#F3CF7A] cursor-pointer">
                  <Pencil size={13} />
                  Modify search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-4">
          <div className="rounded-3xl border border-[#EDE7DC] bg-[#FFFDF9] p-5 sm:p-7 md:p-9 shadow-[0_4px_24px_rgba(180,140,75,0.04)]">
            <div className="flex items-center gap-2.5">
              <div className="h-[2px] w-6 bg-[#C59B27] rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C59B27]">Overview</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1527] font-serif leading-tight">About {hotel.hotel_name}</h2>
            <p className="mt-4 text-xs sm:text-sm md:text-base leading-relaxed text-neutral-600 max-w-3xl">
              {hotel.description?.trim() || "The property hasn't added a description yet."}
            </p>
          </div>
        </section>

        {/* ================= LOCATION + AMENITIES ================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="rounded-3xl border border-[#EDE7DC] bg-[#FFFDF9] p-5 sm:p-7 md:p-8 shadow-[0_4px_24px_rgba(180,140,75,0.04)]">
            <div className="flex items-center gap-2.5">
              <div className="h-[2px] w-6 bg-[#C59B27] rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C59B27]">Location &amp; Facilities</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1527] font-serif leading-tight">Find us easily</h2>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#EDE7DC] bg-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF3E6] border border-[#F2E8D5] text-[#B88428]">
                      <MapPin size={24} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">Property Location</span>
                      <h3 className="text-base sm:text-lg font-bold text-[#0B1527] font-serif leading-snug">{hotel.hotel_name}</h3>
                    </div>
                  </div>
                  <div className="my-5 border-t border-[#EDE7DC]/80" />
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#8E8E93] mb-1.5">Address</p>
                  <p className="text-sm sm:text-base text-[#0B1527] font-medium leading-relaxed">
                    {locationData?.displayAddress || <span className="italic text-neutral-400">Address shared after booking.</span>}
                  </p>
                  {hotel.city && (
                    <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#FAF3E6] border border-[#F2E8D5] px-3.5 py-1 text-xs font-semibold text-[#8B651C]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#B88428]" />
                      {hotel.city}
                    </span>
                  )}
                </div>
                <div className="mt-8 flex flex-col gap-2.5">
                  <a href={locationData?.directionsUrl || "#"} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B1527] hover:bg-black px-5 py-3.5 text-xs sm:text-sm font-bold text-white transition shadow-sm active:scale-[0.98]">
                    <Navigation size={15} className="text-[#D7A441]" />
                    <span>Get Directions</span>
                    <ExternalLink size={13} className="text-white/60 ml-0.5" />
                  </a>
                  <a href={locationData?.mapsUrl || "#"} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#EDE7DC] bg-[#FAF8F5] hover:bg-[#F4EFE6] px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#0B1527] transition active:scale-[0.98]">
                    <MapPin size={15} className="text-[#4285F4]" />
                    <span>View on Google Maps</span>
                    <ExternalLink size={13} className="text-[#8E8E93] ml-0.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 h-[280px] sm:h-[320px] lg:h-full min-h-[280px] rounded-2xl overflow-hidden border border-[#EDE7DC] bg-[#FAF8F5] shadow-xs">
                {locationData?.embedMapUrl ? (
                  <iframe src={locationData.embedMapUrl} title={`${hotel.hotel_name} Location Map`} className="w-full h-full border-0 block" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                    <MapPin size={24} className="mb-2" />
                    <p className="text-sm font-medium text-neutral-600">Map preview unavailable</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#EDE7DC] bg-white p-5 sm:p-6 md:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#B88428]">Facilities</p>
                  <h3 className="mt-0.5 text-base sm:text-lg md:text-xl font-bold text-[#0B1527] font-serif">Property Amenities</h3>
                </div>
                {uniqueAmenities.length > 8 && (
                  <button type="button" onClick={() => setShowAllAmenities((v) => !v)} className="inline-flex items-center gap-1 text-xs font-bold text-[#B88428] hover:underline cursor-pointer">
                    <span>{showAllAmenities ? "Show less" : `All (${uniqueAmenities.length})`}</span>
                    <ChevronRight size={14} className={`transition-transform duration-200 ${showAllAmenities ? "-rotate-90" : ""}`} />
                  </button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:gap-2.5 items-center">
                {roomsLoading ? (
                  [1, 2, 3, 4].map((i) => <span key={i} className="h-9 w-28 animate-pulse rounded-xl bg-neutral-200" />)
                ) : visibleAmenities.length > 0 ? (
                  visibleAmenities.map((a) => {
                    const Icon = getAmenityIcon(a.icon);
                    return (
                      <span key={a.id} className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-[#EBE3D5] bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2C2C2E]">
                        <Icon size={14} className="text-[#C59B27] shrink-0 stroke-[2]" />
                        <span>{a.name}</span>
                      </span>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-500 italic">No amenities have been listed for this property yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= MODIFY SEARCH MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Modify hourly search">
          <div className="absolute inset-0 bg-[#0B1527]/55 backdrop-blur-[1px]" onClick={() => setModalOpen(false)} />
          <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-[#EADBCC]">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-5 sm:px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B88428]">Hourly stay</p>
                <h2 className="text-xl font-bold text-[#0B1527] font-serif">Modify search</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 cursor-pointer" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-5">
              <div className="relative">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-400">Stay date</label>
                <button
                  type="button"
                  onClick={() => setCalendarOpen((v) => !v)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[#EADBCC] bg-white px-3.5 py-3 text-left hover:border-[#D7A441] focus:outline-none focus:ring-2 focus:ring-[#D7A441]/20"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E6] text-[#9C7335]"><CalendarDays size={17} /></span>
                  <span className="flex-1 text-sm font-semibold text-[#0B1527]">{formatLongDate(tDate)}</span>
                  <ChevronRight size={17} className={`text-neutral-400 transition-transform ${calendarOpen ? "rotate-90" : ""}`} />
                </button>
                {calendarOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-[#EADBCC] bg-white p-2 sm:p-3 lg:p-2 shadow-xl lg:max-w-[440px] lg:left-1/2 lg:-translate-x-1/2">
                    <div className="flex items-center justify-between gap-2">
                      <button type="button" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))} disabled={calendarYear === todayDate.getFullYear() && calendarMonthIndex <= todayDate.getMonth()} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer" aria-label="Previous month"><ChevronLeft size={17} /></button>
                      <p className="text-sm font-bold text-[#0B1527]">{MONTHS[calendarMonthIndex]} {calendarYear}</p>
                      <button type="button" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 cursor-pointer" aria-label="Next month"><ChevronRight size={17} /></button>
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-0.5 lg:gap-1 text-center">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="py-1 text-[10px] font-semibold text-neutral-400">{d}</span>)}
                      {calendarCells.map((day, i) => {
                        if (!day) return <span key={`blank-${i}`} />;
                        const value = dateFromParts(day);
                        const disabled = value < today;
                        const selected = value === tDate;
                        return (
                          <button key={value} type="button" disabled={disabled} onClick={() => changeTDate(value)} className={`h-9 lg:h-8 rounded-lg text-xs font-medium transition ${selected ? "bg-[#D7A441] text-neutral-950 font-bold" : disabled ? "text-neutral-300 cursor-not-allowed" : "text-neutral-700 hover:bg-[#FAF5EB] cursor-pointer"}`}>
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2">
                      <button type="button" onClick={() => changeTDate(today)} className="text-xs font-semibold text-[#9C7335] hover:underline cursor-pointer">Today</button>
                      <button type="button" onClick={() => setCalendarOpen(false)} className="text-xs font-semibold text-[#9C7335] hover:underline cursor-pointer">Done</button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-neutral-400">Check-in time</p>
                {tSlots.length === 0 ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">No more check-in times today. Please choose another date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {tSlots.map((slot) => {
                      const selected = tTime === slot;
                      return (
                        <button key={slot} type="button" onClick={() => changeTTime(slot)} aria-pressed={selected} className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition ${selected ? "border-[#D7A441] bg-[#FAF5EB] text-[#966A1E] ring-1 ring-[#D7A441]/30" : "border-[#EADBCC] bg-white text-neutral-700 hover:border-[#D7A441] cursor-pointer"}`}>
                          {formatTime12(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Duration</p>
                <div className="flex gap-2">
                  {[null, ...PACKAGES].map((d) => {
                    const disabled = d === null ? tAllowed.length === 1 : !tAllowed.includes(d);
                    const active = tDuration === d;
                    return (
                      <button
                        key={d ?? "any"}
                        type="button"
                        disabled={disabled}
                        onClick={() => setTDuration(d)}
                        className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${disabled
                            ? "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                            : active
                              ? "border-[#D7A441] bg-[#FAF5EB] text-[#966A1E] cursor-pointer"
                              : "border-[#EADBCC] bg-white text-neutral-700 hover:border-[#D7A441]/60 cursor-pointer"
                          }`}
                      >
                        {d ? `${d} Hours` : "Both"}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-[#8B651B]">
                  {tAllowed.length === 1
                    ? `After 1:00 PM, only the ${tAllowed[0]}-hour package is available.`
                    : "Check-ins up to and including 1:00 PM can choose either package."}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Guests</p>
                <div className="flex items-center justify-between rounded-2xl border border-[#EADBCC] px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Users size={16} className="text-[#9C7335]" />
                    <span className="text-sm font-semibold text-[#0B1527]">{tGuests} {tGuests === 1 ? "Guest" : "Guests"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTGuests((g) => Math.max(1, g - 1))} disabled={tGuests <= 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADBCC] text-neutral-700 hover:border-[#D7A441] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" aria-label="Fewer guests">
                      <Minus size={14} />
                    </button>
                    <button type="button" onClick={() => setTGuests((g) => Math.min(maxGuestsAllowed, g + 1))} disabled={tGuests >= maxGuestsAllowed} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EADBCC] text-neutral-700 hover:border-[#D7A441] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer" aria-label="More guests">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#EDE7DC] bg-[#FAF8F5] px-4 py-3 text-xs text-neutral-600">
                {tDuration ? (
                  <>
                    Check-out <strong className="text-neutral-900">{formatTime12(tTime, tDuration)}</strong> on {formatLongDate(tDate)}
                  </>
                ) : (
                  "Choose a package to see your check-out time."
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#F2E8DC] px-5 sm:px-6 py-4">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-[#EADBCC] px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-700 cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={applyModify}
                disabled={!tValid}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Update availability
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          title={lightbox.title}
          onClose={closeLightbox}
          onIndex={setLightboxIndex}
        />
      )}

      <Footer />
    </div>
  );
}