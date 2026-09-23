import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  MapPin,
} from "lucide-react";

import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { getHotels, getHotelMedia } from "../services/hotelService";

import chennaiImg from "../assets/hero/chennai/Chennai_01.png";
import kodaikanalImg from "../assets/hero/kodaikanal/kodaikanal_01.png";
import pondicherryImg from "../assets/hero/pondicherry/Pondicherry_01.png";

/* =====================================================
    MOBILE SWIPEABLE FEATURES (Single row, snap scroll)
===================================================== */
function MobileDeck({ features }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / (clientWidth * 0.82));
      setActiveIndex(Math.min(features.length - 1, Math.max(0, idx)));
    }
  };

  const scrollTo = (idx) => {
    if (!containerRef.current) return;
    const cardWidth = containerRef.current.clientWidth * 0.82 + 16;
    containerRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="block sm:hidden mt-5">
      {/* Horizontal Swipeable Single Row */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1 pb-3 scroll-pl-1"
      >
        {features.map((item, idx) => (
          <div
            key={item.number}
            className="group relative flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)]"
          >
            {/* Top Gold Shine */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#D7A441] to-transparent shadow-[0_0_8px_rgba(215,164,65,0.4)]" />

            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-[#B88428]">{item.number}</span>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
                0{idx + 1} / 0{features.length}
              </span>
            </div>

            {/* Content */}
            <div className="my-4">
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{item.text}</p>
            </div>

            {/* Bottom accent */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <div className="h-1 w-10 rounded-full bg-gradient-to-r from-[#D7A441] to-[#C5922C]" />
              <span className="text-[11px] text-neutral-400 font-medium">Starlight Experience</span>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe dots & hint */}
      <div className="mt-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          {features.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-6 bg-[#D7A441]" : "w-2 bg-neutral-300"
              }`}
              aria-label={`Go to feature ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
          Swipe to see all &rarr;
        </span>
      </div>
    </div>
  );
}

const FEATURED_HOTEL_NAMES = [
  "Signature Grande",
  "AR Residency",
  "Grand Ocean",
  "Starlight Hotels - DLF",
  "Starlight Hotels Kodai",
  "Starlight Hotels Mylapore",
  "Starlight Hotels T-Nagar",
];

function Home() {
  const [hotels, setHotels] = useState([]);
  const [hotelImages, setHotelImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  // Dynamically filter & order hotels to show only the user-selected featured hotels
  const featuredHotels = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];

    const hotelMap = new Map();
    hotels.forEach((hotel) => {
      const key = (hotel.hotel_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      hotelMap.set(key, hotel);
    });

    const ordered = [];
    FEATURED_HOTEL_NAMES.forEach((name) => {
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const found = hotelMap.get(key);
      if (found && !ordered.some((h) => h.id === found.id)) {
        ordered.push(found);
      }
    });

    // Fallback: If fewer than 6 matched, pad with active hotels up to 6
    if (ordered.length < 6) {
      hotels.forEach((hotel) => {
        if (!ordered.some((h) => h.id === hotel.id)) {
          ordered.push(hotel);
        }
      });
    }

    return ordered;
  }, [hotels]);

  const displayedHotels = showAllFeatured
    ? featuredHotels
    : featuredHotels.slice(0, 6);

  useEffect(() => {
    async function loadHotels() {
      try {
        setLoading(true);
        setError("");

        const data = await getHotels();
        setHotels(data || []);

        // Load media asynchronously
        try {
          const mediaResults = await Promise.all(
            (data || []).map(async (hotel) => {
              const media = await getHotelMedia(hotel.id);
              return {
                hotelId: hotel.id,
                image: media[0]?.cloudinary_url || null,
              };
            })
          );

          const imageMap = {};
          mediaResults.forEach((item) => {
            imageMap[item.hotelId] = item.image;
          });
          setHotelImages(imageMap);
        } catch (mediaErr) {
          console.error("Error loading hotel media:", mediaErr);
        }

      } catch (err) {
        console.error("Error loading hotels:", err);
        setError("Unable to load hotels.");
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, []);

  const features = [
    {
      number: "01",
      title: "Comfortable Rooms",
      text: "Stay in thoughtfully selected rooms designed for comfort, luxury bedding, and quiet relaxation.",
    },
    {
      number: "02",
      title: "Great Locations",
      text: "Find stays close to top cultural landmarks, beaches, and peaceful natural surroundings.",
    },
    {
      number: "03",
      title: "Easy Booking",
      text: "Check live availability and reserve your stay in seconds with an intuitive, transparent process.",
    },
    {
      number: "04",
      title: "Reliable Service",
      text: "Enjoy dedicated hospitality and attentive concierge assistance from discovery to checkout.",
    },
  ];

  return (
    <main className="bg-[#FAF9F6] text-neutral-900 selection:bg-[#FEE2E2] selection:text-[#9B111E] w-full max-w-full overflow-x-clip min-h-screen">

      {/* =====================================================
          HERO (WITH ROTATING BACKGROUND & CUSTOM SEARCH BAR)
      ===================================================== */}
      <Hero />

      {/* =====================================================
          FEATURED HOTELS
      ===================================================== */}
      <section className="relative overflow-hidden py-8 sm:py-10 md:py-12 bg-[#FAF9F6]">

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-[#D7A441]/5 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 font-sans">
                Featured Hotels
              </h2>

              <p className="mt-2.5 sm:mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                Explore our selected properties and find the right stay for your next trip.
              </p>
            </div>

            <Link
              to="/book-hotels"
              className="hidden cursor-pointer items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition-all duration-300 hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-[0_4px_20px_rgba(215,164,65,0.18)] sm:flex"
            >
              <span>View all hotels</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          {loading && (
            <div className="mt-6 sm:mt-8 flex md:grid gap-5 sm:gap-6 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory md:grid-cols-2 lg:grid-cols-3 px-1 sm:px-0 scroll-pl-1 pb-4 md:pb-0">
              {[1, 2, 3].map((item, idx) => (
                <div
                  key={item}
                  style={{ animationDelay: `${idx * 150}ms` }}
                  className="h-80 w-[84vw] max-w-[340px] md:w-auto md:max-w-none shrink-0 md:shrink snap-start animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="mt-8 sm:mt-10 rounded-2xl border border-red-500/20 bg-red-50 p-6 sm:p-8 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {displayedHotels.length === 0 ? (
                <div className="mt-8 sm:mt-10 rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 text-center shadow-sm">
                  <p className="text-neutral-500">
                    No hotels are currently available.
                  </p>
                </div>
              ) : (
                <div className="mt-6 sm:mt-8 flex md:grid gap-5 sm:gap-6 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory md:grid-cols-2 lg:grid-cols-3 px-1 sm:px-0 scroll-pl-1 pb-4 md:pb-0">
                  {displayedHotels.map((hotel, index) => {
                    const imageUrl = hotelImages[hotel.id] || hotel.image_url || hotel.image;

                    return (
                      <article
                        key={hotel.id}
                        style={{
                          animation: "luxuryCardFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) backwards",
                          animationDelay: `${index * 120}ms`,
                        }}
                        className="group relative flex w-[84vw] max-w-[340px] md:w-auto md:max-w-none shrink-0 md:shrink snap-start flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#D7A441]/60 hover:shadow-[0_20px_45px_rgba(0,0,0,0.09),0_0_25px_rgba(215,164,65,0.15)]"
                      >
                        {/* Top Animated Gold Beam on Hover */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D7A441]/0 to-transparent transition-all duration-700 ease-out group-hover:via-[#D7A441]" />

                        {/* Image / Placeholder */}
                        <div className="relative flex h-52 sm:h-56 w-full items-center justify-center border-b border-neutral-100 bg-neutral-100/70 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={hotel.hotel_name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="relative flex h-full w-full items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent placeholder-shimmer" />
                              <span className="relative text-sm font-medium tracking-wide text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600">
                                Luxury Starlight Property
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 transition-colors duration-300 group-hover:text-[#B88428]">
                                  {hotel.hotel_name}
                                </h3>

                                <div className="mt-2 flex items-center gap-1.5 text-sm text-[#B88428] font-medium transition-transform duration-300 group-hover:translate-x-0.5">
                                  <MapPin size={15} className="text-[#D7A441]" />
                                  <span className="text-neutral-700">{hotel.city}</span>
                                </div>
                              </div>
                            </div>

                            <p className="mt-3.5 sm:mt-4 line-clamp-2 text-xs sm:text-sm leading-relaxed text-neutral-600">
                              {hotel.description}
                            </p>
                          </div>

                          <div className="mt-6 flex gap-2.5 sm:gap-3">
                            <Link
                              to={`/hotel/${hotel.id}`}
                              className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-neutral-800 transition-all duration-300 hover:border-neutral-400 hover:bg-white active:scale-95 text-center min-w-0 shadow-2xs"
                            >
                              Explore
                            </Link>

                            <Link
                              to={`/book-hotels?hotel=${hotel.id}`}
                              className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_4px_16px_rgba(215,164,65,0.3)] transition-all duration-300 hover:brightness-105 hover:shadow-[0_6px_22px_rgba(215,164,65,0.45)] active:scale-95 text-center min-w-0"
                            >
                              See Availability
                            </Link>
                          </div>
                        </div>

                        {/* Bottom Subtle Accent Line */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#D7A441]/0 to-transparent transition-all duration-700 ease-out group-hover:via-[#D7A441]/40" />
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {featuredHotels.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllFeatured((prev) => !prev)}
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition-all duration-300 hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-[0_4px_20px_rgba(215,164,65,0.18)] active:scale-95"
              >
                <span>{showAllFeatured ? "Show Less" : "View More Featured Hotels"}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${showAllFeatured ? "rotate-180" : ""}`}
                />
              </button>
            )}

            <Link
              to="/book-hotels"
              className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-neutral-800 hover:shadow-md active:scale-95"
            >
              <span>View All Hotels</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}
      <section className="relative border-y border-neutral-200/80 bg-white py-8 sm:py-10 md:py-12">

        {/* Ambient Backlight */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[#D7A441]/5 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 font-sans">
              Popular Destinations
            </h2>

            <p className="mt-2.5 sm:mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
              Choose your destination and discover places worth staying for.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 flex md:grid gap-5 sm:gap-6 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory sm:grid-cols-2 lg:grid-cols-3 px-1 sm:px-0 scroll-pl-1 pb-4 md:pb-0">

            {[
              {
                city: "Chennai",
                param: "Chennai",
                description: "Explore the vibrant city, beaches and cultural landmarks.",
                image: chennaiImg,
              },
              {
                city: "Kodaikanal",
                param: "Kodaikanal",
                description: "Discover cool mountain air, forests and peaceful landscapes.",
                image: kodaikanalImg,
              },
              {
                city: "Pondicherry",
                param: "Pondicherry",
                description: "Experience coastal streets, cafés and French-inspired charm.",
                image: pondicherryImg,
              },
            ].map((dest, idx) => (
              <Link
                key={dest.city}
                to={`/book-hotels?location=${dest.param}`}
                style={{
                  animation: "luxuryCardFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) backwards",
                  animationDelay: `${idx * 120}ms`,
                }}
                className="group relative flex w-[80vw] max-w-[320px] md:w-auto md:max-w-none shrink-0 md:shrink snap-start cursor-pointer flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#D7A441]/60 hover:shadow-[0_20px_45px_rgba(0,0,0,0.09),0_0_25px_rgba(215,164,65,0.15)]"
              >
                {/* Top Gold Shine */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D7A441]/0 to-transparent transition-all duration-700 ease-out group-hover:via-[#D7A441]" />

                {/* Destination Image Banner */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden border-b border-neutral-100 bg-neutral-100">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                  {/* Location badge on top of image */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-900 backdrop-blur-md shadow-sm">
                    <MapPin size={13} className="text-[#D7A441]" />
                    <span>{dest.city}</span>
                  </div>

                  {/* Chevron arrow */}
                  <div className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/95 text-neutral-800 backdrop-blur-md shadow-sm transition-all duration-300 group-hover:border-[#D7A441] group-hover:bg-[#D7A441] group-hover:text-white group-hover:translate-x-0.5">
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 transition-colors duration-300 group-hover:text-[#B88428]">
                      {dest.city}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600">
                      {dest.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#B88428] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#9B111E]">
                    <span>Explore stays in {dest.city}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Bottom Subtle Accent Line */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#D7A441]/0 to-transparent transition-all duration-700 ease-out group-hover:via-[#D7A441]/40" />
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT US PREVIEW ON ROOT PAGE
      ===================================================== */}
      <section className="relative overflow-hidden py-12 sm:py-16 bg-[#111315] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(196,140,45,0.15),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D8B36A] mb-3">
                <span className="h-px w-8 bg-[#C9973E]" />
                <span>The Starlight Story</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight font-sans">
                Where Timeless Hospitality Meets <span className="text-[#D8B36A]">Modern Luxury</span>
              </h2>
              <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-white/70">
                Discover curated stays across South India’s most distinctive destinations — Chennai, Pondicherry, and Kodaikanal. Crafted around warmth, comfort, and unforgettable memories.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/about-us"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-[0_4px_16px_rgba(215,164,65,0.3)] hover:brightness-105 transition-all cursor-pointer"
              >
                <span>Read Our Story</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE US / FEATURES
      ===================================================== */}
      <section className="relative overflow-hidden py-8 sm:py-10 md:py-12 bg-[#FAF9F6]">

        {/* Ambient Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[750px] -translate-x-1/2 rounded-full bg-[#D7A441]/4 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 font-sans">
              Everything you need for a comfortable stay.
            </h2>
          </div>

          {/* MOBILE VIEW: Single row horizontal swipeable cards with snap scrolling */}
          <MobileDeck features={features} />

          {/* DESKTOP VIEW: Clean 4-column responsive grid */}
          <div className="mt-6 sm:mt-8 hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {features.map((item, idx) => (
              <div
                key={item.number}
                style={{
                  animation: "luxuryCardFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) backwards",
                  animationDelay: `${idx * 100}ms`,
                }}
                className="group relative w-full flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#D7A441]/60 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08),0_0_25px_rgba(215,164,65,0.12)]"
              >
                {/* Top Gold Shine */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D7A441]/0 to-transparent transition-all duration-700 ease-out group-hover:via-[#D7A441]/70" />

                <div>
                  <span className="text-xs font-bold tracking-widest text-[#B88428] transition-all duration-300 group-hover:text-[#D7A441] group-hover:tracking-[0.25em]">
                    {item.number}
                  </span>

                  <h3 className="mt-6 sm:mt-8 text-base sm:text-lg font-semibold text-neutral-900 transition-colors duration-300 group-hover:text-[#B88428]">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-6 text-neutral-600">
                    {item.text}
                  </p>
                </div>

                <div className="mt-6 sm:mt-8 h-1 w-8 rounded-full bg-neutral-200 transition-all duration-500 ease-out group-hover:w-16 group-hover:bg-gradient-to-r group-hover:from-[#D7A441] group-hover:to-[#C5922C]" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="relative overflow-hidden py-8 sm:py-10 md:py-12 bg-[#FAF9F6]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="group relative overflow-hidden rounded-3xl border border-[#E8DCB8] bg-gradient-to-br from-[#FFFDF8] via-[#FAF5EB] to-[#F5ECE0] p-6 sm:p-8 md:p-10 shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-500 hover:border-[#D7A441]/60 hover:shadow-[0_22px_55px_rgba(215,164,65,0.15)]">

            {/* Pulsing Aurora Glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="cta-aurora absolute left-1/2 top-1/2 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D7A441]/10 blur-[110px]" />
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D7A441]/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent" />
            </div>

            <div className="relative flex flex-col items-start justify-between gap-6 sm:gap-8 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 font-sans">
                  Ready to plan your stay?
                </h2>

                <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-700 sm:text-base">
                  Find your hotel, check availability and book your next stay.
                </p>
              </div>

              <Link
                to="/book-hotels"
                className="w-full sm:w-auto inline-flex justify-center cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r from-[#D7A441] via-[#E2B755] to-[#C5922C] px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-neutral-950 shadow-[0_6px_25px_rgba(215,164,65,0.4)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_8px_35px_rgba(215,164,65,0.6)] active:scale-[0.97]"
              >
                <span>Book a Hotel</span>
                <ArrowRight size={17} className="sm:size-[18px]" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <Footer />

      {/* =====================================================
          ANIMATION STYLES
      ===================================================== */}
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          @keyframes luxuryCardFadeIn {
            0% {
              opacity: 0;
              transform: translateY(24px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes placeholderShimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .placeholder-shimmer {
            animation: placeholderShimmer 3s ease-in-out infinite;
          }

          @keyframes ctaGlowPulse {
            0%, 100% {
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.65;
              transform: translate(-50%, -50%) scale(1.12);
            }
          }

          .cta-aurora {
            animation: ctaGlowPulse 7s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .placeholder-shimmer,
            .cta-aurora {
              animation: none;
            }
          }
        `}
      </style>

    </main>
  );
}

export default Home;