import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Hotel,
  Users,
  Eye,
  X,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelConfirmBooking, setCancelConfirmBooking] =
    useState(null);
  const [cancellingBookingId, setCancellingBookingId] =
    useState(null);

  const navigate = useNavigate();

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

      setError(
        error?.message ||
        "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const getDetails = (booking) => {
    const bookingRooms =
      booking.booking_rooms || [];

    const firstRoom =
      bookingRooms[0]?.rooms;

    const category =
      firstRoom?.room_categories;

    const hotel =
      category?.hotels;

    return {
      hotelName:
        hotel?.hotel_name || "Hotel",

      categoryName:
        category?.category_name || "Room",

      city:
        hotel?.city || "",

      address:
        hotel?.address || "",

      placeId:
        hotel?.google_maps_place_id || "",

      roomCount:
        bookingRooms.length,

      roomNumbers:
        bookingRooms
          .map(
            (item) =>
              item?.rooms?.room_number
          )
          .filter(Boolean),

      totalAmount:
        bookingRooms.reduce(
          (total, item) =>
            total +
            Number(item?.price || 0),
          0
        ),
    };
  };

  const getNights = (
    checkIn,
    checkOut
  ) => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(
      `${checkIn}T00:00:00`
    );

    const end = new Date(
      `${checkOut}T00:00:00`
    );

    return Math.max(
      0,
      Math.round(
        (end - start) /
        (1000 * 60 * 60 * 24)
      )
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatBookedDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    switch (
    status?.toLowerCase()
    ) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/90";

      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/90";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200/90";
    }
  };

  const openGoogleMaps = (booking) => {
    const details =
      getDetails(booking);

    if (!details.placeId) {
      setError(
        "Google Maps location is not available for this hotel."
      );
      return;
    }

    const query = encodeURIComponent(
      `${details.hotelName}, ${details.city}`
    );

    const placeId = encodeURIComponent(
      details.placeId
    );

    const url =
      `https://www.google.com/maps/search/?api=1` +
      `&query=${query}` +
      `&query_place_id=${placeId}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCancelBooking = async (
    booking
  ) => {
    try {
      setCancellingBookingId(
        booking.id
      );

      setError("");

      const { error } =
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
          })
          .eq("id", booking.id);

      if (error) throw error;

      setCancelConfirmBooking(null);
      setSelectedBooking(null);

      await loadBookings();
    } catch (error) {
      console.error(
        "CANCEL BOOKING ERROR:",
        error
      );

      setError(
        error?.message ||
        "Unable to cancel the booking."
      );
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
          <div className="mx-auto max-w-5xl">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-3 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Header skeleton */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 w-56 animate-pulse rounded-xl bg-neutral-200" />
                <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-neutral-200" />
              </div>
              <div className="h-10 w-24 animate-pulse rounded-xl bg-neutral-200" />
            </div>

            {/* Bookings cards skeleton */}
            <div className="mt-8 space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
                    <div className="space-y-2">
                      <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200" />
                      <div className="h-4 w-32 animate-pulse rounded-lg bg-neutral-200" />
                    </div>
                    <div className="h-8 w-36 animate-pulse rounded-full bg-neutral-200" />
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-24 rounded-2xl animate-pulse bg-neutral-100"
                      />
                    ))}
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

  const confirmedCount = bookings.filter(
    (b) => b.status?.toLowerCase() === "confirmed"
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between text-neutral-900 selection:bg-neutral-200 selection:text-neutral-900">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Top Row: Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/profile");
                  }
                }}
                aria-label="Go back"
                title="Go back"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <ArrowLeft size={17} className="transition-transform hover:-translate-x-0.5" />
              </button>

              <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium min-w-0">
                <Link to="/" className="hover:text-neutral-900 transition-colors shrink-0">
                  Home
                </Link>
                <ChevronRight size={13} className="text-neutral-400 shrink-0" />
                <Link to="/profile" className="hover:text-neutral-900 transition-colors shrink-0">
                  Account
                </Link>
                <ChevronRight size={13} className="text-neutral-400 shrink-0" />
                <span className="text-neutral-900 font-semibold truncate">My Bookings</span>
              </nav>
            </div>
          </div>

          {/* Page Header */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Reservations & Stays
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                My Bookings
              </h1>
              <p className="mt-1.5 text-sm text-neutral-600">
                View, manage, and track your confirmed reservations, room vouchers, and stay details.
              </p>
            </div>

            {bookings.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                  Total Bookings: {bookings.length}
                </span>
                {confirmedCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {confirmedCount} Confirmed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ERROR NOTIFICATION */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 transition-all">
              <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
              <div className="flex-1 font-medium">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-neutral-400 hover:text-neutral-600 ml-auto"
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!error && bookings.length === 0 && (
            <div className="mt-8 rounded-3xl border border-neutral-200/90 bg-white p-10 sm:p-14 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
                <Hotel size={32} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-neutral-900">
                No reservations found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 leading-relaxed">
                You haven't made any hotel reservations yet. Browse our handpicked collection of luxury suites, villas, and destinations.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/book-hotels"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-black active:scale-[0.99]"
                >
                  <Sparkles size={16} />
                  <span>Browse Luxury Hotels</span>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99]"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

          {/* BOOKINGS LIST */}
          <div className="mt-8 space-y-6">
            {bookings.map((booking) => {
              const details = getDetails(booking);
              const nights = getNights(
                booking.check_in_date,
                booking.check_out_date
              );

              return (
                <div
                  key={booking.id}
                  className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-xs transition hover:shadow-sm"
                >
                  {/* TOP ROW: HOTEL INFO & REFERENCE */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                          {details.hotelName}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {details.city && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
                          <MapPin size={14} className="text-neutral-400 shrink-0" />
                          <span>{details.city}</span>
                          {details.address && (
                            <>
                              <span className="text-neutral-300">•</span>
                              <span className="text-neutral-400 truncate max-w-md">
                                {details.address}
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between items-center">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                        Booking ID
                      </span>
                      <span className="mt-0.5 font-mono text-xs sm:text-sm font-semibold text-neutral-900 bg-neutral-100/90 border border-neutral-200/70 px-2.5 py-1 rounded-lg">
                        {booking.booking_reference}
                      </span>
                    </div>
                  </div>

                  {/* INFORMATION GRID (Symmetrical 4-Tile Row) */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* STAY DATES */}
                    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-4 transition hover:bg-neutral-50">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Stay Dates
                          </span>
                          <CalendarDays size={16} className="text-neutral-400" />
                        </div>

                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">In:</span>
                            <span className="font-semibold text-neutral-900">
                              {formatDate(booking.check_in_date)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">Out:</span>
                            <span className="font-semibold text-neutral-900">
                              {formatDate(booking.check_out_date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-neutral-500">
                          Duration
                        </span>
                        <span className="text-xs font-semibold text-neutral-800">
                          {nights} {nights === 1 ? "night" : "nights"}
                        </span>
                      </div>
                    </div>

                    {/* ROOM CATEGORY */}
                    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-4 transition hover:bg-neutral-50">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Accommodation
                          </span>
                          <Hotel size={16} className="text-neutral-400" />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-neutral-900 truncate" title={details.categoryName}>
                          {details.categoryName}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {details.roomCount} {details.roomCount === 1 ? "room" : "rooms"}
                          {details.roomNumbers.length > 0 && (
                            <span className="ml-1 text-neutral-400">
                              (Room {details.roomNumbers.join(", ")})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-200/60">
                        <span className="text-[11px] text-neutral-400">
                          Starlight Verified Suite
                        </span>
                      </div>
                    </div>

                    {/* GUESTS */}
                    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-4 transition hover:bg-neutral-50">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Guests
                          </span>
                          <Users size={16} className="text-neutral-400" />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-neutral-900">
                          {booking.number_of_guests}{" "}
                          {booking.number_of_guests === 1 ? "Guest" : "Guests"}
                        </p>

                        {booking.guest_name && (
                          <p className="mt-1 text-xs text-neutral-500 truncate" title={booking.guest_name}>
                            {booking.guest_name}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-200/60">
                        <span className="text-[11px] text-neutral-400">
                          Primary guest reservation
                        </span>
                      </div>
                    </div>

                    {/* TOTAL AMOUNT */}
                    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-4 transition hover:bg-neutral-50">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            Total Paid
                          </span>
                          <ShieldCheck size={16} className="text-emerald-600" />
                        </div>

                        <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                          ₹{details.totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">
                          All taxes & fees incl.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD ACTIONS FOOTER */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-100 pt-5">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Clock size={13} />
                      <span>Booked on {formatBookedDate(booking.created_at)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {details.placeId && (
                        <button
                          type="button"
                          onClick={() => openGoogleMaps(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99]"
                        >
                          <MapPin size={14} className="text-neutral-500" />
                          <span>View Location</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99]"
                      >
                        <Eye size={14} className="text-neutral-500" />
                        <span>View Details</span>
                      </button>

                      {booking.status?.toLowerCase() === "pending" && (
                        <button
                          type="button"
                          onClick={() => setCancelConfirmBooking(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 hover:border-rose-300 active:scale-[0.99]"
                        >
                          <span>Cancel Booking</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ==================================================
           DETAILS POPUP MODAL
         ================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 py-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-neutral-200/90 overflow-hidden my-auto">
            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-neutral-100 px-6 sm:px-8 py-5 sm:py-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Reservation Voucher
                </p>

                <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-neutral-900">
                  {getDetails(selectedBooking).hotelName}
                </h2>

                {getDetails(selectedBooking).city && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin size={13} className="text-neutral-400" />
                    <span>{getDetails(selectedBooking).city}</span>
                    {getDetails(selectedBooking).address && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <span className="text-neutral-400 truncate max-w-xs">
                          {getDetails(selectedBooking).address}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const details = getDetails(selectedBooking);
              const nights = getNights(
                selectedBooking.check_in_date,
                selectedBooking.check_out_date
              );

              return (
                <div className="px-6 sm:px-8 py-6 max-h-[75vh] overflow-y-auto">
                  {/* BOOKING REFERENCE + STATUS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Booking Reference
                      </p>
                      <p className="mt-0.5 font-mono text-base font-semibold text-neutral-900">
                        {selectedBooking.booking_reference}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>

                  {/* STAY DATES (2-Col) */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Check-in
                      </span>
                      <p className="mt-1.5 text-base font-semibold text-neutral-900">
                        {formatDate(selectedBooking.check_in_date)}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        From 12:00 PM onwards
                      </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Check-out
                      </span>
                      <p className="mt-1.5 text-base font-semibold text-neutral-900">
                        {formatDate(selectedBooking.check_out_date)}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Until 11:00 AM
                      </p>
                    </div>
                  </div>

                  {/* BOOKING INFORMATION (3-Col) */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Category
                      </p>
                      <p className="mt-1 text-sm font-semibold text-neutral-900 truncate">
                        {details.categoryName}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Rooms
                      </p>
                      <p className="mt-1 text-sm font-semibold text-neutral-900">
                        {details.roomCount} {details.roomCount === 1 ? "Room" : "Rooms"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Guests
                      </p>
                      <p className="mt-1 text-sm font-semibold text-neutral-900">
                        {selectedBooking.number_of_guests} {selectedBooking.number_of_guests === 1 ? "Guest" : "Guests"}
                      </p>
                    </div>
                  </div>

                  {/* GUEST CONTACT DETAILS (if available) */}
                  {(selectedBooking.guest_name || selectedBooking.guest_email || selectedBooking.guest_phone) && (
                    <div className="mt-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Guest Contact Details
                      </p>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {selectedBooking.guest_name && (
                          <div>
                            <span className="text-neutral-400">Name: </span>
                            <span className="font-medium text-neutral-800">{selectedBooking.guest_name}</span>
                          </div>
                        )}
                        {selectedBooking.guest_email && (
                          <div>
                            <span className="text-neutral-400">Email: </span>
                            <span className="font-medium text-neutral-800">{selectedBooking.guest_email}</span>
                          </div>
                        )}
                        {selectedBooking.guest_phone && (
                          <div>
                            <span className="text-neutral-400">Phone: </span>
                            <span className="font-medium text-neutral-800">{selectedBooking.guest_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUMMARY DURATION & PRICE */}
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-900 p-5 text-white">
                    <div>
                      <p className="text-xs text-neutral-300">
                        Duration of Stay
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-white">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-neutral-300">
                        Total Amount Paid
                      </p>
                      <p className="mt-0.5 text-xl sm:text-2xl font-bold text-white">
                        ₹{details.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION BUTTON */}
                  {details.placeId && (
                    <button
                      type="button"
                      onClick={() => openGoogleMaps(selectedBooking)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-800 shadow-xs transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99]"
                    >
                      <MapPin size={16} className="text-neutral-600" />
                      <span>Open Location in Google Maps</span>
                      <ExternalLink size={14} className="text-neutral-400 ml-1" />
                    </button>
                  )}

                  {/* CANCEL BUTTON */}
                  {selectedBooking.status?.toLowerCase() === "pending" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBooking(null);
                        setCancelConfirmBooking(selectedBooking);
                      }}
                      className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50/70 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 active:scale-[0.99]"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================================================
           CANCEL CONFIRMATION MODAL
         ================================================== */}
      {cancelConfirmBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-neutral-200/90">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={24} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-neutral-900">
              Cancel Reservation?
            </h2>

            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              Are you sure you want to cancel booking reference{" "}
              <strong className="font-semibold text-neutral-900 font-mono">
                {cancelConfirmBooking.booking_reference}
              </strong>
              ? Once cancelled, this reservation cannot be reactivated.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelConfirmBooking(null)}
                disabled={Boolean(cancellingBookingId)}
                className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={() => handleCancelBooking(cancelConfirmBooking)}
                disabled={Boolean(cancellingBookingId)}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {cancellingBookingId ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}