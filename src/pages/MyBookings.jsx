import { useEffect, useState } from "react";
import {
  CalendarDays,
  Hotel,
  Users,
  Eye,
  X,
  MapPin,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelConfirmBooking, setCancelConfirmBooking] =
    useState(null);
  const [cancellingBookingId, setCancellingBookingId] =
    useState(null);

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
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
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
      <main className="min-h-screen bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-200 p-8">
            <p className="text-base text-gray-500">
              Loading your bookings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-base font-medium text-gray-500">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            My Bookings
          </h1>

          <p className="mt-2 text-base text-gray-500">
            View and manage your hotel bookings.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-base text-gray-600">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error &&
          bookings.length === 0 && (
            <div className="rounded-2xl border border-gray-200 p-12 text-center">

              <Hotel
                size={44}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-4 text-xl font-semibold">
                No bookings yet
              </h2>

              <p className="mt-2 text-base text-gray-500">
                Your hotel bookings will appear here.
              </p>

              <button
                onClick={() =>
                (window.location.href =
                  "/book-hotels")
                }
                className="mt-6 rounded-xl bg-black px-6 py-3 text-base font-semibold text-white"
              >
                Browse Hotels
              </button>
            </div>
          )}

        {/* BOOKINGS */}
        <div className="space-y-6">

          {bookings.map((booking) => {
            const details =
              getDetails(booking);

            const nights =
              getNights(
                booking.check_in_date,
                booking.check_out_date
              );

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-gray-200 bg-white p-7"
              >

                {/* TOP */}
                <div className="flex flex-col justify-between gap-5 sm:flex-row">

                  <div>
                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl font-semibold">
                        {details.hotelName}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    {details.city && (
                      <p className="mt-2 flex items-center gap-2 text-base text-gray-500">
                        <MapPin size={18} />
                        {details.city}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-400">
                      Booking Reference
                    </p>

                    <p className="mt-1 text-base font-semibold">
                      {
                        booking.booking_reference
                      }
                    </p>
                  </div>
                </div>

                {/* INFORMATION */}
                <div className="mt-7 grid gap-7 border-t border-gray-100 pt-7 sm:grid-cols-2 lg:grid-cols-4">

                  {/* STAY */}
                  <div className="flex gap-3">
                    <CalendarDays
                      size={21}
                      className="mt-1 text-gray-500"
                    />

                    <div>
                      <p className="text-sm text-gray-400">
                        Stay
                      </p>

                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          Check-in
                        </p>

                        <p className="text-base font-semibold">
                          {formatDate(
                            booking.check_in_date
                          )}
                        </p>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          Check-out
                        </p>

                        <p className="text-base font-semibold">
                          {formatDate(
                            booking.check_out_date
                          )}
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {nights}{" "}
                        {nights === 1
                          ? "night"
                          : "nights"}
                      </p>
                    </div>
                  </div>

                  {/* ROOM */}
                  <div className="flex gap-3">
                    <Hotel
                      size={21}
                      className="mt-1 text-gray-500"
                    />

                    <div>
                      <p className="text-sm text-gray-400">
                        Room
                      </p>

                      <p className="mt-2 text-base font-semibold">
                        {
                          details.categoryName
                        }
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {details.roomCount}{" "}
                        {details.roomCount ===
                          1
                          ? "room"
                          : "rooms"}
                      </p>
                    </div>
                  </div>

                  {/* GUESTS */}
                  <div className="flex gap-3">
                    <Users
                      size={21}
                      className="mt-1 text-gray-500"
                    />

                    <div>
                      <p className="text-sm text-gray-400">
                        Guests
                      </p>

                      <p className="mt-2 text-base font-semibold">
                        {
                          booking.number_of_guests
                        }{" "}
                        {booking.number_of_guests ===
                          1
                          ? "Guest"
                          : "Guests"}
                      </p>
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Total Amount
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      ₹
                      {details.totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="mt-7 flex flex-col justify-between gap-5 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">

                  <p className="text-sm text-gray-400">
                    Booked on{" "}
                    {formatBookedDate(
                      booking.created_at
                    )}
                  </p>

                  <div className="flex flex-wrap gap-3">

                    {details.placeId && (
                      <button
                        type="button"
                        onClick={() =>
                          openGoogleMaps(
                            booking
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-base font-medium hover:bg-gray-50"
                      >
                        <MapPin size={18} />
                        View Location
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBooking(
                          booking
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-base font-medium hover:bg-gray-50"
                    >
                      <Eye size={18} />
                      View Details
                    </button>

                    {booking.status?.toLowerCase() ===
                      "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            setCancelConfirmBooking(
                              booking
                            )
                          }
                          className="rounded-xl border border-red-200 px-5 py-3 text-base font-medium text-red-600 hover:bg-red-50"
                        >
                          Cancel Booking
                        </button>
                      )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================
           DETAILS POPUP
           ================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
              <div>
                <p className="text-sm text-gray-400">
                  Booking Details
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                  {getDetails(selectedBooking).hotelName}
                </h2>

                {getDetails(selectedBooking).city && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    {getDetails(selectedBooking).city}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={21} />
              </button>
            </div>

            {(() => {
              const details = getDetails(selectedBooking);

              const nights = getNights(
                selectedBooking.check_in_date,
                selectedBooking.check_out_date
              );

              return (
                <div className="px-7 py-6">

                  {/* BOOKING REFERENCE + STATUS */}
                  <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Booking Reference
                      </p>

                      <p className="mt-1 text-base font-semibold">
                        {selectedBooking.booking_reference}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-sm font-medium ${getStatusClass(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>

                  {/* STAY */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400">
                        Check-in
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatDate(
                          selectedBooking.check_in_date
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        12:00 PM
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-5">
                      <p className="text-xs text-gray-400">
                        Check-out
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatDate(
                          selectedBooking.check_out_date
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        11:00 AM
                      </p>
                    </div>

                  </div>

                  {/* BOOKING INFORMATION */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400">
                        Room Category
                      </p>

                      <p className="mt-1 font-semibold">
                        {details.categoryName}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400">
                        Rooms
                      </p>

                      <p className="mt-1 font-semibold">
                        {details.roomCount}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-400">
                        Guests
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedBooking.number_of_guests}
                      </p>
                    </div>

                  </div>

                  {/* SUMMARY */}
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 p-5">
                    <div>
                      <p className="text-xs text-gray-400">
                        Stay Duration
                      </p>

                      <p className="mt-1 font-semibold">
                        {nights}{" "}
                        {nights === 1 ? "night" : "nights"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        ₹
                        {details.totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}
                  {details.placeId && (
                    <button
                      type="button"
                      onClick={() =>
                        openGoogleMaps(selectedBooking)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
                    >
                      <MapPin size={18} />
                      View Location on Google Maps
                    </button>
                  )}

                  {/* CANCEL */}
                  {selectedBooking.status?.toLowerCase() ===
                    "pending" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBooking(null);
                          setCancelConfirmBooking(
                            selectedBooking
                          );
                        }}
                        className="mt-3 w-full rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Cancel Booking
                      </button>
                    )}

                </div>
              );
            })()}

          </div>
        </div>
      )}
      {/* ==================================================
          CANCEL CONFIRMATION
      ================================================== */}
      {cancelConfirmBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

            <h2 className="text-xl font-semibold">
              Cancel Booking?
            </h2>

            <p className="mt-3 text-base text-gray-500">
              Are you sure you want to cancel booking{" "}
              <strong className="text-gray-700">
                {
                  cancelConfirmBooking.booking_reference
                }
              </strong>
              ?
            </p>

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setCancelConfirmBooking(
                    null
                  )
                }
                disabled={
                  Boolean(
                    cancellingBookingId
                  )
                }
                className="rounded-xl border border-gray-300 px-5 py-3 text-base font-medium hover:bg-gray-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCancelBooking(
                    cancelConfirmBooking
                  )
                }
                disabled={
                  Boolean(
                    cancellingBookingId
                  )
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-base font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
              >
                {cancellingBookingId
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}