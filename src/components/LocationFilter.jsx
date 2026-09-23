const locations = [
  "All",
  "Chennai",
  "Kodaikanal",
  "Pondicherry",
];

function LocationFilter() {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {locations.map((location, index) => (
        <button
          key={location}
          className={`rounded-full px-6 py-3 text-sm font-medium transition ${
            index === 0
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {location}
        </button>
      ))}
    </div>
  );
}

export default LocationFilter;