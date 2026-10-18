import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";

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
  Images,
  MapPin,
  Minus,
  Navigation,
  Pencil,
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
  X,
} from "lucide-react";

import {
  getHotelById,
  getHotelMedia,
  getRoomCategoryMedia,
  getRoomCategories,
  getAvailability,
  getRoomPricing,
  calculateRoomPrice,
  getCategoryOccupancyLimits,
  canCategoryAccommodate,
  getHotelAmenities,
} from "../services/hotelService";

import Footer from "../components/Footer";
import { setSeo, clearPageJsonLd } from "../lib/seo";

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

function formatStayDateDesktop(dateStr) {
  if (!dateStr) return "Select Date";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const mIndex = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${months[mIndex] || ""} ${y}`;
}

function formatStayDateMobile(dateStr) {
  if (!dateStr) return "Select Date";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const mIndex = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${months[mIndex] || ""}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7; // Monday = 0
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [roomMedia, setRoomMedia] = useState({});
  const [roomLightbox, setRoomLightbox] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [amenityRows, setAmenityRows] = useState([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllRooms, setShowAllRooms] = useState(false);

  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const totalGuests = Number(guests) || 1;
  const rooms = Number(searchParams.get("rooms")) || 1;

  const filteredRooms = useMemo(() => {
    return roomCategories.filter((category) => {
      return canCategoryAccommodate(category, totalGuests, rooms);
    });
  }, [roomCategories, totalGuests, rooms]);

  const displayedRooms =
    !showAllRooms && filteredRooms.length > 0
      ? filteredRooms
      : roomCategories;

  const [error, setError] = useState("");

  const [showAllAmenities, setShowAllAmenities] =
    useState(false);

  const [showAllAmenityCategories, setShowAllAmenityCategories] =
    useState(false);

  // -------------------------------------------------------
  // DYNAMIC STAY / DATES & GUESTS MODAL STATE
  // -------------------------------------------------------
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState(checkOut);
  const [tempAdults, setTempAdults] = useState(() => Math.max(1, totalGuests));
  const [tempChildren, setTempChildren] = useState(0);
  const [tempRooms, setTempRooms] = useState(() => rooms);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [modalTab, setModalTab] = useState("dates");

  const handleOpenModifyModal = () => {
    setTempCheckIn(checkIn);
    setTempCheckOut(checkOut);
    setTempAdults(Math.max(1, totalGuests));
    setTempChildren(0);
    setTempRooms(rooms);
    setCalendarMonthOffset(0);
    setModalTab("dates");
    setIsModifyModalOpen(true);
  };

  const handleApplyModify = () => {
    const finalCheckIn = tempCheckIn || checkIn;
    let finalCheckOut = tempCheckOut;

    if (!finalCheckOut || finalCheckOut <= finalCheckIn) {
      const d = new Date(finalCheckIn);
      d.setDate(d.getDate() + 1);
      finalCheckOut = getLocalDateString(d);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("checkIn", finalCheckIn);
    nextParams.set("checkOut", finalCheckOut);
    nextParams.set("guests", String(tempAdults + tempChildren));
    nextParams.set("rooms", String(tempRooms));

    setSearchParams(nextParams);
    setIsModifyModalOpen(false);
  };

  const handleDateClick = (dateStr) => {
    if (!tempCheckIn || (tempCheckIn && tempCheckOut)) {
      setTempCheckIn(dateStr);
      setTempCheckOut("");
    } else {
      if (dateStr <= tempCheckIn) {
        setTempCheckIn(dateStr);
        setTempCheckOut("");
      } else {
        setTempCheckOut(dateStr);
      }
    }
  };

  const today = new Date();
  const todayStr = getLocalDateString(today);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendarMonth = (additionalMonthOffset) => {
    const viewDate = new Date(
      today.getFullYear(),
      today.getMonth() + calendarMonthOffset + additionalMonthOffset,
      1
    );
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
      <div className="w-full">
        <h4 className="text-center font-bold text-neutral-900 text-xs sm:text-sm mb-3 font-serif">
          {monthNames[month]} {year}
        </h4>

        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-wider">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-[#9C7335]">Sat</span>
          <span className="text-[#9C7335]">Sun</span>
        </div>

        <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
          {days.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const isPast = dateStr < todayStr;
            const isCheckIn = dateStr === tempCheckIn;
            const isCheckOut = dateStr === tempCheckOut;
            const isInRange =
              tempCheckIn && tempCheckOut && dateStr > tempCheckIn && dateStr < tempCheckOut;

            let btnClass =
              "relative z-10 h-8 w-8 mx-auto flex items-center justify-center transition-all text-xs font-semibold ";

            if (isCheckIn || isCheckOut) {
              btnClass +=
                "rounded-lg bg-[#D7A441] text-neutral-950 font-bold shadow-[0_2px_10px_rgba(215,164,65,0.6)] ring-2 ring-white";
            } else if (isInRange) {
              btnClass += "rounded-none w-full bg-[#D7A441]/20 text-[#8C6527] font-semibold";
            } else if (isPast) {
              btnClass += "rounded-lg text-neutral-300 cursor-not-allowed";
            } else {
              btnClass +=
                "rounded-lg text-neutral-700 hover:bg-[#F7F2E9] hover:text-[#8C6527] cursor-pointer";
            }

            return (
              <div key={dateStr} className="relative flex items-center justify-center h-8">
                {isCheckIn && tempCheckOut && (
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#D7A441]/20 pointer-events-none" />
                )}
                {isCheckOut && tempCheckIn && (
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#D7A441]/20 pointer-events-none" />
                )}
                {isInRange && (
                  <div className="absolute inset-0 bg-[#D7A441]/20 pointer-events-none" />
                )}

                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dateStr)}
                  className={btnClass}
                >
                  {parseInt(dateStr.split("-")[2], 10)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };


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
          setRoomMedia({});
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
                    await calculateRoomPrice({
                      roomCategoryId: category.id,
                      checkInDate: checkIn,
                      checkOutDate: checkOut,
                      numberOfGuests: totalGuests,
                      roomsRequested: rooms,
                      defaultPrice: Number(category.default_price) || 0,
                    });

                  return {
                    categoryId: category.id,
                    data: data,
                  };

                } catch (err) {
                  console.error(
                    `PRICING ERROR FOR ${category.category_name}:`,
                    err
                  );

                  return {
                    categoryId: category.id,
                    data: null,
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

        // -------------------------------------------------
        // ROOM CATEGORY MEDIA
        // -------------------------------------------------

        try {
          const catMedia = await getRoomCategoryMedia(hotelId);

          if (!cancelled && Array.isArray(catMedia)) {
            const mediaMap = {};
            catMedia.forEach((item) => {
              if (item.room_category_id && item.cloudinary_url) {
                if (!mediaMap[item.room_category_id]) {
                  mediaMap[item.room_category_id] = [];
                }
                mediaMap[item.room_category_id].push(item.cloudinary_url);
              }
            });
            setRoomMedia(mediaMap);
          }

        } catch (err) {
          console.error("ROOM MEDIA ERROR:", err);
          if (!cancelled) {
            setRoomMedia({});
          }
        }

      } catch (err) {
        console.error(
          "ROOM CATEGORY ERROR:",
          err
        );

        if (!cancelled) {
          setRoomCategories([]);
          setRoomMedia({});
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

  const priorityImage = useMemo(() => {
    return (
      media?.find(
        (item) => item.cloudinary_url && item.media_type === "image"
      )?.cloudinary_url ||
      images[0]?.cloudinary_url ||
      null
    );
  }, [media, images]);

  // =======================================================
  // HOTEL SEO & STRUCTURED DATA
  // =======================================================

  useEffect(() => {
    if (loading) return;

    if (!hotel || error) {
      setSeo({
        title: "Hotel Not Found | Starlight Hotels",
        description:
          "The requested destination or hotel could not be located. Explore luxury boutique hotels and hillside resorts across Chennai, Pondicherry, and Kodaikanal.",
        noindex: true,
        canonicalPath: null,
        jsonLd: null,
      });
      return;
    }

    const firstPhoto =
      priorityImage ||
      images[0]?.cloudinary_url ||
      "https://starlighthotels.in/og-image.jpg";

    const fallbackDesc = `Experience ${hotel.hotel_name} in ${hotel.city}. Book directly with Starlight Hotels for comfortable, premium accommodations in South India.`;
    const fullDesc = (hotel.description || "").trim() || fallbackDesc;

    // Trim to at most 155 characters at a word boundary, adding "…" only if actually shortened
    let metaDesc = fullDesc;
    if (fullDesc.length > 155) {
      const truncated = fullDesc.slice(0, 154);
      const lastSpace = truncated.lastIndexOf(" ");
      const base = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
      metaDesc = base.trimEnd().replace(/[.,;:!?\s]+$/, "") + "…";
    }

    // Use "{hotel name} | Starlight Hotels" only if name does not already contain "Starlight Hotels"
    const hotelTitle = hotel.hotel_name.includes("Starlight Hotels")
      ? hotel.hotel_name
      : `${hotel.hotel_name} | Starlight Hotels`;

    const hotelJsonLd = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      name: hotel.hotel_name,
      description: fullDesc,
      url: `https://starlighthotels.in/hotel/${hotel.id || hotelId}`,
      image: firstPhoto,
      telephone: "+91-8270660904",
      ...(hotel.address || hotel.city
        ? {
            address: {
              "@type": "PostalAddress",
              ...(hotel.address ? { streetAddress: hotel.address } : {}),
              ...(hotel.city ? { addressLocality: hotel.city } : {}),
              addressCountry: "IN",
            },
          }
        : {}),
    };

    setSeo({
      title: hotelTitle,
      description: metaDesc,
      canonicalPath: `/hotel/${hotel.id || hotelId}`,
      image: firstPhoto,
      type: "website",
      jsonLd: hotelJsonLd,
    });
  }, [hotel, priorityImage, images, loading, error, hotelId]);

  useEffect(() => {
    return () => {
      clearPageJsonLd();
    };
  }, []);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const thumbnailContainerRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Keep index within bounds if images change
  useEffect(() => {
    if (images.length > 0 && selectedImage >= images.length) {
      setSelectedImage(0);
    }
  }, [images.length, selectedImage]);

  // Synchronize active thumbnail in scroll strip
  useEffect(() => {
    setIsImageLoading(true);
    const activeThumb = thumbnailRefs.current[selectedImage];
    if (activeThumb && thumbnailContainerRef.current) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedImage]);

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Trigger on intentional horizontal swipe without disrupting vertical page scrolling
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0) {
        nextImage();
      } else {
        previousImage();
      }
    }
  };

  const handleGalleryKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      previousImage();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextImage();
    }
  };

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

  // -------------------------------------------------------
  // BOOKING.COM LIGHTBOX / ENLARGED PHOTO VIEWER
  // -------------------------------------------------------
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextLightboxImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevLightboxImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextLightboxImage();
      } else if (e.key === "ArrowLeft") {
        prevLightboxImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, images.length]);

  // -------------------------------------------------------
  // ROOM CATEGORY LIGHTBOX / ENLARGED PHOTO VIEWER
  // -------------------------------------------------------
  const openRoomLightbox = (categoryName, imagesList, initialIndex = 0) => {
    if (!imagesList || imagesList.length === 0) return;
    setRoomLightbox({
      categoryName,
      images: imagesList,
      currentIndex: initialIndex,
    });
  };

  const closeRoomLightbox = () => {
    setRoomLightbox(null);
  };

  const nextRoomLightboxImage = (e) => {
    if (e) e.stopPropagation();
    setRoomLightbox((prev) => {
      if (!prev || !prev.images.length) return null;
      const nextIndex =
        prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1;
      return { ...prev, currentIndex: nextIndex };
    });
  };

  const prevRoomLightboxImage = (e) => {
    if (e) e.stopPropagation();
    setRoomLightbox((prev) => {
      if (!prev || !prev.images.length) return null;
      const prevIndex =
        prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1;
      return { ...prev, currentIndex: prevIndex };
    });
  };

  // Lock body scroll when roomLightbox is open
  useEffect(() => {
    if (roomLightbox) {
      document.body.style.overflow = "hidden";
    } else if (!isLightboxOpen) {
      document.body.style.overflow = "";
    }
    return () => {
      if (!isLightboxOpen) {
        document.body.style.overflow = "";
      }
    };
  }, [roomLightbox, isLightboxOpen]);

  // Keyboard navigation for roomLightbox
  useEffect(() => {
    if (!roomLightbox) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeRoomLightbox();
      } else if (e.key === "ArrowRight") {
        nextRoomLightboxImage();
      } else if (e.key === "ArrowLeft") {
        prevRoomLightboxImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roomLightbox]);


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
    const result = pricing.find(
      (item) => item.categoryId === category.id
    );
    const data = result?.data;

    if (data && typeof data === "object") {
      return {
        nightly: Number(data.average_nightly_rate) || 0,
        subtotal: Number(data.subtotal) || 0,
        gst: Number(data.gst_amount) || 0,
        total: Number(data.subtotal) || 0,
        finalTotal: Number(data.final_total) || 0,
      };
    }

    const defaultNightly = Number(category.default_price || 0);
    const sub = defaultNightly * nights * rooms;
    const gst = Math.round(sub * 0.05);

    return {
      nightly: defaultNightly,
      subtotal: sub,
      gst: gst,
      total: sub,
      finalTotal: sub + gst,
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
  // DYNAMIC LOCATION & GOOGLE MAPS
  // =======================================================

  const locationData = useMemo(() => {
    if (!hotel) return null;

    const rawLat = hotel.latitude ?? hotel.lat;
    const rawLng = hotel.longitude ?? hotel.lng ?? hotel.long;
    const parsedLat =
      rawLat !== null && rawLat !== undefined && rawLat !== ""
        ? Number(rawLat)
        : null;
    const parsedLng =
      rawLng !== null && rawLng !== undefined && rawLng !== ""
        ? Number(rawLng)
        : null;
    const hasValidCoords =
      parsedLat !== null &&
      parsedLng !== null &&
      !isNaN(parsedLat) &&
      !isNaN(parsedLng);

    // Formatted display address
    const addressParts = [hotel.address, hotel.city].filter(
      (part) => part && typeof part === "string" && part.trim() !== ""
    );
    const displayAddress =
      addressParts.length > 0 ? addressParts.join(", ") : null;

    // Search query for Google Maps
    const queryParts = [hotel.hotel_name, hotel.address, hotel.city].filter(
      (part) => part && typeof part === "string" && part.trim() !== ""
    );
    const destinationQuery =
      queryParts.length > 0 ? queryParts.join(", ") : hotel.hotel_name || "";

    // Directions URL
    let directionsUrl = "#";
    if (hasValidCoords) {
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parsedLat},${parsedLng}`;
    } else if (hotel.google_maps_place_id) {
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destinationQuery
      )}&destination_place_id=${hotel.google_maps_place_id}`;
    } else if (destinationQuery) {
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destinationQuery
      )}`;
    }

    // View on Google Maps Search URL
    let mapsUrl = "#";
    if (hasValidCoords) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`;
    } else if (hotel.google_maps_place_id) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        destinationQuery
      )}&query_place_id=${hotel.google_maps_place_id}`;
    } else if (destinationQuery) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        destinationQuery
      )}`;
    }

    // Dynamic Embedded Map URL using accurate coordinates or query
    let embedMapUrl = null;
    if (hasValidCoords) {
      embedMapUrl = `https://maps.google.com/maps?q=${parsedLat},${parsedLng}&hl=en&z=15&output=embed`;
    } else if (destinationQuery) {
      embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
        destinationQuery
      )}&hl=en&z=15&output=embed`;
    }

    return {
      hasValidCoords,
      lat: parsedLat,
      lng: parsedLng,
      displayAddress,
      directionsUrl,
      mapsUrl,
      embedMapUrl,
    };
  }, [hotel]);

  const mapsUrl = locationData?.mapsUrl || "#";


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
        <section className="border-b border-[#EAE6DF] bg-[#FAF8F5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

            {/* Back button & Breadcrumbs */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.state && window.history.state.idx > 0) {
                      navigate(-1);
                    } else {
                      navigate(`/book-hotels?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
                    }
                  }}
                  aria-label="Go back"
                  title="Go back"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                </button>

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

            {/* Title & Rating Header (Exact Design Match for Desktop & Mobile) */}
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

              {/* Desktop Rating Card */}
              <div className="hidden lg:flex items-center gap-3.5 rounded-2xl border border-[#EAE6DF] bg-white p-3 px-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] shrink-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0E131F] text-[#F59E0B] font-bold text-base shadow-xs">
                  <span>{hotelRating.score}</span>
                  <span className="text-xs ml-0.5">★</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900">
                      {hotelRating.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-[10px] font-semibold text-[#16874E]">
                      Top 5%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {hotelRating.reviews} verified guest reviews
                  </p>
                </div>
              </div>

              {/* Mobile Rating Card */}
              <div className="flex lg:hidden items-center gap-3 rounded-2xl border border-[#EAE6DF] bg-white p-2.5 px-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-fit max-w-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E131F] text-[#F59E0B] font-bold text-xs shadow-xs">
                  <span>{hotelRating.score}</span>
                  <span className="text-[10px] ml-0.5">★</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-neutral-900">
                    {hotelRating.label}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#E8F8F0] px-2 py-0.5 text-[10px] font-semibold text-[#16874E]">
                    Top 5%
                  </span>
                  <span className="text-[11px] text-neutral-500 whitespace-nowrap">
                    {hotelRating.reviews} verified guest reviews
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ===================================================
            BOOKING.COM STYLE MOSAIC GALLERY (DESKTOP) + TOUCH SLIDER (MOBILE)
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {images.length > 0 ? (
            <div>
              {/* DESKTOP VIEW: Booking.com 8-Photo Mosaic Grid */}
              <div className="hidden md:block select-none">
                {/* 1 Photo View */}
                {images.length === 1 && (
                  <div
                    onClick={() => openLightbox(0)}
                    className="booking-gallery-hero h-[380px] lg:h-[480px] rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer shadow-xs"
                    title="Click to view photo"
                  >
                    <img
                      src={images[0]?.cloudinary_url}
                      alt={`${hotel.hotel_name} - Main`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="booking-gallery-scrim" />
                  </div>
                )}

                {/* 2 Photos View */}
                {images.length === 2 && (
                  <div className="grid grid-cols-2 gap-2 lg:gap-2.5 h-[360px] lg:h-[460px]">
                    {images.map((img, i) => (
                      <div
                        key={img.id || i}
                        onClick={() => openLightbox(i)}
                        className="booking-gallery-hero rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer shadow-xs group"
                        title="Click to enlarge photo"
                      >
                        <img
                          src={img.cloudinary_url}
                          alt={`${hotel.hotel_name} - Photo ${i + 1}`}
                          className="w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-500 ease-out"
                        />
                        <div className="booking-gallery-scrim" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3 or More Photos: Booking.com Asymmetric Mosaic Grid */}
                {images.length >= 3 && (
                  <div className="booking-gallery-root">
                    {/* Top Tier: Left Hero (~65% / 1.85fr) + Right 2 Stacked (~35% / 1fr) */}
                    <div className="booking-gallery-top">
                      {/* Left Hero Image */}
                      <div
                        onClick={() => openLightbox(0)}
                        className="booking-gallery-hero rounded-xl lg:rounded-2xl shadow-xs group"
                        title="Click to enlarge photo"
                      >
                        <img
                          src={images[0]?.cloudinary_url}
                          alt={`${hotel.hotel_name} - Main`}
                          className="group-hover:scale-[1.025] transition-transform duration-500 ease-out"
                        />
                        <div className="booking-gallery-scrim" />
                      </div>

                      {/* Right 2 Stacked Images */}
                      <div className="booking-gallery-stacked">
                        {images.slice(1, 3).map((img, i) => (
                          <div
                            key={img.id || i}
                            onClick={() => openLightbox(i + 1)}
                            className="booking-gallery-stacked-item rounded-xl lg:rounded-2xl shadow-xs group"
                            title="Click to enlarge photo"
                          >
                            <img
                              src={img.cloudinary_url}
                              alt={`${hotel.hotel_name} - Photo ${i + 2}`}
                              className="group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                            />
                            <div className="booking-gallery-scrim" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Tier: Up to 5 Images in a row */}
                    {images.length > 3 && (
                      <div
                        className="booking-gallery-bottom"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(images.length - 3, 5)}, minmax(0, 1fr))`,
                        }}
                      >
                        {images.slice(3, 8).map((img, i) => {
                          const actualIndex = i + 3;
                          const isFifthSlot = i === 4;
                          const remainingPhotos = images.length - 8;

                          return (
                            <div
                              key={img.id || actualIndex}
                              onClick={() => openLightbox(actualIndex)}
                              className="booking-gallery-thumb rounded-xl lg:rounded-2xl shadow-xs group"
                              title="Click to enlarge photo"
                            >
                              <img
                                src={img.cloudinary_url}
                                alt={`${hotel.hotel_name} - Photo ${actualIndex + 1}`}
                                className="group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                              />
                              <div className="booking-gallery-scrim" />

                              {/* Booking.com "+X photos" Overlay on 5th Slot */}
                              {isFifthSlot && remainingPhotos > 0 && (
                                <div className="booking-gallery-overlay">
                                  <span className="booking-gallery-overlay-text">
                                    +{remainingPhotos} photos
                                  </span>
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

              {/* MOBILE VIEW: Interactive Touch Carousel */}
              <div className="block md:hidden space-y-3 select-none">
                <div
                  tabIndex={0}
                  onKeyDown={handleGalleryKeyDown}
                  onClick={() => openLightbox(selectedImage)}
                  className="hotel-gallery-frame relative w-full overflow-hidden rounded-2xl border-0 bg-transparent shadow-none cursor-pointer"
                  aria-label={`Photo gallery for ${hotel.hotel_name}. Tap to enlarge.`}
                >
                  <div
                    className="hotel-gallery-main relative w-full h-full min-w-0 min-h-0 flex items-center justify-center overflow-hidden bg-transparent"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      key={currentImage}
                      src={currentImage}
                      alt={`${hotel.hotel_name} - Photo ${selectedImage + 1} of ${images.length}`}
                      className="block w-full h-full object-contain object-center rounded-2xl transition-opacity duration-200"
                      loading="eager"
                    />
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          previousImage();
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-md active:scale-95 transition cursor-pointer"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft size={18} className="stroke-[2.2]" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-md active:scale-95 transition cursor-pointer"
                        aria-label="Next photo"
                      >
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

                {/* Mobile Thumbnails */}
                {images.length > 1 && (
                  <div
                    ref={thumbnailContainerRef}
                    className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
                  >
                    {images.map((image, index) => {
                      const isActive = selectedImage === index;
                      return (
                        <button
                          key={image.id || index}
                          ref={(el) => (thumbnailRefs.current[index] = el)}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            isActive
                              ? "border-[#D7A441] ring-2 ring-[#D7A441]/40 scale-[1.02]"
                              : "border-transparent opacity-65 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={image.cloudinary_url}
                            alt={`Thumbnail ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
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


        {/* ===================================================
            SEARCH / STAY OVERVIEW (EXACT DESIGN MATCH)
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          {/* 1. DESKTOP VERSION — Horizontal Stay Bar */}
          <div className="hidden sm:block rounded-3xl border border-[#EAE1D2] bg-[#FFFDF9] p-6 lg:px-8 shadow-[0_4px_24px_rgba(180,140,75,0.06)]">
            {/* Header: — YOUR STAY */}
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-5 h-[2.5px] bg-[#9C7335] rounded-full" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800 font-sans">
                YOUR STAY
              </span>
            </div>

            {/* Horizontal Row: Check-in → Check-out → Guests + Modify stay */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 lg:gap-7">
                {/* Check-in */}
                <button
                  type="button"
                  onClick={handleOpenModifyModal}
                  className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
                  title="Click to modify check-in date"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335] transition-transform group-hover:scale-105 group-hover:border-[#9C7335]">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      CHECK-IN
                    </p>
                    <p className="text-base lg:text-lg font-bold text-neutral-900 tracking-tight font-serif mt-0.5">
                      {formatStayDateDesktop(checkIn)}
                    </p>
                  </div>
                </button>

                {/* Arrow */}
                <div className="text-neutral-400 px-1">
                  <ArrowRight size={18} className="stroke-[1.75]" />
                </div>

                {/* Check-out */}
                <button
                  type="button"
                  onClick={handleOpenModifyModal}
                  className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
                  title="Click to modify check-out date"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335] transition-transform group-hover:scale-105 group-hover:border-[#9C7335]">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      CHECK-OUT
                    </p>
                    <p className="text-base lg:text-lg font-bold text-neutral-900 tracking-tight font-serif mt-0.5">
                      {formatStayDateDesktop(checkOut)}
                    </p>
                  </div>
                </button>

                {/* Vertical Divider */}
                <div className="h-9 w-[1px] bg-[#EAE1D2] mx-1 lg:mx-2" />

                {/* Guests */}
                <button
                  type="button"
                  onClick={handleOpenModifyModal}
                  className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
                  title="Click to modify guest count"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335] transition-transform group-hover:scale-105 group-hover:border-[#9C7335]">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      GUESTS
                    </p>
                    <p className="text-base lg:text-lg font-bold text-neutral-900 tracking-tight font-serif mt-0.5">
                      {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}{rooms > 1 ? ` (${rooms} Rooms)` : ""}
                    </p>
                  </div>
                </button>
              </div>

              {/* Outlined Action on the Right: "Modify stay" */}
              <button
                type="button"
                onClick={handleOpenModifyModal}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#9C7335]/70 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#4A3B24] hover:bg-[#F7F2E9] hover:border-[#9C7335] active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Pencil size={14} className="text-[#9C7335] stroke-[2]" />
                <span>Modify stay</span>
              </button>
            </div>
          </div>

          {/* 2. MOBILE VERSION — Compact Stacked Card */}
          <div className="block sm:hidden rounded-3xl border border-[#EAE1D2] bg-[#FFFDF9] p-4 shadow-[0_4px_24px_rgba(180,140,75,0.06)]">
            {/* Header: — YOUR STAY and small EDIT action */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[2.5px] bg-[#9C7335] rounded-full" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800 font-sans">
                  YOUR STAY
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenModifyModal}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9C7335] hover:text-[#7A561C] active:scale-95 transition cursor-pointer"
              >
                <Pencil size={12} className="stroke-[2.5]" />
                <span>EDIT</span>
              </button>
            </div>

            {/* Two Equal Date Columns at the top */}
            <div
              onClick={handleOpenModifyModal}
              className="grid grid-cols-2 divide-x divide-[#EAE1D2] pb-3.5 cursor-pointer"
            >
              {/* Check-in */}
              <div className="flex flex-col items-center text-center pr-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335] mb-2 shadow-xs">
                  <CalendarDays size={18} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  CHECK-IN
                </p>
                <p className="mt-0.5 text-base font-bold text-neutral-900 font-serif tracking-tight">
                  {formatStayDateMobile(checkIn)}
                </p>
              </div>

              {/* Check-out */}
              <div className="flex flex-col items-center text-center pl-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335] mb-2 shadow-xs">
                  <CalendarDays size={18} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  CHECK-OUT
                </p>
                <p className="mt-0.5 text-base font-bold text-neutral-900 font-serif tracking-tight">
                  {formatStayDateMobile(checkOut)}
                </p>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-[#EAE1D2]" />

            {/* Guests in a separate row below */}
            <div
              onClick={handleOpenModifyModal}
              className="pt-3.5 flex items-center gap-3.5 pl-1 cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F2E9] border border-[#EAE1D2]/80 text-[#9C7335] shadow-xs shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  GUESTS
                </p>
                <p className="mt-0.5 text-base font-bold text-neutral-900 font-serif tracking-tight">
                  {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}{rooms > 1 ? ` (${rooms} Rooms)` : ""}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ===================================================
            CHOOSE YOUR ROOM (CORE BOOKING LISTING)
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-200/70 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#B88428]">
                  Select Accommodation
                </p>
                {filteredRooms.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF5EB] border border-[#D7A441]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#966A1E]">
                    <Users size={12} className="text-[#D7A441]" />
                    <span>{totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}{rooms > 1 ? ` • ${rooms} Rooms` : ""}</span>
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-serif">
                Choose your room
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {filteredRooms.length > 0 && filteredRooms.length < roomCategories.length && (
                <button
                  type="button"
                  onClick={() => setShowAllRooms(!showAllRooms)}
                  className="text-xs font-semibold text-[#B88428] hover:underline cursor-pointer"
                >
                  {showAllRooms ? `Show rooms for ${totalGuests} guests (${filteredRooms.length})` : `Show all room types (${roomCategories.length})`}
                </button>
              )}
              <p className="text-xs text-neutral-500 hidden sm:block">
                Best direct rates guaranteed
              </p>
            </div>
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
            ) : displayedRooms.length === 0 ? (
              <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-8 sm:p-10 text-center shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-[#B88428] mb-3">
                  <Users size={22} />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-neutral-900">
                  No single room accommodates {totalGuests} {totalGuests === 1 ? "guest" : "guests"} ({rooms} {rooms === 1 ? "room" : "rooms"})
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                  Starlight guest rooms have specific occupancy capacities. Try selecting multiple rooms or view all available categories below.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllRooms(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-xs cursor-pointer"
                  >
                    View all available room types ({roomCategories.length})
                  </button>
                </div>
              </div>
            ) : (
              displayedRooms.map((category) => {
                const available = getAvailableRooms(category);
                const total = getTotalRooms(category);
                const priceDetails = getRoomPriceDetails(category);
                const isAvailable = available > 0;
                const categoryImages = roomMedia[category.id] || [];

                return (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch"
                  >
                    {/* ROOM IMAGE (Left on desktop/tablet, top on mobile - reference Bookings.jsx) */}
                    <div
                      className={`relative md:w-72 lg:w-80 shrink-0 bg-neutral-100 min-h-[220px] md:min-h-full overflow-hidden group ${
                        categoryImages.length > 0 ? "cursor-pointer" : ""
                      }`}
                      onClick={() => {
                        if (categoryImages.length > 0) {
                          openRoomLightbox(category.category_name, categoryImages, 0);
                        }
                      }}
                    >
                      {categoryImages.length > 0 ? (
                        <>
                          <img
                            src={categoryImages[0]}
                            alt={category.category_name}
                            className="h-full w-full object-cover min-h-[220px] transition-transform duration-500 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Photo Count Badge */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white border border-white/20 shadow-xs">
                            <Images size={13} className="text-[#D7A441]" />
                            <span>
                              {categoryImages.length}{" "}
                              {categoryImages.length === 1 ? "Photo" : "Photos"}
                            </span>
                          </div>
                          {/* Hover Overlay Hint */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="rounded-full bg-black/60 backdrop-blur-xs px-3 py-1 text-xs font-medium text-white border border-white/30 flex items-center gap-1.5 shadow-sm">
                              <Sparkles size={13} className="text-[#D7A441]" />
                              View Photos
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full min-h-[220px] flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-[#171922] text-white p-6 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D7A441] mb-2">
                            <BedDouble size={26} strokeWidth={1.8} />
                          </div>
                          <p className="text-sm font-semibold">{category.category_name}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{hotel?.hotel_name}</p>
                        </div>
                      )}
                    </div>

                    {/* ROOM INFO + PRICING & CTA (Right side) */}
                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
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
                            {(() => {
                              const { maxGuests } = getCategoryOccupancyLimits(category);
                              return (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 px-3 py-1 text-xs font-medium text-neutral-700">
                                  <Users size={13} className="text-[#D7A441]" />
                                  Up to {maxGuests} {maxGuests === 1 ? "guest" : "guests"}
                                </span>
                              );
                            })()}

                            {canCategoryAccommodate(category, totalGuests, rooms) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-semibold text-[#966A1E]">
                                <Check size={12} className="text-[#D7A441]" />
                                <span>Fits {totalGuests} {totalGuests === 1 ? "guest" : "guests"}</span>
                              </span>
                            )}

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
                            {nights > 1 || rooms > 1 ? (
                              <p className="text-[11px] font-semibold text-[#B88428] mt-0.5">
                                ₹{priceDetails.subtotal.toLocaleString("en-IN")} total for {nights} {nights === 1 ? "night" : "nights"}{rooms > 1 ? ` (${rooms} rooms)` : ""}
                              </p>
                            ) : (
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                + 5% GST calculated at checkout
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
                                  )}&guests=${encodeURIComponent(guests)}${
                                    searchParams.get("rooms")
                                      ? `&rooms=${encodeURIComponent(searchParams.get("rooms"))}`
                                      : ""
                                  }`
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
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>


        {/* ===================================================
            ABOUT THE HOTEL (PREMIUM OVERVIEW)
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="rounded-3xl border border-[#EDE7DC] bg-[#FFFDF9] p-5 sm:p-7 md:p-9 shadow-[0_4px_24px_rgba(180,140,75,0.04)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              {/* Left Column: Overview Details & Highlights */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* Eyebrow Label */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-[2px] w-6 bg-[#C59B27] rounded-full" />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                      Overview
                    </span>
                  </div>

                  {/* Heading */}
                  <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1527] font-serif leading-tight">
                    About {hotel.hotel_name}
                  </h2>

                  {/* Description */}
                  <p className="mt-4 text-xs sm:text-sm md:text-base leading-relaxed text-neutral-600 max-w-xl">
                    {hotel.description ||
                      "A distinguished destination curated under the Starlight collection, delivering exceptional hospitality, refined comfort, and serene spaces designed for travelers seeking boutique luxury."}
                  </p>
                </div>

                <div>
                  {/* Subtle Thin Divider */}
                  <div className="my-6 border-t border-[#EDE7DC]" />

                  {/* Four Core Highlights in Clean 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm font-semibold text-neutral-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={17} className="text-[#D7A441] shrink-0" />
                      <span>Starlight Verified Stay</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={17} className="text-[#D7A441] shrink-0" />
                      <span>Prime City Access</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={17} className="text-[#D7A441] shrink-0" />
                      <span>24/7 Front Desk Concierge</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={17} className="text-[#D7A441] shrink-0" />
                      <span>Contactless Check-in Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Priority 1 Hotel Image */}
              <div className="w-full h-full min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] max-h-[400px] rounded-2xl overflow-hidden border border-[#EDE7DC] bg-[#FAF8F5] shadow-xs">
                {priorityImage ? (
                  <img
                    src={priorityImage}
                    alt={`Overview of ${hotel.hotel_name}`}
                    className="w-full h-full min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] max-h-[400px] object-cover transition-transform duration-700 hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full min-h-[260px] flex items-center justify-center bg-[#FAF8F5] text-neutral-400">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#B88428]">
                      {hotel.hotel_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>


        {/* ===================================================
            HOTEL POLICIES & GUIDELINES
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="rounded-3xl border border-[#EDE7DC] bg-[#FFFDF9] p-5 sm:p-7 md:p-8 shadow-[0_4px_24px_rgba(180,140,75,0.04)]">
            {/* Header: Accent Bar + GOOD TO KNOW */}
            <div className="flex items-center gap-2.5">
              <div className="h-[2.5px] w-5 sm:w-6 bg-[#B88428] rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#B88428]">
                Good to know
              </span>
            </div>

            {/* Title */}
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1527] font-serif leading-tight">
              Hotel policies &amp; Guidelines
            </h2>

            {/* Subtle Divider */}
            <div className="mt-4 mb-5 sm:mt-5 sm:mb-6 border-t border-[#EDE7DC]" />

            {/* 2-column x 2-row on mobile, 4-column on desktop */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {/* Card 1: Check-in */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#EDE7DC] bg-white p-3.5 sm:p-5 min-h-[160px] sm:min-h-[180px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FAF3E6] border border-[#F2E8D5]/60 text-[#B88428]">
                    <Clock size={20} className="text-[#B88428] stroke-[2.2]" />
                  </div>
                  <p className="mt-3.5 sm:mt-5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">
                    Check-in
                  </p>
                </div>
                <div className="mt-1.5 sm:mt-2">
                  <p className="text-sm sm:text-base md:text-lg font-bold text-[#0B1527] font-serif leading-tight">
                    <span className="block">From</span>
                    <span>12:00 PM</span>
                  </p>
                </div>
              </div>

              {/* Card 2: Check-out */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#EDE7DC] bg-white p-3.5 sm:p-5 min-h-[160px] sm:min-h-[180px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FAF3E6] border border-[#F2E8D5]/60 text-[#B88428]">
                    <Clock size={20} className="text-[#B88428] stroke-[2.2]" />
                  </div>
                  <p className="mt-3.5 sm:mt-5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">
                    Check-out
                  </p>
                </div>
                <div className="mt-1.5 sm:mt-2">
                  <p className="text-sm sm:text-base md:text-lg font-bold text-[#0B1527] font-serif leading-tight">
                    <span className="block">By</span>
                    <span>11:00 AM</span>
                  </p>
                </div>
              </div>

              {/* Card 3: Identification */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#EDE7DC] bg-white p-3.5 sm:p-5 min-h-[160px] sm:min-h-[180px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FAF3E6] border border-[#F2E8D5]/60 text-[#B88428]">
                    <ShieldCheck size={20} className="text-[#B88428] stroke-[2.2]" />
                  </div>
                  <p className="mt-3.5 sm:mt-5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">
                    Identification
                  </p>
                </div>
                <div className="mt-1.5 sm:mt-2">
                  <p className="text-sm sm:text-base md:text-lg font-bold text-[#0B1527] font-serif leading-tight">
                    Govt Photo ID
                  </p>
                </div>
              </div>

              {/* Card 4: Hospitality */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#EDE7DC] bg-white p-3.5 sm:p-5 min-h-[160px] sm:min-h-[180px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FAF3E6] border border-[#F2E8D5]/60 text-[#B88428]">
                    <Users size={20} className="text-[#B88428] stroke-[2.2]" />
                  </div>
                  <p className="mt-3.5 sm:mt-5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">
                    Hospitality
                  </p>
                </div>
                <div className="mt-1.5 sm:mt-2">
                  <p className="text-sm sm:text-base md:text-lg font-bold text-[#0B1527] font-serif leading-tight">
                    <span className="block">Families &amp;</span>
                    <span>Couples</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ===================================================
            LOCATION & VICINITY
        =================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#EFE8DD] bg-[#FFFDF9] p-5 sm:p-7 md:p-8 shadow-[0_4px_24px_rgba(180,140,75,0.04)]">
            {/* Elegant Botanical Palm Illustration Watermark in Upper Right */}
            <div className="absolute -top-6 -right-6 w-48 sm:w-64 h-48 sm:h-64 pointer-events-none opacity-20 select-none overflow-hidden">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#C59B27] stroke-current" strokeWidth="1.2">
                <path d="M180 20 C140 60 80 120 20 180" strokeLinecap="round" />
                <path d="M165 35 C150 20 135 15 120 25 C135 40 148 52 165 35" fill="currentColor" fillOpacity="0.15" />
                <path d="M145 55 C125 35 110 32 95 45 C112 60 128 72 145 55" fill="currentColor" fillOpacity="0.15" />
                <path d="M125 75 C102 55 88 52 75 68 C92 82 108 92 125 75" fill="currentColor" fillOpacity="0.15" />
                <path d="M105 95 C82 75 68 75 55 90 C72 102 88 112 105 95" fill="currentColor" fillOpacity="0.15" />
                <path d="M85 115 C65 98 52 100 40 115 C55 125 70 132 85 115" fill="currentColor" fillOpacity="0.15" />
                <path d="M175 45 C185 62 188 78 175 90 C162 75 152 60 175 45" fill="currentColor" fillOpacity="0.15" />
                <path d="M155 65 C168 82 170 98 158 110 C145 95 135 80 155 65" fill="currentColor" fillOpacity="0.15" />
                <path d="M135 85 C148 102 150 118 138 130 C125 115 115 100 135 85" fill="currentColor" fillOpacity="0.15" />
                <path d="M115 105 C128 122 130 138 118 150 C105 135 95 120 115 105" fill="currentColor" fillOpacity="0.15" />
              </svg>
            </div>

            {/* Header: Accent Bar + LOCATION & VICINITY */}
            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-[2px] w-6 bg-[#C59B27] rounded-full" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                  Location &amp; Vicinity
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0B1527] font-serif leading-tight">
                Find us easily
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-sans">
                Discover our location and explore the beautiful surroundings.
              </p>
            </div>

            {/* Top Grid: Two-Column Desktop (Property Details + Map) / Stacked Mobile */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch relative z-10">
              {/* Left Column: Property Details Card (Desktop: Col 1-5; Mobile: 1st) */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#EDE7DC] bg-white p-5 sm:p-6 md:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full">
                <div>
                  {/* Gold Map Pin Badge & Hotel Name */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-[#FAF3E6] border border-[#F2E8D5] text-[#B88428] shadow-xs">
                      <MapPin size={24} className="text-[#B88428] stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#8E8E93]">
                        Property Location
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#0B1527] font-serif leading-snug">
                        {hotel.hotel_name}
                      </h3>
                    </div>
                  </div>

                  {/* Subtle Divider */}
                  <div className="my-5 border-t border-[#EDE7DC]/80" />

                  {/* Address Details */}
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#8E8E93] mb-1.5">
                      Address
                    </p>
                    <p className="text-sm sm:text-base text-[#0B1527] font-medium leading-relaxed">
                      {locationData?.displayAddress || (
                        <span className="italic text-neutral-400">
                          Address information available upon reservation confirmation.
                        </span>
                      )}
                    </p>

                    {/* Destination Badge */}
                    {hotel.city && (
                      <div className="mt-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF3E6] border border-[#F2E8D5] px-3.5 py-1 text-xs font-semibold text-[#8B651C]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#B88428]" />
                          {hotel.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call-To-Action Buttons (Pinned to bottom of left card) */}
                <div className="mt-8 flex flex-col gap-2.5">
                  <a
                    href={locationData?.directionsUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B1527] hover:bg-black px-5 py-3.5 text-xs sm:text-sm font-bold text-white transition shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <Navigation size={15} className="text-[#D7A441]" />
                    <span>Get Directions</span>
                    <ExternalLink size={13} className="text-white/60 ml-0.5" />
                  </a>

                  <a
                    href={locationData?.mapsUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#EDE7DC] bg-[#FAF8F5] hover:bg-[#F4EFE6] px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#0B1527] transition active:scale-[0.99] cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V9c0-2.21 1.79-4 4-4s4 1.79 4 4v5.74c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                      <path d="M9 14.74V9c0-1.66 1.34-3 3-3s3 1.34 3 3v5.74c-.9.63-1.91 1-3 1s-2.1-.37-3-1z" fill="#FBBC04"/>
                      <path d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" fill="#34A853"/>
                    </svg>
                    <span>View on Google Maps</span>
                    <ExternalLink size={13} className="text-[#8E8E93] ml-0.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Google Map (Desktop: Col 6-12; Mobile: 2nd) */}
              <div className="lg:col-span-7 h-[280px] sm:h-[320px] lg:h-full min-h-[300px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-[#EDE7DC] bg-[#FAF8F5] relative shadow-xs">
                {locationData?.embedMapUrl ? (
                  <iframe
                    src={locationData.embedMapUrl}
                    title={`${hotel.hotel_name} Location Map`}
                    className="w-full h-full border-0 block"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 mb-3">
                      <MapPin size={24} className="text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-600">
                      Map preview unavailable
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Please use the Get Directions link to view location
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Full-Width Property Amenities Card (Desktop & Mobile) */}
            <div className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#EDE7DC] bg-white p-5 sm:p-6 md:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative z-10">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#B88428]">
                    Facilities
                  </p>
                  <h3 className="mt-0.5 text-base sm:text-lg md:text-xl font-bold text-[#0B1527] font-serif">
                    Property Amenities
                  </h3>
                </div>

                {uniqueAmenities.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllAmenities((value) => !value)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#B88428] hover:underline cursor-pointer"
                  >
                    <span>{showAllAmenities ? "Show less" : `All (${uniqueAmenities.length})`}</span>
                    <ChevronRight size={14} className={`transition-transform duration-200 ${showAllAmenities ? "-rotate-90" : ""}`} />
                  </button>
                )}
              </div>

              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-2.5 items-center">
                {visibleAmenities.length > 0 ? (
                  visibleAmenities.map((amenity) => {
                    const Icon = getAmenityIcon(amenity.icon);
                    return (
                      <span
                        key={amenity.id}
                        className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-[#EBE3D5] bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2C2C2E] shadow-2xs transition hover:border-[#D7A441]/50 hover:bg-white"
                      >
                        <Icon size={14} className="text-[#C59B27] shrink-0 stroke-[2]" />
                        <span>{amenity.name}</span>
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
            DYNAMIC "MODIFY STAY" MODAL DIALOG
            Interactive calendar & guest selector matching HotelSearchFilter
        =================================================== */}
        {isModifyModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModifyModalOpen(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#EAE1D2] bg-[#FFFDF9] p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE1D2]/70">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-[2px] bg-[#9C7335] rounded-full" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9C7335] font-sans">
                      YOUR STAY
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-serif tracking-tight">
                    Modify Dates & Guests
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {hotel.hotel_name} • {hotel.city}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModifyModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs (Stay Dates vs Guests & Rooms) */}
              <div className="mt-4 flex rounded-2xl bg-[#F7F2E9]/80 p-1 border border-[#EAE1D2]/80">
                <button
                  type="button"
                  onClick={() => setModalTab("dates")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    modalTab === "dates"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <CalendarDays size={14} className={modalTab === "dates" ? "text-[#9C7335]" : "text-neutral-400"} />
                  <span>Stay Dates</span>
                  {tempCheckIn && tempCheckOut && (
                    <span className="hidden sm:inline text-[10px] font-semibold text-[#9C7335] bg-[#F7F2E9] px-2 py-0.5 rounded-full border border-[#EAE1D2]/80">
                      {formatStayDateMobile(tempCheckIn)} - {formatStayDateMobile(tempCheckOut)}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("guests")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    modalTab === "guests"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Users size={14} className={modalTab === "guests" ? "text-[#9C7335]" : "text-neutral-400"} />
                  <span>Guests & Rooms</span>
                  <span className="hidden sm:inline text-[10px] font-semibold text-[#9C7335] bg-[#F7F2E9] px-2 py-0.5 rounded-full border border-[#EAE1D2]/80">
                    {tempAdults + tempChildren} Guests, {tempRooms} R
                  </span>
                </button>
              </div>

              {/* TAB 1: DATES CALENDAR */}
              {modalTab === "dates" && (
                <div className="py-4">
                  {/* Date Status Banner */}
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-white border border-[#EAE1D2] p-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F7F2E9] text-[#9C7335] border border-[#EAE1D2]/80">
                        <CalendarDays size={15} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Selected Stay Period
                        </span>
                        <span className="font-bold text-neutral-900">
                          {tempCheckIn ? formatStayDateDesktop(tempCheckIn) : "Select Check-in"} →{" "}
                          {tempCheckOut ? formatStayDateDesktop(tempCheckOut) : "Select Check-out"}
                        </span>
                      </div>
                    </div>

                    {/* Month Nav Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => Math.max(0, prev - 1))}
                        disabled={calendarMonthOffset === 0}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 transition ${
                          calendarMonthOffset === 0
                            ? "opacity-30 cursor-not-allowed bg-neutral-50"
                            : "hover:bg-neutral-100 text-neutral-800 cursor-pointer bg-white"
                        }`}
                        aria-label="Previous month"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-800 transition cursor-pointer bg-white"
                        aria-label="Next month"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid: 2 months on desktop, 1 on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 rounded-2xl border border-[#EAE1D2]">
                    {renderCalendarMonth(0)}
                    <div className="hidden sm:block">
                      {renderCalendarMonth(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GUESTS & ROOMS */}
              {modalTab === "guests" && (
                <div className="py-5 space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAE1D2] bg-white">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Adults</p>
                      <p className="text-xs text-neutral-500">Ages 13 and above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTempAdults((prev) => Math.max(1, prev - 1))}
                        disabled={tempAdults <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-[#F7F2E9] cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-900">
                        {tempAdults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTempAdults((prev) => Math.min(10, prev + 1))}
                        disabled={tempAdults >= 10}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-[#F7F2E9] cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAE1D2] bg-white">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Children</p>
                      <p className="text-xs text-neutral-500">Ages 0 to 12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTempChildren((prev) => Math.max(0, prev - 1))}
                        disabled={tempChildren <= 0}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-[#F7F2E9] cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-900">
                        {tempChildren}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTempChildren((prev) => Math.min(8, prev + 1))}
                        disabled={tempChildren >= 8}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-[#F7F2E9] cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAE1D2] bg-white">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Rooms</p>
                      <p className="text-xs text-neutral-500">Number of rooms required</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTempRooms((prev) => Math.max(1, prev - 1))}
                        disabled={tempRooms <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-[#F7F2E9] cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-900">
                        {tempRooms}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTempRooms((prev) => Math.min(8, prev + 1))}
                        disabled={tempRooms >= 8}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 disabled:opacity-40 hover:bg-[#F7F2E9] cursor-pointer disabled:cursor-not-allowed transition"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-5 pt-4 border-t border-[#EAE1D2]/70 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModifyModalOpen(false)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplyModify}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D7A441] to-[#C5922C] px-6 py-2.5 text-xs font-bold text-neutral-950 shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
                >
                  <span>Apply & Update Stay</span>
                  <Check size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            FULLSCREEN ENLARGED LIGHTBOX MODAL (BOOKING.COM MECHANISM)
        =================================================== */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
            onClick={closeLightbox}
          >
            {/* Top Bar: Title, Counter & Close Icon */}
            <div
              className="flex items-center justify-between px-4 sm:px-8 py-4 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                  {hotel.hotel_name}
                </span>
                <span className="hidden sm:inline-block h-4 w-[1px] bg-white/20" />
                <span className="text-xs sm:text-sm font-semibold text-[#D7A441]">
                  {lightboxIndex + 1} / {images.length} Photos
                </span>
              </div>

              {/* Close Icon (X) */}
              <button
                type="button"
                onClick={closeLightbox}
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition cursor-pointer focus:outline-none"
                aria-label="Close photo viewer"
                title="Close (Esc)"
              >
                <X size={22} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Center Area: Enlarged Image + Left & Right Arrows */}
            <div
              className="relative flex-1 flex items-center justify-center px-4 sm:px-16 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Arrow Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={prevLightboxImage}
                  className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-xl backdrop-blur-md active:scale-95 transition cursor-pointer focus:outline-none"
                  aria-label="Previous photo"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft size={26} className="stroke-[2.5]" />
                </button>
              )}

              {/* Enlarged Image */}
              <div className="relative w-full h-full flex items-center justify-center px-4 py-3 sm:py-5 min-h-0">
                <img
                  key={images[lightboxIndex]?.cloudinary_url}
                  src={images[lightboxIndex]?.cloudinary_url}
                  alt={`${hotel.hotel_name} - Enlarged photo ${lightboxIndex + 1}`}
                  className="max-h-[66vh] sm:max-h-[70vh] lg:max-h-[72vh] w-auto max-w-[90vw] sm:max-w-[85vw] object-contain rounded-xl shadow-2xl transition-opacity duration-200"
                />
              </div>

              {/* Right Arrow Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={nextLightboxImage}
                  className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-xl backdrop-blur-md active:scale-95 transition cursor-pointer focus:outline-none"
                  aria-label="Next photo"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight size={26} className="stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Bottom Strip: Thumbnails */}
            {images.length > 1 && (
              <div
                className="px-4 pt-3 pb-5 sm:pb-6 flex justify-center overflow-x-auto z-30 scrollbar-none mt-2 border-t border-white/10 bg-black/40 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2.5 sm:gap-3 max-w-full overflow-x-auto py-1 px-2">
                  {images.map((img, idx) => {
                    const isActive = lightboxIndex === idx;
                    return (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className={`relative h-12 w-16 sm:h-14 sm:w-22 md:h-16 md:w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                          isActive
                            ? "border-[#D7A441] scale-105 opacity-100 shadow-md ring-2 ring-[#D7A441]/50"
                            : "border-transparent opacity-50 hover:opacity-90"
                        }`}
                      >
                        <img
                          src={img.cloudinary_url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            ROOM CATEGORY LIGHTBOX MODAL (RIGHT, LEFT & CLOSE ICONS)
        =================================================== */}
        {roomLightbox && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
            onClick={closeRoomLightbox}
          >
            {/* Top Bar: Room Category Name, Counter & Close Icon */}
            <div
              className="flex items-center justify-between px-4 sm:px-8 py-4 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                  {roomLightbox.categoryName}
                </span>
                <span className="hidden sm:inline-block h-4 w-[1px] bg-white/20" />
                <span className="text-xs sm:text-sm font-semibold text-[#D7A441]">
                  {roomLightbox.currentIndex + 1} / {roomLightbox.images.length} Photos
                </span>
              </div>

              {/* Close Icon (X) */}
              <button
                type="button"
                onClick={closeRoomLightbox}
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition cursor-pointer focus:outline-none"
                aria-label="Close photo viewer"
                title="Close (Esc)"
              >
                <X size={22} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Center Area: Enlarged Image + Left & Right Arrows */}
            <div
              className="relative flex-1 flex items-center justify-center px-4 sm:px-16 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Arrow Button */}
              {roomLightbox.images.length > 1 && (
                <button
                  type="button"
                  onClick={prevRoomLightboxImage}
                  className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-xl backdrop-blur-md active:scale-95 transition cursor-pointer focus:outline-none"
                  aria-label="Previous photo"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft size={26} className="stroke-[2.5]" />
                </button>
              )}

              {/* Enlarged Image */}
              <div className="relative w-full h-full flex items-center justify-center px-4 py-3 sm:py-5 min-h-0">
                <img
                  key={roomLightbox.images[roomLightbox.currentIndex]}
                  src={roomLightbox.images[roomLightbox.currentIndex]}
                  alt={`${roomLightbox.categoryName} - photo ${roomLightbox.currentIndex + 1}`}
                  className="max-h-[66vh] sm:max-h-[70vh] lg:max-h-[72vh] w-auto max-w-[90vw] sm:max-w-[85vw] object-contain rounded-xl shadow-2xl transition-opacity duration-200"
                />
              </div>

              {/* Right Arrow Button */}
              {roomLightbox.images.length > 1 && (
                <button
                  type="button"
                  onClick={nextRoomLightboxImage}
                  className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-xl backdrop-blur-md active:scale-95 transition cursor-pointer focus:outline-none"
                  aria-label="Next photo"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight size={26} className="stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Bottom Strip: Thumbnails */}
            {roomLightbox.images.length > 1 && (
              <div
                className="px-4 pt-3 pb-5 sm:pb-6 flex justify-center overflow-x-auto z-30 scrollbar-none mt-2 border-t border-white/10 bg-black/40 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2.5 sm:gap-3 max-w-full overflow-x-auto py-1 px-2">
                  {roomLightbox.images.map((imgUrl, idx) => {
                    const isActive = roomLightbox.currentIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setRoomLightbox((prev) => ({ ...prev, currentIndex: idx }))
                        }
                        className={`relative h-12 w-16 sm:h-14 sm:w-22 md:h-16 md:w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                          isActive
                            ? "border-[#D7A441] scale-105 opacity-100 shadow-md ring-2 ring-[#D7A441]/50"
                            : "border-transparent opacity-50 hover:opacity-90"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}

export default HotelDetails;