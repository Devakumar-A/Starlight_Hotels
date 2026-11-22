
import React from "react";
import { CalendarDays, Clock3, MapPin, SlidersHorizontal, Users, X, ArrowRight } from "lucide-react";

const timeOptions = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00",
];

const destinations = ["Chennai", "Pondicherry", "Kodaikanal"];

function HourlySearchControls({
  stayDate,
  setStayDate,
  startTime,
  setStartTime,
  duration,
  setDuration,
  minDate,
}) {
  return (
    <div className="rounded-2xl border border-[#F2E8DC] bg-[#FFFDF9] p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#C5922C] uppercase">
        <Clock3 size={15} />
        <span>Your Hourly Stay</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#717E95]">
            <CalendarDays size={14} /> Stay Date
          </span>
          <input
            type="date"
            min={minDate}
            value={stayDate}
            onChange={(e) => setStayDate(e.target.value)}
            className="w-full rounded-xl border border-[#EFE5D8] bg-white p-3 text-sm font-semibold text-[#101D38] outline-none focus:border-[#C5922C]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#717E95]">
            <Clock3 size={14} /> Start Time
          </span>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl border border-[#EFE5D8] bg-white p-3 text-sm font-semibold text-[#101D38] outline-none focus:border-[#C5922C]"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#717E95]">
            <Clock3 size={14} /> Duration
          </span>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full rounded-xl border border-[#EFE5D8] bg-white p-3 text-sm font-semibold text-[#101D38] outline-none focus:border-[#C5922C]"
          >
            <option value={3}>3 Hours</option>
            <option value={6} disabled={startTime > "12:00"}>
              6 Hours
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}

function HourlyFilterSidebar({
  location,
  setLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  guests,
  setGuests,
  clearFilters,
}) {
  return (
    <div className="space-y-5 text-neutral-900">
      <div className="flex items-center gap-3 pb-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF3E7] text-[#C5922C]">
          <SlidersHorizontal size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#101D38]">Filter Stays</h2>
          <p className="text-xs text-[#717E95]">Refine your hourly stay</p>
        </div>
      </div>

      <div className="border-t border-[#F5EDE2] pt-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5922C]">
          <MapPin size={15} /> Destination / City
        </p>
        <div className="flex flex-wrap gap-2">
          {destinations.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setLocation(location === city ? "" : city)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                location === city
                  ? "bg-[#C5922C] text-white"
                  : "border border-[#E5E7EB] bg-white text-neutral-600 hover:border-[#C5922C]"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#F5EDE2] pt-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#C5922C]">
          Price Range (₹)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            placeholder="Minimum"
            className="min-w-0 rounded-xl border border-[#EBE3D7] bg-white p-2.5 text-sm outline-none focus:border-[#C5922C]"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            placeholder="Maximum"
            className="min-w-0 rounded-xl border border-[#EBE3D7] bg-white p-2.5 text-sm outline-none focus:border-[#C5922C]"
          />
        </div>
      </div>

      <div className="border-t border-[#F5EDE2] pt-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5922C]">
          <Users size={15} /> Guests
        </p>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full rounded-xl border border-[#EFE5D8] bg-white p-3 text-sm outline-none focus:border-[#C5922C]"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
            <option key={count} value={String(count)}>
              {count} {count === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-xl border border-[#F2E8DC] bg-white py-3 text-sm font-bold text-neutral-700 hover:bg-[#FAF6F0]"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default function HourlySearchFilter({
  location = "",
  setLocation = () => {},
  hotelId = "",
  selectedHotelName = "",
  stayDate = "",
  setStayDate = () => {},
  startTime = "09:00",
  setStartTime = () => {},
  duration = 3,
  setDuration = () => {},
  guests = "2",
  setGuests = () => {},
  minPrice = 0,
  setMinPrice = () => {},
  maxPrice = 20000,
  setMaxPrice = () => {},
  clearFilters = () => {},
  mobileFiltersOpen = false,
  setMobileFiltersOpen = () => {},
  filteredHotelsCount = 0,
  minDate,
  children,
}) {
  return (
    <>
      <section className="border-b border-neutral-200/80 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FCFCFD]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 lg:px-8">
          <div className="mb-4">
            <p className="mb-1 text-xs font-bold tracking-widest text-[#B88428]">
              DISCOVER YOUR NEXT STAY
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Available Hotels &amp; Resorts
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Find the perfect hotel for your hourly stay.
            </p>
          </div>

          <HourlySearchControls
            stayDate={stayDate}
            setStayDate={setStayDate}
            startTime={startTime}
            setStartTime={setStartTime}
            duration={duration}
            setDuration={setDuration}
            minDate={minDate}
          />

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600">
            <span className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
              <MapPin size={13} className="mr-1 inline text-[#B88428]" />
              {selectedHotelName || location || "All Locations"}
            </span>
            <span className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
              {guests} Guests
            </span>
            <span className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
              {duration} Hours
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-[#F2E8DC] bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
              <HourlyFilterSidebar
                location={location}
                setLocation={setLocation}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                guests={guests}
                setGuests={setGuests}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-neutral-200 p-2"
                aria-label="Close filters"
              >
                <X size={17} />
              </button>
            </div>
            <HourlyFilterSidebar
              location={location}
              setLocation={setLocation}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              guests={guests}
              setGuests={setGuests}
              clearFilters={clearFilters}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] py-3 text-sm font-bold text-neutral-950"
            >
              Show {filteredHotelsCount} Hotels
              <ArrowRight size={15} className="ml-2 inline" />
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
