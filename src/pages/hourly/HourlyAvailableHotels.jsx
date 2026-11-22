import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BedDouble,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  LayoutGrid,
  List,
  MapPin,
  Monitor,
  SlidersHorizontal,
  Sparkles,
  Star,
  Timer,
  Users,
  X,
} from "lucide-react";

import {
  getHotels,
  getHotelMedia,
  getRoomCategories,
  getAvailabilityV2,
  calculateHourlyRoomPrice,
  getCategoryOccupancyLimits,
  canCategoryAccommodate,
} from "../../services/hotelService.js";

import Footer from "../../components/Footer";

// --------------------------------------------------
// CONSTANTS & HELPERS
// --------------------------------------------------

const PACKAGES = [3, 6];
// Hourly check-in window used by the existing hourly defaults (9 AM – 3 PM)
const FIRST_START_HOUR = 9;
const LAST_START_HOUR = 15;

const sortOptions = [
  { value: "recommended", label: "Recommended", description: "Best match for your search" },
  { value: "priceLow", label: "Price: Low to High", description: "Most affordable first" },
  { value: "priceHigh", label: "Price: High to Low", description: "Luxury & premium first" },
];

const capacityOptions = [
  { value: 0, label: "Any" },
  { value: 2, label: "2+ guests" },
  { value: 3, label: "3+ guests" },
  { value: 4, label: "4+ guests" },
];

// Package rules by check-in time:
//  - exactly 12:00 PM  -> 6-hour package only
//  - after 12:00 PM    -> 3-hour package only
//  - before 12:00 PM   -> no restriction beyond the existing hourly API
//    (availability + pricing from the API decide). Confirm if you have a stricter rule.
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

function getStartSlots(stayDate, currentValue) {
  const now = new Date();
  const isToday = stayDate === formatDateValue(now);
  let first = FIRST_START_HOUR;
  if (isToday) {
    const next = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
    first = Math.max(FIRST_START_HOUR, next);
  }
  const slots = [];
  for (let h = first; h <= LAST_START_HOUR; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  // keep a value that came from the URL so the selection is never silently changed
  if (currentValue && !slots.includes(currentValue)) slots.push(currentValue);
  return slots.sort();
}

function normalizeLocation(value) {
  return String(value || "").toLowerCase().trim().replace(/[-_]/g, " ").replace(/\s+/g, " ");
}

function formatTime12(time, addHours = 0) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  const total = ((h || 0) + addHours) % 24;
  const suffix = total >= 12 ? "PM" : "AM";
  const hour12 = total % 12 === 0 ? 12 : total % 12;
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

function getStarlightRating(id) {
  if (!id) return { score: "4.8", reviews: 142 };
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const presets = [4.7, 4.8, 4.9, 4.6, 4.8, 5.0, 4.7, 4.9, 4.8, 4.6];
  return {
    score: presets[absHash % presets.length].toFixed(1),
    reviews: 68 + (absHash % 160),
  };
}

function safeAccommodates(cat, guests) {
  if (!cat) return true; // no occupancy data -> do not exclude
  try {
    return canCategoryAccommodate(cat, guests, 1) !== false;
  } catch {
    return true;
  }
}

function safeMaxGuests(cat) {
  if (!cat) return 0;
  try {
    return Number(getCategoryOccupancyLimits(cat)?.maxGuests) || 0;
  } catch {
    return 0;
  }
}

const inputClass =
  "w-full bg-transparent text-xs sm:text-[13px] font-bold text-[#0B1527] outline-none cursor-pointer appearance-none";

function Field({ icon: Icon, label, children, className = "" }) {
  return (
    <label
      className={`flex items-center gap-2.5 rounded-2xl border border-[#F2E8DC] bg-white px-3 py-2 min-w-0 hover:border-[#D7A441] focus-within:border-[#D7A441] focus-within:ring-2 focus-within:ring-[#D7A441]/20 transition ${className}`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </span>
        {children}
      </div>
    </label>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[#F2E8DC] bg-white px-3 py-2 min-w-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</span>
        <span className="block truncate text-xs sm:text-[13px] font-bold text-[#0B1527]">{value}</span>
      </div>
    </div>
  );
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function HourlyAvailableHotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaults = useMemo(() => getHourlyDefaults(), []);

  // ---- URL-driven search state ----
  const hotelId = searchParams.get("hotel") || "";
  const stayDate = searchParams.get("stayDate") || searchParams.get("date") || defaults.stayDate;
  const startTime = searchParams.get("startTime") || defaults.startTime;
  const guests = Math.max(1, Number(searchParams.get("guests")) || 2);
  const location =
    searchParams.get("location") || searchParams.get("destination") || searchParams.get("city") || "";

  // Packages allowed for this check-in time, and the duration actually in effect.
  // null = customer has not chosen and more than one package is allowed.
  const rawDuration = Number(searchParams.get("duration"));
  const allowedDurations = getAllowedDurations(startTime);
  const requestedDuration = PACKAGES.includes(rawDuration) ? rawDuration : null;
  const selectedDuration =
    requestedDuration && allowedDurations.includes(requestedDuration)
      ? requestedDuration
      : allowedDurations.length === 1
      ? allowedDurations[0]
      : null;
  const activeDurations = selectedDuration ? [selectedDuration] : allowedDurations;

  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
          });
          // legacy aliases would shadow the canonical names
          if ("stayDate" in updates) next.delete("date");
          if ("location" in updates) {
            next.delete("destination");
            next.delete("city");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Changing the check-in time re-validates the package in the same update
  const handleTimeChange = (next) => {
    const allowed = getAllowedDurations(next);
    const updates = { startTime: next };
    if (requestedDuration && !allowed.includes(requestedDuration)) {
      updates.duration = allowed.length === 1 ? allowed[0] : "";
    }
    setPkgChoice({});
    setPkgHint({});
    updateParams(updates);
  };

  // A pasted / old URL with an invalid time + package combo is corrected in the URL
  useEffect(() => {
    if (requestedDuration && !allowedDurations.includes(requestedDuration)) {
      updateParams({
        duration: allowedDurations.length === 1 ? allowedDurations[0] : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, requestedDuration]);

  // ---- local UI / filter state ----
  const [enabledHotels, setEnabledHotels] = useState(null);
  const [results, setResults] = useState([]);
  const [hotelImages, setHotelImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(null); // null = no upper limit
  const [minCapacity, setMinCapacity] = useState(0);
  const [cityQuery, setCityQuery] = useState("");

  const [sortBy, setSortBy] = useState("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const mobileSortRef = useRef(null);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 1024 ? "grid" : "list"
  );
  const [desktopOnlyToast, setDesktopOnlyToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const [expandedRooms, setExpandedRooms] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [pkgChoice, setPkgChoice] = useState({});
  const [pkgHint, setPkgHint] = useState({});

  // ---- view mode / toast / outside click ----
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setViewMode((v) => (v === "list" ? "grid" : v));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => () => toastTimeoutRef.current && clearTimeout(toastTimeoutRef.current), []);

  useEffect(() => {
    const onDown = (e) => {
      const inDesktop = sortRef.current?.contains(e.target);
      const inMobile = mobileSortRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setSortOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileFiltersOpen]);

  const handleListViewClick = () => {
    if (window.innerWidth < 1024) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setDesktopOnlyToast(true);
      toastTimeoutRef.current = setTimeout(() => setDesktopOnlyToast(false), 3500);
      return;
    }
    setViewMode("list");
  };

  // --------------------------------------------------
  // LOAD HOURLY-ENABLED HOTELS (once)
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await getHotels();
        if (!cancelled) {
          setEnabledHotels((all || []).filter((h) => h.is_hourly_active === true));
        }
      } catch (err) {
        console.error("HOURLY HOTELS LOAD ERROR:", err);
        if (!cancelled) {
          setError(err.message || "Unable to load hourly availability.");
          setEnabledHotels([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cityOptions = useMemo(() => {
    const set = new Set();
    (enabledHotels || []).forEach((h) => h.city && set.add(String(h.city).trim()));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [enabledHotels]);

  // --------------------------------------------------
  // LOAD AVAILABILITY + PRICES (hourly APIs only)
  // Re-runs only when date / time / package / destination / hotel change.
  // --------------------------------------------------

  useEffect(() => {
    if (enabledHotels === null) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const searchLocation = normalizeLocation(location);
        const filtered =
          !searchLocation || searchLocation === "all"
            ? enabledHotels
            : enabledHotels.filter((hotel) =>
                [hotel.hotel_name, hotel.city, hotel.address, hotel.location]
                  .filter(Boolean)
                  .map(normalizeLocation)
                  .some((v) => v.includes(searchLocation) || searchLocation.includes(v))
              );

        const toCheck = hotelId ? filtered.filter((h) => h.id === hotelId) : filtered;
        const durations = selectedDuration ? [selectedDuration] : PACKAGES;

        const settled = await Promise.all(
          toCheck.map(async (hotel) => {
            try {
              const [categories, pkgEntries] = await Promise.all([
                getRoomCategories(hotel.id).catch(() => []),
                Promise.all(
                  durations.map(async (d) => {
                    try {
                      const data = await getAvailabilityV2({
                        hotelId: hotel.id,
                        stayType: "hourly",
                        checkInDate: stayDate,
                        checkOutDate: stayDate,
                        startTime,
                        durationHours: d,
                      });
                      const available = (data || []).filter((r) => Number(r.available_rooms) > 0);
                      const priced = await Promise.all(
                        available.map(async (room) => {
                          try {
                            const pricing = await calculateHourlyRoomPrice({
                              hotelId: hotel.id,
                              roomCategoryId: room.room_category_id,
                              stayDate,
                              durationHours: d,
                            });
                            const price = Number(pricing?.hourly_price);
                            return { ...room, price: price > 0 ? price : null };
                          } catch {
                            return { ...room, price: null };
                          }
                        })
                      );
                      return [d, priced];
                    } catch (err) {
                      console.error(`HOURLY ${d}H AVAILABILITY ERROR: ${hotel.hotel_name}`, err);
                      return [d, []];
                    }
                  })
                ),
              ]);

              const packages = Object.fromEntries(pkgEntries);
              const hasRooms = durations.some((d) => (packages[d] || []).length > 0);
              return hasRooms ? { ...hotel, categories: categories || [], packages } : null;
            } catch (err) {
              console.error(`HOURLY HOTEL ERROR: ${hotel.hotel_name}`, err);
              return null; // one hotel failing must not break the rest
            }
          })
        );

        if (cancelled) return;
        const found = settled.filter(Boolean);
        setResults(found);
        setLoading(false);

        // images load afterwards so they never block the listing
        const imageEntries = await Promise.all(
          found.map(async (hotel) => {
            try {
              const media = await getHotelMedia(hotel.id);
              return [hotel.id, media?.find((m) => m.media_type === "image")?.cloudinary_url || null];
            } catch {
              return [hotel.id, null];
            }
          })
        );
        if (!cancelled) setHotelImages((prev) => ({ ...prev, ...Object.fromEntries(imageEntries) }));
      } catch (err) {
        console.error("HOURLY SEARCH ERROR:", err);
        if (!cancelled) {
          setError(err.message || "Unable to load hourly availability.");
          setResults([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabledHotels, stayDate, startTime, selectedDuration, location, hotelId]);

  // --------------------------------------------------
  // DERIVE CARDS (client-side filters: guests, capacity, price)
  // --------------------------------------------------

  const decorated = useMemo(() => {
    return results
      .map((hotel) => {
        const catMap = new Map((hotel.categories || []).map((c) => [c.id, c]));

        const packages = {};
        activeDurations.forEach((d) => {
          const rooms = (hotel.packages[d] || []).filter((room) => {
            const cat = catMap.get(room.room_category_id);
            if (!safeAccommodates(cat, guests)) return false;
            if (minCapacity > 0) {
              const max = safeMaxGuests(cat);
              if (max && max < minCapacity) return false;
            }
            return true;
          });
          const prices = rooms.map((r) => r.price).filter((p) => p > 0);
          packages[d] = {
            duration: d,
            rooms,
            price: prices.length ? Math.min(...prices) : null,
          };
        });

        const hasRooms = activeDurations.some((d) => packages[d].rooms.length > 0);
        if (!hasRooms) return null;

        // merged room chips across the displayed packages
        const roomMap = new Map();
        activeDurations.forEach((d) =>
          packages[d].rooms.forEach((room) => {
            const cat = catMap.get(room.room_category_id);
            const existing = roomMap.get(room.room_category_id);
            const left = Number(room.available_rooms) || 0;
            if (!existing || left > existing.left) {
              roomMap.set(room.room_category_id, {
                id: room.room_category_id,
                name: cat?.category_name || room.category_name || room.room_category_name || "Room",
                left,
                maxGuests: safeMaxGuests(cat),
              });
            }
          })
        );

        const allPrices = activeDurations.map((d) => packages[d].price).filter((p) => p > 0);
        return {
          ...hotel,
          view: packages,
          roomChips: [...roomMap.values()],
          sortPrice: allPrices.length ? Math.min(...allPrices) : null,
          totalLeft: [...roomMap.values()].reduce((s, r) => s + r.left, 0),
        };
      })
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, guests, minCapacity, selectedDuration]);

  const priceBound = useMemo(() => {
    const prices = decorated.flatMap((h) =>
      activeDurations.map((d) => h.view[d].price).filter((p) => p > 0)
    );
    const max = prices.length ? Math.max(...prices) : 0;
    return Math.max(1000, Math.ceil(max / 500) * 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decorated]);

  const effectiveMax = priceMax === null ? priceBound : Math.min(priceMax, priceBound);
  const priceActive = priceMin > 0 || (priceMax !== null && priceMax < priceBound);

  const visibleHotels = useMemo(() => {
    const list = decorated.filter((hotel) => {
      const prices = activeDurations.map((d) => hotel.view[d].price).filter((p) => p > 0);
      if (!prices.length) return !priceActive || priceMin === 0;
      return prices.some((p) => p >= priceMin && p <= effectiveMax);
    });

    if (sortBy === "priceLow") {
      list.sort((a, b) => (a.sortPrice ?? Infinity) - (b.sortPrice ?? Infinity));
    } else if (sortBy === "priceHigh") {
      list.sort((a, b) => (b.sortPrice ?? 0) - (a.sortPrice ?? 0));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decorated, priceMin, effectiveMax, priceActive, sortBy, selectedDuration]);

  const activeFilterCount =
    (location || hotelId ? 1 : 0) + (priceActive ? 1 : 0) + (minCapacity > 0 ? 1 : 0);

  function clearFilters() {
    updateParams({ location: "", hotel: "" });
    setPriceMin(0);
    setPriceMax(null);
    setMinCapacity(0);
    setCityQuery("");
    setSortBy("recommended");
  }

  const selectedHotel = hotelId ? enabledHotels?.find((h) => h.id === hotelId) : null;
  const slots = getStartSlots(stayDate, startTime);
  const today = formatDateValue(new Date());
  const startLabel = formatTime12(startTime);
  const guestLabel = `${guests} ${guests === 1 ? "guest" : "guests"}`;

  // --------------------------------------------------
  // SHARED CONTROL GROUPS
  // --------------------------------------------------

  const summaryCards = (
    <>
      <SummaryCard icon={MapPin} label="Destination" value={location && normalizeLocation(location) !== "all" ? location : "All Locations"} />
      <SummaryCard icon={Calendar} label="Stay Date" value={stayDate.split("-").reverse().join("-")} />
      <SummaryCard icon={Clock} label="Check-in Time" value={startLabel} />
      <SummaryCard icon={Timer} label="Package" value={selectedDuration ? `${selectedDuration} Hours` : "3 & 6 Hours"} />
      <SummaryCard icon={Users} label="Guests" value={guestLabel} />
    </>
  );

  const priceControl = (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-[#0B1527]">
        <span>₹{priceMin.toLocaleString("en-IN")}</span>
        <span>
          ₹{effectiveMax.toLocaleString("en-IN")}
          {priceMax === null ? "+" : ""}
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        <input
          type="range"
          aria-label="Minimum price"
          min={0}
          max={priceBound}
          step={100}
          value={Math.min(priceMin, priceBound)}
          onChange={(e) => setPriceMin(Math.min(Number(e.target.value), effectiveMax))}
          className="w-full accent-[#C5922C] cursor-pointer"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={0}
          max={priceBound}
          step={100}
          value={effectiveMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), priceMin);
            setPriceMax(v >= priceBound ? null : v);
          }}
          className="w-full accent-[#C5922C] cursor-pointer"
        />
      </div>
    </div>
  );

  const capacityControl = (
    <div className="flex flex-wrap gap-2">
      {capacityOptions.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setMinCapacity(o.value)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
            minCapacity === o.value
              ? "border-[#D7A441] bg-[#FAF5EB] text-[#966A1E]"
              : "border-[#EADBCC] bg-white text-neutral-700 hover:border-[#D7A441]/60"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  const filteredCityChips = cityOptions.filter((c) =>
    normalizeLocation(c).includes(normalizeLocation(cityQuery))
  );

  const startHour = Number(startTime.split(":")[0]) || 0;
  const startMinutes = startHour * 60 + (Number(startTime.split(":")[1]) || 0);
  const packageNote =
    startMinutes === 12 * 60
      ? "Only the 6-hour package is available for a 12:00 PM check-in."
      : startMinutes > 12 * 60
      ? "Only the 3-hour package is available after 12:00 PM."
      : "";

  const sectionTitle = "mb-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400";

  const filterSections = (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className={sectionTitle}>Stay date</h3>
        <Field icon={Calendar} label="Stay Date">
          <input
            type="date"
            className={inputClass}
            min={today}
            value={stayDate}
            onChange={(e) => e.target.value && e.target.value >= today && updateParams({ stayDate: e.target.value })}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h3 className={sectionTitle}>Check-in time</h3>
        <Field icon={Clock} label="Check-in Time">
          <select className={inputClass} value={startTime} onChange={(e) => handleTimeChange(e.target.value)}>
            {slots.map((sl) => (
              <option key={sl} value={sl}>{formatTime12(sl)}</option>
            ))}
          </select>
        </Field>
      </section>

      <section>
        <h3 className={sectionTitle}>Duration</h3>
        <div className="flex gap-2">
          {[null, ...PACKAGES].map((d) => {
            const disabled = d === null ? allowedDurations.length === 1 : !allowedDurations.includes(d);
            const active = selectedDuration === d;
            return (
              <button
                key={d ?? "any"}
                type="button"
                disabled={disabled}
                onClick={() => updateParams({ duration: d ?? "" })}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  disabled
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
        {packageNote && <p className="mt-2 text-[11px] font-medium text-[#8B651B]">{packageNote}</p>}
      </section>

      <section className="space-y-3">
        <h3 className={sectionTitle}>Guests</h3>
        <Field icon={Users} label="Guests">
          <select className={inputClass} value={guests} onChange={(e) => updateParams({ guests: e.target.value })}>
            {Array.from({ length: Math.max(10, guests) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
            ))}
          </select>
        </Field>
      </section>

      <section>
        <h3 className={sectionTitle}>Destination / City</h3>
        <input
          type="search"
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="Search destination"
          className="mb-3 w-full rounded-xl border border-[#EADBCC] px-3.5 py-2 text-xs outline-none focus:border-[#D7A441]"
        />
        <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
          {[null, ...filteredCityChips].map((c) => {
            const active = c === null ? !location : normalizeLocation(location) === normalizeLocation(c);
            return (
              <button
                key={c ?? "all"}
                type="button"
                onClick={() => updateParams({ location: c ?? "", hotel: "" })}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  active ? "border-[#D7A441] bg-[#FAF5EB] text-[#966A1E]" : "border-[#EADBCC] bg-white text-neutral-700 hover:border-[#D7A441]/60"
                }`}
              >
                {c ?? "All Locations"}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className={sectionTitle}>Hourly price range</h3>
        {priceControl}
      </section>

      <section>
        <h3 className={sectionTitle}>Guest occupancy</h3>
        {capacityControl}
      </section>
    </div>
  );

  const sortDropdown = (widthClass) => (
    <div
      className={`absolute right-0 top-full mt-2 z-50 ${widthClass} origin-top-right rounded-2xl border border-neutral-200/90 bg-white/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="px-3 py-1.5 mb-1 border-b border-neutral-100 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sort Stays By</span>
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
                  ? "bg-[#FAF5EB] text-[#966A1E] font-bold border border-[#D7A441]/25"
                  : "text-neutral-700 hover:bg-neutral-50 font-medium"
              }`}
            >
              <div>
                <p className={`text-xs sm:text-sm ${isSelected ? "font-bold text-neutral-950" : "font-medium text-neutral-800"}`}>
                  {option.label}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{option.description}</p>
              </div>
              {isSelected && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C59A45] text-white">
                  <Check size={12} className="stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // --------------------------------------------------
  // HERO (shared by loading + loaded states)
  // --------------------------------------------------

  const hero = (
    <section className="border-b border-[#EADBCC] bg-gradient-to-b from-[#FFFDF9] to-[#FCFCFD]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 pb-6 sm:pb-8">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-[#B88428] transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Hotels &amp; Resorts</span>
        </button>

        <div className="mt-4 flex flex-col xl:flex-row xl:items-end gap-6 xl:gap-8">
          <div className="xl:w-[30%] shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5922C]">
              Discover your next stay
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#0B1527]">
              Available Hotels &amp; Resorts
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#556377] leading-relaxed">
              Handpicked stays across South India&apos;s finest destinations.
            </p>
          </div>

          {/* display-only summary: updates automatically from the filters */}
          <div className="grid flex-1 min-w-0 gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
            {summaryCards}
          </div>
        </div>
      </div>
    </section>
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex flex-col justify-between">
        <main className="flex-1">
          {hero}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-20">
            <div className="h-8 w-64 animate-pulse rounded-2xl bg-neutral-200" />
            <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-[#966A1E]">
              <Sparkles size={15} className="text-[#D7A441]" />
              <span>Checking hourly availability...</span>
            </div>
            <div className="mt-8 space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 rounded-[28px] border border-[#EADBCC] bg-white p-5">
                  <div className="h-[200px] md:h-[220px] md:w-[38%] animate-pulse rounded-2xl bg-neutral-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
                    <div className="h-7 w-2/3 animate-pulse rounded bg-neutral-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                    <div className="h-10 w-1/2 animate-pulse rounded-xl bg-neutral-100" />
                  </div>
                </div>
              ))}
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

  const isGrid = viewMode === "grid";
  const roomLimit = isGrid ? 2 : 4;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFCFD] text-neutral-900">
      <main className="flex-1">
        {hero}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 pb-28">
          {/* LEFT SIDEBAR (desktop) + LISTING */}
          <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 lg:items-start">
            <aside className="hidden lg:block lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto rounded-3xl border border-[#EADBCC] bg-[#FFFDF9] shadow-[0_4px_24px_rgba(11,21,39,0.04)]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F2E8DC] bg-[#FFFDF9] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                    <SlidersHorizontal size={16} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0B1527] font-serif">Filter Stays</h2>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C5922C] px-1.5 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button type="button" onClick={clearFilters} className="text-xs font-bold text-[#B88428] hover:text-[#966A1E] cursor-pointer">
                  Reset
                </button>
              </div>
              <div className="px-5 py-5">{filterSections}</div>
            </aside>

            <div className="min-w-0">

          {/* MOBILE FILTER & SORT ROW */}
          <div className="grid grid-cols-2 gap-3 mb-5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center justify-between h-11 px-3.5 rounded-2xl border border-[#F2E8DC] bg-white text-xs font-bold text-[#0B1527] shadow-sm hover:border-[#D7A441] active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                  <SlidersHorizontal size={13} />
                </div>
                <span className="truncate">Filter Stays</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C5922C] px-1.5 text-[10px] font-bold text-white shrink-0">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div ref={mobileSortRef} className="relative">
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center justify-between w-full h-11 px-3.5 rounded-2xl border bg-white text-xs font-bold text-[#0B1527] shadow-sm active:scale-[0.98] transition cursor-pointer ${
                  sortOpen ? "border-[#D7A441] ring-2 ring-[#D7A441]/20" : "border-[#F2E8DC] hover:border-[#D7A441]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                    <ArrowUpDown size={13} />
                  </div>
                  <span className="truncate">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
                </div>
                <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${sortOpen ? "rotate-180 text-[#C5922C]" : ""}`} />
              </button>
              {sortOpen && sortDropdown("w-64 max-w-[calc(100vw-2rem)]")}
            </div>
          </div>

          {/* AVAILABLE STAYS TOOLBAR */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200/70">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1527] font-serif">
                Available Stays
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Showing {visibleHotels.length} {visibleHotels.length === 1 ? "property" : "properties"}
                </p>
                {selectedHotel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7A441]/15 border border-[#D7A441]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[#8B651B]">
                    <span>Hotel: {selectedHotel.hotel_name}</span>
                    <button type="button" onClick={() => updateParams({ hotel: "" })} className="hover:text-black p-0.5 cursor-pointer" title="Show all hotels">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto">
              <div ref={sortRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`group flex items-center gap-2 rounded-full border bg-white px-4 py-2 transition-all cursor-pointer ${
                    sortOpen ? "border-[#D7A441] ring-2 ring-[#D7A441]/20 shadow-md" : "border-neutral-200/90 hover:border-[#D7A441]/50"
                  }`}
                  aria-label="Sort stays"
                  aria-expanded={sortOpen}
                >
                  <ArrowUpDown size={13} className="text-[#C59A45]" />
                  <span className="text-xs font-semibold text-neutral-700">
                    SORT: <span className="font-bold text-neutral-900">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
                  </span>
                  <ChevronDown size={13} className={`text-neutral-400 transition-transform ${sortOpen ? "rotate-180 text-[#C59A45]" : ""}`} />
                </button>
                {sortOpen && sortDropdown("w-64")}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer active:scale-95 ${
                    isGrid ? "bg-[#C59A45] text-white" : "border border-neutral-200/90 bg-white text-neutral-600 hover:bg-neutral-50"
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
                    !isGrid ? "bg-[#C59A45] text-white" : "border border-neutral-200/90 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                  title="List view"
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          {/* HOTEL CARDS */}
          <div className={isGrid ? "grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6" : "space-y-6"}>
            {visibleHotels.map((hotel) => {
              const hotelImage = hotelImages[hotel.id];
              const rating = getStarlightRating(hotel.id);
              const picked0 = pkgChoice[hotel.id];
              const chosen =
                selectedDuration ??
                (picked0 && allowedDurations.includes(picked0) ? picked0 : null);
              const chosenPkg = chosen ? hotel.view[chosen] : null;
              const canContinue = Boolean(
                chosen && allowedDurations.includes(chosen) && chosenPkg && chosenPkg.rooms.length > 0 && chosenPkg.price
              );
              const expanded = Boolean(expandedRooms[hotel.id]);
              const chips = expanded ? hotel.roomChips : hotel.roomChips.slice(0, roomLimit);

              const detailsHref = `/hourly/hotel/${hotel.id}?stayType=hourly&stayDate=${encodeURIComponent(
                stayDate
              )}&startTime=${encodeURIComponent(startTime)}&duration=${encodeURIComponent(
                chosen ?? ""
              )}&guests=${encodeURIComponent(guests)}`;

              return (
                <article
                  key={hotel.id}
                  className={`group rounded-[28px] border border-[#EADBCC] bg-[#FFFDF9] shadow-[0_4px_24px_rgba(11,21,39,0.04)] hover:shadow-[0_20px_48px_rgba(11,21,39,0.08)] hover:border-[#D7A441]/50 transition-all duration-300 p-4 sm:p-5 flex flex-col ${
                    isGrid ? "" : "md:flex-row gap-5 lg:gap-7 items-stretch"
                  }`}
                >
                  {/* IMAGE */}
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-2xl bg-[#FAF6F0] ${
                      isGrid
                        ? "w-full aspect-[16/10] max-h-[220px] mb-4"
                        : "w-full h-[200px] sm:h-[220px] mb-4 md:mb-0 md:w-[36%] md:h-auto md:min-h-[220px]"
                    }`}
                  >
                    {hotelImage ? (
                      <img
                        src={hotelImage}
                        alt={hotel.hotel_name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        decoding="async"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FAF6F0] to-[#EFEAE1] text-neutral-400">
                        <span className="px-3 text-center text-xs font-bold uppercase tracking-widest">{hotel.hotel_name}</span>
                      </div>
                    )}
                    {hotel.city && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1527]/85 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/20 shadow-md">
                          <MapPin size={11} className="text-[#D7A441]" />
                          <span>{hotel.city}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-600 text-xs sm:text-[13px] min-w-0">
                          <MapPin size={14} className="text-[#C59A45] shrink-0" />
                          <span className="truncate">{hotel.city}{hotel.address ? `, ${hotel.address}` : ""}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 shrink-0">
                          <Star size={15} className="fill-[#E5A93C] text-[#E5A93C]" />
                          <span className="text-sm font-bold text-[#0B1527]">{rating.score}</span>
                          <span className="text-xs text-neutral-500">({rating.reviews})</span>
                        </div>
                      </div>

                      <h3 className="mt-1.5 text-xl sm:text-2xl font-bold font-serif tracking-tight text-[#0B1527] group-hover:text-[#B88428] transition-colors">
                        {hotel.hotel_name}
                      </h3>

                      {hotel.description && (
                        <div className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[#556377]">
                          <p className={expandedDescriptions[hotel.id] ? "" : "line-clamp-2"}>{hotel.description}</p>
                          {hotel.description.length > 95 && (
                            <button
                              type="button"
                              onClick={() => setExpandedDescriptions((p) => ({ ...p, [hotel.id]: !p[hotel.id] }))}
                              className="mt-1 text-[11px] font-semibold text-[#B88428] hover:text-[#966A1E] inline-flex items-center gap-0.5 cursor-pointer"
                              aria-expanded={Boolean(expandedDescriptions[hotel.id])}
                            >
                              <span>{expandedDescriptions[hotel.id] ? "Show less" : "More description"}</span>
                              {expandedDescriptions[hotel.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          )}
                        </div>
                      )}

                      {/* ROOMS FOR YOUR SLOT */}
                      <div className="mt-3.5 pt-3 border-t border-[#F2E8DC]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                            Rooms for your slot
                          </span>
                          <span className="text-xs font-bold text-[#C59A45]">
                            {hotel.roomChips.length} {hotel.roomChips.length === 1 ? "Option" : "Options"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {chips.map((room) => (
                            <div
                              key={room.id}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#EADBCC] bg-[#FFFDF9] px-3 py-1.5 text-xs font-medium text-[#0B1527] hover:border-[#C59A45]/60 hover:bg-[#FAF6ED] transition"
                            >
                              <BedDouble size={14} className="text-[#C59A45]" />
                              <span className="font-semibold">{room.name}</span>
                              <span className="text-neutral-500 text-[11px]">• {room.left} left</span>
                            </div>
                          ))}
                          {hotel.roomChips.length > roomLimit && (
                            <button
                              type="button"
                              onClick={() => setExpandedRooms((p) => ({ ...p, [hotel.id]: !p[hotel.id] }))}
                              className="inline-flex items-center gap-1 rounded-xl border border-[#EADBCC] bg-[#FFFDF9] hover:bg-[#F7F2E8] hover:border-[#D7A441]/60 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 hover:text-[#966A1E] transition cursor-pointer active:scale-95"
                              aria-expanded={expanded}
                            >
                              <span>{expanded ? "Show less" : `+${hotel.roomChips.length - roomLimit} more`}</span>
                              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PRICES + CTA */}
                    <div className="mt-4 pt-3.5 border-t border-[#F2E8DC]">
                      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
                        <div className="flex items-stretch gap-2 min-w-0 flex-1">
                          {activeDurations.map((d) => {
                            const pkg = hotel.view[d];
                            const bookable = pkg.rooms.length > 0 && pkg.price > 0;
                            const picked = chosen === d;
                            const interactive = !selectedDuration && bookable;
                            const body = (
                              <>
                                <span className={`block text-base sm:text-xl font-bold tracking-tight leading-tight ${bookable ? "text-[#0B1527]" : "text-neutral-400"}`}>
                                  {bookable ? `₹${pkg.price.toLocaleString("en-IN")}` : "—"}
                                </span>
                                <span className="block text-[10px] sm:text-[11px] font-semibold text-[#B88428] mt-0.5">
                                  {d} Hours{!bookable ? " · Unavailable" : ""}
                                </span>
                              </>
                            );
                            const tileClass = `min-w-0 flex-1 max-w-[150px] rounded-xl border px-2.5 sm:px-3.5 py-1.5 text-center transition ${
                              picked
                                ? "border-[#D7A441] bg-[#FAF5EB] ring-2 ring-[#D7A441]/25"
                                : "border-[#EADBCC] bg-white"
                            } ${bookable ? "" : "opacity-60"}`;
                            return interactive ? (
                              <button
                                key={d}
                                type="button"
                                aria-pressed={picked}
                                onClick={() => {
                                  setPkgChoice((p) => ({ ...p, [hotel.id]: d }));
                                  setPkgHint((p) => ({ ...p, [hotel.id]: false }));
                                }}
                                className={`${tileClass} cursor-pointer hover:border-[#D7A441]`}
                              >
                                {body}
                              </button>
                            ) : (
                              <div key={d} className={tileClass}>{body}</div>
                            );
                          })}
                        </div>

                        {canContinue ? (
                          <Link
                            to={detailsHref}
                            className="shrink-0 rounded-full bg-[#0B1527] hover:bg-[#162744] text-[#F3CF7A] px-3.5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap active:scale-[0.98]"
                          >
                            <span>View Hotel</span>
                            <ArrowRight size={14} className="stroke-[2.5]" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPkgHint((p) => ({ ...p, [hotel.id]: true }))}
                            className="shrink-0 rounded-full bg-[#0B1527]/80 text-[#F3CF7A] px-3.5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer"
                          >
                            <span>View Hotel</span>
                            <ArrowRight size={14} className="stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                      {pkgHint[hotel.id] && !canContinue && (
                        <p className="mt-2 text-[11px] font-semibold text-amber-700">
                          Choose a 3 or 6 hour package to continue.
                        </p>
                      )}
                      <p className="mt-1.5 text-[11px] text-neutral-400">
                        {startLabel}
                        {chosen ? ` – ${formatTime12(startTime, chosen)}` : ""} • + taxes &amp; fees
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* EMPTY STATE */}
          {!error && visibleHotels.length === 0 && (
            <div className="rounded-3xl border border-neutral-200/90 bg-white p-10 sm:p-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D7A441]/10 border border-[#D7A441]/20 text-[#B88428]">
                <Clock size={26} />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-bold text-neutral-900">No Hourly Stays Available</h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                Nothing matches {stayDate.split("-").reverse().join("-")} at {startLabel}
                {selectedDuration ? ` for ${selectedDuration} hours` : ""} with your filters. Try another time, package or destination.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-6 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
          </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER DRAWER (slides in from the left) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filter stays">
          <div className="absolute inset-0 bg-[#0B1527]/50 backdrop-blur-[1px]" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[90%] max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF3E7] text-[#C5922C]">
                  <SlidersHorizontal size={16} />
                </div>
                <h2 className="text-lg font-bold text-[#0B1527] font-serif">Filter Stays</h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">{filterSections}</div>

            <div className="flex gap-3 border-t border-[#F2E8DC] px-5 py-4">
              <button type="button" onClick={clearFilters} className="rounded-xl border border-[#EADBCC] px-4 py-2.5 text-xs font-bold text-neutral-700 cursor-pointer">
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-950 shadow-md cursor-pointer"
              >
                Show {visibleHotels.length} {visibleHotels.length === 1 ? "stay" : "stays"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP-ONLY LIST VIEW NOTICE */}
      {desktopOnlyToast && (
        <aside
          role="alert"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex w-[90%] max-w-sm items-center justify-between gap-3 rounded-2xl bg-[#0B1527] px-4 py-3.5 text-white shadow-[0_16px_40px_rgba(11,21,39,0.45)] border border-[#C59A45]/40"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C59A45]/20 text-[#F3CF7A] border border-[#C59A45]/30">
              <Monitor size={16} />
            </div>
            <p className="text-xs font-semibold text-neutral-100 leading-snug">This option is enabled in desktop only</p>
          </div>
          <button type="button" onClick={() => setDesktopOnlyToast(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer shrink-0" aria-label="Dismiss notice">
            <X size={15} />
          </button>
        </aside>
      )}

      <Footer />
    </div>
  );
}