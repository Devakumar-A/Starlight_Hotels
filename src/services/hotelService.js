import { supabase } from "../lib/supabase";

// ---------------------------------------------------------
// GET ALL HOTELS
// ---------------------------------------------------------

export async function getHotels() {
  const { data, error } = await supabase
    .from("hotels")
    .select(`
      id,
      hotel_name,
      description,
      address,
      city,
      is_active,
      google_maps_place_id
    `)
    .eq("is_active", true)
    .order("hotel_name");

  if (error) throw error;

  return data || [];
}


// ---------------------------------------------------------
// GET ONE HOTEL
// ---------------------------------------------------------

export async function getHotelById(hotelId) {
  const { data, error } = await supabase
    .from("hotels")
    .select(`
      id,
      hotel_name,
      description,
      address,
      city,
      is_active,
      google_maps_place_id
    `)
    .eq("id", hotelId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  return data;
}


// ---------------------------------------------------------
// GET HOTEL MEDIA
// ---------------------------------------------------------

export async function getHotelMedia(hotelId) {
  const { data, error } = await supabase
    .from("media")
    .select(`
      id,
      hotel_id,
      cloudinary_url,
      public_id,
      media_type,
      room_category_id,
      sort_order
    `)
    .eq("hotel_id", hotelId)
    .is("room_category_id", null)
    .eq("media_type", "image")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return data || [];
}


// ---------------------------------------------------------
// GET ROOM CATEGORIES
// ---------------------------------------------------------

export async function getRoomCategories(hotelId) {
  const { data, error } = await supabase
    .from("room_categories")
    .select(`
      id,
      hotel_id,
      category_name,
      description,
      total_rooms,
      max_occupancy,
      default_price,
      is_active
    `)
    .eq("hotel_id", hotelId)
    .eq("is_active", true)
    .order("category_name");

  if (error) throw error;

  return data || [];
}


// ---------------------------------------------------------
// GET AVAILABILITY
// ---------------------------------------------------------

export async function getAvailability(
  hotelId,
  checkInDate,
  checkOutDate
) {
  const { data, error } = await supabase.rpc(
    "get_availability",
    {
      p_hotel_id: hotelId,
      p_check_in_date: checkInDate,
      p_check_out_date: checkOutDate,
    }
  );

  if (error) throw error;

  return data || [];
}


// ---------------------------------------------------------
// GET ROOM PRICING
// ---------------------------------------------------------

export async function getRoomPricing(
  roomCategoryId,
  checkInDate,
  checkOutDate
) {
  const { data, error } = await supabase.rpc(
    "get_room_pricing",
    {
      p_room_category_id: roomCategoryId,
      p_check_in_date: checkInDate,
      p_check_out_date: checkOutDate,
    }
  );

  if (error) throw error;

  return data || [];
}


// ---------------------------------------------------------
// GET AMENITIES FOR HOTEL
// ---------------------------------------------------------

export async function getHotelAmenities(roomCategoryIds) {
  if (!roomCategoryIds || roomCategoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("room_category_amenities")
    .select(`
      room_category_id,
      is_active,
      amenities (
        id,
        name,
        icon,
        category_id,
        amenity_categories (
          id,
          name
        )
      )
    `)
    .in("room_category_id", roomCategoryIds)
    .eq("is_active", true);

  if (error) throw error;

  return data || [];
}
export async function getRoomCategoryAmenities(roomCategoryId) {
  if (!roomCategoryId) return [];

  const { data, error } = await supabase
    .from("room_category_amenities")
    .select(`
      amenity_id,
      is_active,
      amenities (
        id,
        name,
        icon,
        category_id,
        amenity_categories (
          id,
          name
        )
      )
    `)
    .eq("room_category_id", roomCategoryId)
    .eq("is_active", true);

  if (error) throw error;

  return data || [];
}

// ---------------------------------------------------------
// CREATE BOOKING
// ---------------------------------------------------------

export async function createBooking({
  numberOfGuests,
  checkInDate,
  checkOutDate,
  roomCategoryId,
  roomsRequested,
}) {
  const { data, error } = await supabase.rpc(
    "create_booking",
    {
      p_number_of_guests: numberOfGuests,
      p_check_in_date: checkInDate,
      p_check_out_date: checkOutDate,
      p_room_category_id: roomCategoryId,
      p_rooms_requested: roomsRequested,
    }
  );

  if (error) throw error;

  return data?.[0] || null;
}