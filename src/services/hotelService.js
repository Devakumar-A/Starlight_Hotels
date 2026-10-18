import { supabase } from "../lib/supabase";

let hotelsCache = null;
let hotelsCacheTime = 0;
let hotelsInFlight = null;
const CACHE_TTL_MS = 60000;

const mediaCache = new Map();
const mediaInFlight = new Map();

// ---------------------------------------------------------
// GET ALL HOTELS (Cached + In-Flight Deduped)
// ---------------------------------------------------------

export async function getHotels() {
  const now = Date.now();
  if (hotelsCache && now - hotelsCacheTime < CACHE_TTL_MS) {
    return hotelsCache;
  }
  if (hotelsInFlight) {
    return hotelsInFlight;
  }

  hotelsInFlight = (async () => {
    try {
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

      hotelsCache = data || [];
      hotelsCacheTime = Date.now();
      return hotelsCache;
    } finally {
      hotelsInFlight = null;
    }
  })();

  return hotelsInFlight;
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
// GET BATCH HOTEL MEDIA (Single Query for N Hotels)
// ---------------------------------------------------------

export async function getHotelsMedia(hotelIds) {
  if (!hotelIds || hotelIds.length === 0) return {};

  const uniqueIds = Array.from(new Set(hotelIds.filter(Boolean)));
  const now = Date.now();
  const missingIds = [];
  const result = {};

  // Check cache first
  for (const id of uniqueIds) {
    const cached = mediaCache.get(id);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      result[id] = cached.data;
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length === 0) {
    return result;
  }

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
    .in("hotel_id", missingIds)
    .eq("media_type", "image")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: false });

  if (error) throw error;

  const grouped = {};
  (data || []).forEach((item) => {
    if (!grouped[item.hotel_id]) grouped[item.hotel_id] = [];
    grouped[item.hotel_id].push(item);
  });

  for (const id of missingIds) {
    const list = grouped[id] || [];
    let processed = [];
    if (list.length > 0) {
      const hotelLevel = list.filter((item) => !item.room_category_id);
      processed = hotelLevel.length > 0 ? hotelLevel : list;
    }
    result[id] = processed;
    mediaCache.set(id, { data: processed, timestamp: Date.now() });
  }

  return result;
}

// ---------------------------------------------------------
// GET HOTEL MEDIA (Cached + In-Flight Deduped)
// ---------------------------------------------------------

export async function getHotelMedia(hotelId) {
  if (!hotelId) return [];

  const now = Date.now();
  const cached = mediaCache.get(hotelId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (mediaInFlight.has(hotelId)) {
    return mediaInFlight.get(hotelId);
  }

  const promise = (async () => {
    try {
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
        .eq("media_type", "image")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: false });

      if (error) throw error;

      let result = [];
      if (data && data.length > 0) {
        const hotelLevel = data.filter((item) => !item.room_category_id);
        result = hotelLevel.length > 0 ? hotelLevel : data;
      }

      mediaCache.set(hotelId, { data: result, timestamp: Date.now() });
      return result;
    } finally {
      mediaInFlight.delete(hotelId);
    }
  })();

  mediaInFlight.set(hotelId, promise);
  return promise;
}

// ---------------------------------------------------------
// GET ROOM CATEGORY MEDIA
// ---------------------------------------------------------

export async function getRoomCategoryMedia(hotelId) {
  if (!hotelId) return [];

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
    .not("room_category_id", "is", null)
    .eq("media_type", "image")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ---------------------------------------------------------
// OCCUPANCY HELPERS
// ---------------------------------------------------------

export function getCategoryOccupancyLimits(category) {
  const maxGuests = Number(category?.max_occupancy || 2);
  const totalRooms = Number(category?.total_rooms || 1);
  return { minGuests: 1, maxGuests, totalRooms };
}

export function canCategoryAccommodate(category, totalGuests, rooms = 1) {
  const { maxGuests } = getCategoryOccupancyLimits(category);
  const countRooms = Math.max(1, Number(rooms) || 1);
  const countGuests = Math.max(1, Number(totalGuests) || 1);
  return countGuests >= countRooms && countGuests <= maxGuests * countRooms;
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
// CALCULATE COMPLETE BOOKING PRICE
// ---------------------------------------------------------

export async function calculateRoomPrice({
  roomCategoryId,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  roomsRequested,
  defaultPrice = 0,
}) {
  let isOccupancyConfigured = false;
  try {
    const { data: occ } = await supabase
      .from("room_category_occupancy")
      .select("minimum_accommodation, maximum_accommodation")
      .eq("room_category_id", roomCategoryId)
      .maybeSingle();

    if (
      occ &&
      occ.minimum_accommodation !== null &&
      occ.maximum_accommodation !== null
    ) {
      isOccupancyConfigured = true;
    }
  } catch {
    isOccupancyConfigured = false;
  }

  if (isOccupancyConfigured) {
    try {
      const { data, error } = await supabase.rpc(
        "calculate_booking_price",
        {
          p_room_category_id: roomCategoryId,
          p_check_in_date: checkInDate,
          p_check_out_date: checkOutDate,
          p_number_of_guests: numberOfGuests,
          p_rooms_requested: roomsRequested,
        }
      );

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }
  }

  try {
    const { data: pricingRules, error: rulesError } = await supabase.rpc(
      "get_room_pricing",
      {
        p_room_category_id: roomCategoryId,
        p_check_in_date: checkInDate,
        p_check_out_date: checkOutDate,
      }
    );

    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));

    let singleRoomStayTotal = 0;
    if (!rulesError && Array.isArray(pricingRules) && pricingRules.length > 0) {
      singleRoomStayTotal = pricingRules.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
      );
    } else {
      singleRoomStayTotal = Number(defaultPrice || 0) * diffDays;
    }

    const countRooms = Math.max(1, Number(roomsRequested) || 1);
    const countGuests = Math.max(1, Number(numberOfGuests) || 1);

    const baseGuestsPerRoom = Math.floor(countGuests / countRooms);
    const extraGuests = countGuests % countRooms;
    const guest_counts = Array.from(
      { length: countRooms },
      (_, i) => baseGuestsPerRoom + (i < extraGuests ? 1 : 0)
    );

    const room_prices = Array(countRooms).fill(singleRoomStayTotal);
    const subtotal = singleRoomStayTotal * countRooms;
    const gst_amount = Math.round(subtotal * 0.05);

    let sign_in_discount = 0;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        sign_in_discount = Math.round(subtotal * 0.1);
      }
    } catch {
      sign_in_discount = 0;
    }

    const final_total = Math.max(0, subtotal + gst_amount - sign_in_discount);
    const average_nightly_rate = Math.round(
      subtotal / (countRooms * diffDays)
    );

    return {
      subtotal,
      gst_amount,
      final_total,
      room_prices,
      guest_counts,
      sign_in_discount,
      average_nightly_rate,
    };
  } catch (fallbackErr) {
    console.error("Fallback room pricing error:", fallbackErr);
    throw fallbackErr;
  }
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
