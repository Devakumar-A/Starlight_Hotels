import { useEffect, useState } from "react";
import { getHotelMedia } from "../services/hotelService";

function HotelCard({ hotel }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const media = await getHotelMedia(hotel.id);

        if (media.length > 0) {
          setImage(media[0].cloudinary_url);
        }
      } catch (error) {
        console.error("HOTEL IMAGE ERROR:", error);
      }
    };

    loadImage();
  }, [hotel.id]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="aspect-[16/10] bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={hotel.hotel_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold">
          {hotel.hotel_name}
        </h3>

        {hotel.city && (
          <p className="mt-1 text-sm text-gray-500">
            {hotel.city}
          </p>
        )}
      </div>
    </div>
  );
}

export default HotelCard;