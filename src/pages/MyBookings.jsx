import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  BedDouble,
  Users,
  Eye,
  X,
  MapPin,
  Trash2,
  Hotel,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";
import profileBg from "../assets/profile background.png";

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelConfirmBooking, setCancelConfirmBooking] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (import.meta.env.DEV) {
          // Development preview fallback matching reference design
          const previewBookings = [
            {
              id: "demo-bk-1",
              booking_reference: "BK-8C878CF6FB",
              user_id: "demo-user",
              guest_name: "asdfg",
              guest_phone: "1234567890",
              guest_email: "devakumar.kl.in@gmail.com",
              number_of_guests: 2,
              check_in_date: "2026-10-17",
              check_out_date: "2026-10-18",
              status: "pending",
              created_at: "2026-10-17T10:30:00Z",
              booking_rooms: [
                {
                  id: "br-1",
                  price: 3700,
                  rooms: {
                    id: "r-1",
                    room_number: "201",
                    room_categories: {
                      id: "rc-1",
                      category_name: "Deluxe Rooms with Balcony",
                      hotels: {
                        id: "h-1",
                        hotel_name: "AR Residency",
                        city: "Chennai",
                        address: "Sivaji Street, T. Nagar, Chennai",
                        google_maps_place_id: "ChIJbU60g2m-UjoR5_2g5aZ1kQU",
                      },
                    },
                  },
                },
              ],
            },
          ];
          setBookings(previewBookings);
          setLoading(false);
          return;
        }
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          user_id,
          guest_name,
          guest_phone,
          guest_email,
          guest_address,
          number_of_guests,
          check_in_date,
          check_out_date,
          status,
          created_at,

          booking_rooms (
            id,
            room_id,
            price,

            rooms (
              id,
              room_number,
              room_category_id,

              room_categories (
                id,
                category_name,
                hotel_id,

                hotels (
                  id,
                  hotel_name,
                  city,
                  address,
                  google_maps_place_id
                )
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error("MY BOOKINGS ERROR:", error);
      setError(error?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  const getDetails = (booking) => {
    const bookingRooms = booking.booking_rooms || [];
    const firstRoom = bookingRooms[0]?.rooms;
    const category = firstRoom?.room_categories;
    const hotel = category?.hotels;

    return {
      hotelName: hotel?.hotel_name || "Hotel",
      categoryName: category?.category_name || "Room",
      city: hotel?.city || "",
      address: hotel?.address || "",
      placeId: hotel?.google_maps_place_id || "",
      roomCount: bookingRooms.length,
      roomNumbers: bookingRooms.map((item) => item?.rooms?.room_number).filter(Boolean),
      totalAmount: bookingRooms.reduce(
        (total, item) => total + Number(item?.price || 0),
        0
      ),
    };
  };

  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatBookedDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-[#EAF8F0] text-[#15803D] border-[#BDE8CF]";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "completed":
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
      default:
        // pending
        return "bg-[#FAF1D8] text-[#976A28] border-[#EEDBBA]";
    }
  };

  const openGoogleMaps = (booking) => {
    const details = getDetails(booking);
    if (!details.placeId && !details.hotelName) {
      setError("Google Maps location is not available for this hotel.");
      return;
    }

    const query = encodeURIComponent(`${details.hotelName}, ${details.city}`);
    const url = details.placeId
      ? `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(details.placeId)}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCancelBooking = async (booking) => {
    try {
      setCancellingBookingId(booking.id);
      setError("");

      if (booking.id === "demo-bk-1" && import.meta.env.DEV) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
        );
        setCancelConfirmBooking(null);
        setSelectedBooking(null);
        return;
      }

      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id);

      if (error) throw error;

      setCancelConfirmBooking(null);
      setSelectedBooking(null);
      await loadBookings();
    } catch (error) {
      console.error("CANCEL BOOKING ERROR:", error);
      setError(error?.message || "Unable to cancel the booking.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-between text-[#10213D]">
        {/* Skeleton Hero Banner */}
        <section
          className="relative w-full overflow-hidden bg-[#FAF8F3]"
          style={{
            backgroundImage: `url(${profileBg})`,
            backgroundSize: "cover",
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(250, 248, 243, 0.9) 0%, rgba(250, 248, 243, 0.65) 30%, rgba(250, 248, 243, 0.2) 55%, rgba(250, 248, 243, 0) 78%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-24 sm:pb-28 lg:pb-32">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/80 animate-pulse border border-neutral-200" />
              <div className="h-4 w-40 rounded bg-neutral-200/80 animate-pulse" />
            </div>
            <div className="mt-7 max-w-xl space-y-3">
              <div className="h-3 w-28 rounded bg-[#DDA52E]/30 animate-pulse" />
              <div className="h-10 w-60 rounded-xl bg-neutral-300/60 animate-pulse" />
              <div className="h-4 w-72 max-w-full rounded bg-neutral-200/80 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Skeleton Card */}
        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 lg:-mt-18 pb-16 sm:pb-20">
          <div className="rounded-2xl sm:rounded-3xl border border-[#E9E1D4] bg-white p-6 sm:p-8 shadow-[0_12px_40px_-15px_rgba(7,23,45,0.06)]">
            <div className="h-7 w-48 rounded bg-neutral-200 animate-pulse" />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-[#E9E1D4] pt-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-28 rounded-xl bg-[#FAF8F3] animate-pulse border border-[#E9E1D4]" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-between text-[#10213D] selection:bg-[#FAF3E7] selection:text-[#07172D]">
      {/* 1. UPPER HERO BANNER WITH LUXURY RESORT BACKGROUND */}
      <section
        className="relative w-full overflow-hidden bg-[#FAF8F3]"
        style={{
          backgroundImage: `url(${profileBg})`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Soft, natural cream gradient overlay preserving text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(250, 248, 243, 0.9) 0%, rgba(250, 248, 243, 0.65) 30%, rgba(250, 248, 243, 0.2) 55%, rgba(250, 248, 243, 0) 78%)",
          }}
        />

        {/* Mobile Supplementary Backdrop Tint */}
        <div className="absolute inset-0 bg-[#FAF8F3]/50 sm:hidden pointer-events-none" />

        {/* Hero Section Container */}
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-24 sm:pb-28 lg:pb-32">
          {/* Breadcrumb Navigation & Back Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              aria-label="Go back"
              title="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/90 bg-white/95 text-neutral-700 shadow-xs hover:border-[#DDA52E] hover:text-[#B88428] hover:bg-white hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>

            <nav className="flex items-center gap-2 text-xs sm:text-[13px] text-neutral-500 font-medium">
              <Link to="/" className="hover:text-neutral-900 transition-colors">
                Home
              </Link>
              <span className="text-neutral-400 font-normal">&gt;</span>
              <span className="text-neutral-900 font-semibold">My Bookings</span>
            </nav>
          </div>

          {/* Heading Block */}
          <div className="mt-6 sm:mt-8 max-w-2xl">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#DDA52E]">
              ACCOUNT
            </p>
            <h1 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#07172D] tracking-tight leading-tight">
              My Bookings
            </h1>
            <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm lg:text-[15px] text-[#687A96] leading-relaxed font-normal">
              View and manage your hotel bookings.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTAINER OVERLAPPING THE HERO BANNER */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 lg:-mt-18 pb-16 sm:pb-24">
        {/* Error notification banner */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && bookings.length === 0 && (
          <div className="rounded-2xl sm:rounded-3xl border border-[#E9E1D4] bg-white p-10 sm:p-14 text-center shadow-[0_12px_40px_-15px_rgba(7,23,45,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF3E7] text-[#DDA52E]">
              <Hotel size={32} />
            </div>
            <h2 className="mt-4 text-xl sm:text-2xl font-serif font-bold text-[#07172D]">
              No bookings yet
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#687A96] max-w-md mx-auto">
              Your hotel reservations and stay receipts will appear here once booked.
            </p>
            <Link
              to="/book-hotels"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#07172D] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#10213D] active:scale-[0.99] transition"
            >
              Browse Hotels
            </Link>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map((booking) => {
            const details = getDetails(booking);
            const nights = getNights(booking.check_in_date, booking.check_out_date);

            return (
              <div
                key={booking.id}
                className="rounded-2xl sm:rounded-3xl border border-[#E9E1D4] bg-white p-5 sm:p-8 shadow-[0_12px_40px_-15px_rgba(7,23,45,0.06)] transition-all hover:border-[#DDA52E]/40"
              >
                {/* A. CARD HEADER: Property Name, Status, Location, Booking Reference */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Hotel Title + Status + Location */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#10213D] tracking-tight">
                        {details.hotelName}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </div>

                    {details.city && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-[#687A96]">
                        <MapPin size={15} className="text-[#DDA52E] shrink-0" />
                        <span>{details.city}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: Booking Reference (Stacked below on mobile) */}
                  <div className="text-left sm:text-right pt-1 sm:pt-0 border-t border-[#E9E1D4]/60 sm:border-t-0">
                    <span className="text-xs text-[#687A96] font-medium block">
                      Booking Reference
                    </span>
                    <span className="mt-0.5 text-sm sm:text-base font-bold text-[#10213D] block tracking-wide">
                      {booking.booking_reference}
                    </span>
                  </div>
                </div>

                {/* B. STAY INFORMATION GRID: 4 Groups with Vertical Dividers on Desktop */}
                <div className="mt-6 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#E9E1D4]/80 border-t border-[#E9E1D4] pt-6 sm:pt-7">
                  {/* Group 1 — Stay */}
                  <div className="flex items-start gap-3.5 sm:gap-4 lg:pr-6">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#DDA52E]">
                      <CalendarDays size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-[#687A96] block">Stay</span>
                      <div className="mt-1 space-y-1">
                        <div>
                          <span className="text-[11px] text-[#687A96] block">Check-in</span>
                          <span className="text-xs sm:text-sm font-bold text-[#10213D] block">
                            {formatDate(booking.check_in_date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#687A96] block">Check-out</span>
                          <span className="text-xs sm:text-sm font-bold text-[#10213D] block">
                            {formatDate(booking.check_out_date)}
                          </span>
                        </div>
                        <span className="text-xs text-[#687A96] block pt-0.5">
                          {nights} {nights === 1 ? "night" : "nights"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Group 2 — Room */}
                  <div className="flex items-start gap-3.5 sm:gap-4 lg:px-6">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#DDA52E]">
                      <BedDouble size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-[#687A96] block">Room</span>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-[#10213D] leading-snug break-words">
                        {details.categoryName}
                      </p>
                      <span className="mt-1 text-xs text-[#687A96] block">
                        {details.roomCount} {details.roomCount === 1 ? "room" : "rooms"}
                      </span>
                    </div>
                  </div>

                  {/* Group 3 — Guests */}
                  <div className="flex items-start gap-3.5 sm:gap-4 lg:px-6">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#DDA52E]">
                      <Users size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-[#687A96] block">Guests</span>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-[#10213D]">
                        {booking.number_of_guests} {booking.number_of_guests === 1 ? "Guest" : "Guests"}
                      </p>
                    </div>
                  </div>

                  {/* Group 4 — Total Amount */}
                  <div className="flex items-start gap-3.5 sm:gap-4 lg:pl-6">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#DDA52E] font-bold text-base">
                      ₹
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-[#687A96] block">Total Amount</span>
                      <p className="mt-1 text-lg sm:text-xl font-bold text-[#10213D]">
                        ₹{Number(details.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* C. CARD FOOTER: Booking Date + Action Buttons */}
                <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E9E1D4] pt-5 sm:pt-6">
                  <p className="text-xs sm:text-sm text-[#687A96]">
                    Booked on {formatBookedDate(booking.created_at)}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                    {/* View Location */}
                    <button
                      type="button"
                      onClick={() => openGoogleMaps(booking)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5CDBC] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#10213D] shadow-xs hover:bg-[#FAF8F3] hover:border-[#C4B9A4] active:scale-[0.99] transition cursor-pointer"
                    >
                      <MapPin size={15} />
                      <span>View Location</span>
                    </button>

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5CDBC] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#10213D] shadow-xs hover:bg-[#FAF8F3] hover:border-[#C4B9A4] active:scale-[0.99] transition cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>View Details</span>
                    </button>

                    {/* Cancel Booking (only shown if not cancelled) */}
                    {booking.status?.toLowerCase() !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => setCancelConfirmBooking(booking)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-red-600 shadow-xs hover:bg-red-50 hover:border-red-300 active:scale-[0.99] transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ==================================================
          BOOKING DETAILS POPUP MODAL
          ================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white border border-[#E9E1D4] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E9E1D4] px-6 sm:px-8 py-5 sm:py-6">
              <div>
                <span className="text-xs text-[#687A96] font-medium uppercase tracking-wider">
                  Booking Details
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-serif font-bold text-[#07172D]">
                  {getDetails(selectedBooking).hotelName}
                </h2>
                {getDetails(selectedBooking).city && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-[#687A96]">
                    <MapPin size={15} className="text-[#DDA52E]" />
                    <span>{getDetails(selectedBooking).city}</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            {(() => {
              const details = getDetails(selectedBooking);
              const nights = getNights(
                selectedBooking.check_in_date,
                selectedBooking.check_out_date
              );

              return (
                <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-5">
                  {/* Reference & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#E9E1D4] bg-[#FAF8F3] p-4">
                    <div>
                      <span className="text-xs text-[#687A96] font-medium">Booking Reference</span>
                      <p className="mt-0.5 text-sm sm:text-base font-bold text-[#10213D] tracking-wide">
                        {selectedBooking.booking_reference}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${getStatusClass(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-[#E9E1D4] p-4 bg-white">
                      <span className="text-xs text-[#687A96]">Check-in</span>
                      <p className="mt-1 text-base font-bold text-[#10213D]">
                        {formatDate(selectedBooking.check_in_date)}
                      </p>
                      <span className="text-xs text-[#687A96]">From 12:00 PM</span>
                    </div>

                    <div className="rounded-2xl border border-[#E9E1D4] p-4 bg-white">
                      <span className="text-xs text-[#687A96]">Check-out</span>
                      <p className="mt-1 text-base font-bold text-[#10213D]">
                        {formatDate(selectedBooking.check_out_date)}
                      </p>
                      <span className="text-xs text-[#687A96]">Until 11:00 AM</span>
                    </div>
                  </div>

                  {/* Room & Guests */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-[#E9E1D4] p-4 bg-white">
                      <span className="text-xs text-[#687A96]">Room Category</span>
                      <p className="mt-1 text-sm font-bold text-[#10213D]">{details.categoryName}</p>
                    </div>

                    <div className="rounded-2xl border border-[#E9E1D4] p-4 bg-white">
                      <span className="text-xs text-[#687A96]">Rooms Booked</span>
                      <p className="mt-1 text-sm font-bold text-[#10213D]">
                        {details.roomCount} {details.roomCount === 1 ? "room" : "rooms"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E9E1D4] p-4 bg-white">
                      <span className="text-xs text-[#687A96]">Guests</span>
                      <p className="mt-1 text-sm font-bold text-[#10213D]">
                        {selectedBooking.number_of_guests}{" "}
                        {selectedBooking.number_of_guests === 1 ? "Guest" : "Guests"}
                      </p>
                    </div>
                  </div>

                  {/* Total summary */}
                  <div className="flex items-center justify-between rounded-2xl border border-[#E9E1D4] bg-[#FAF8F3] p-5">
                    <div>
                      <span className="text-xs text-[#687A96]">Stay Duration</span>
                      <p className="mt-0.5 text-sm font-bold text-[#10213D]">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#687A96]">Total Amount</span>
                      <p className="mt-0.5 text-xl font-bold text-[#10213D]">
                        ₹{Number(details.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => openGoogleMaps(selectedBooking)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5CDBC] bg-white px-5 py-3 text-sm font-semibold text-[#10213D] hover:bg-[#FAF8F3] transition cursor-pointer"
                    >
                      <MapPin size={16} />
                      <span>View on Google Maps</span>
                    </button>

                    {selectedBooking.status?.toLowerCase() !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => {
                          const toCancel = selectedBooking;
                          setSelectedBooking(null);
                          setCancelConfirmBooking(toCancel);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================================================
          CANCEL CONFIRMATION POPUP MODAL
          ================================================== */}
      {cancelConfirmBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white border border-[#E9E1D4] p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#07172D]">
              Cancel Booking?
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-[#687A96] leading-relaxed">
              Are you sure you want to cancel booking reference{" "}
              <strong className="text-[#07172D] font-bold">
                {cancelConfirmBooking.booking_reference}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelConfirmBooking(null)}
                disabled={Boolean(cancellingBookingId)}
                className="w-full sm:w-auto rounded-xl border border-[#D5CDBC] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#10213D] hover:bg-[#FAF8F3] transition cursor-pointer disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={() => handleCancelBooking(cancelConfirmBooking)}
                disabled={Boolean(cancellingBookingId)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-red-700 transition cursor-pointer disabled:bg-red-300"
              >
                {cancellingBookingId ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}