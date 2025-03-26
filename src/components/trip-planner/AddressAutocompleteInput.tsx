
import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";

interface AddressAutocompleteInputProps {
  placeholder?: string;
  onSelect: (place: {
    name: string;
    lat: number;
    lng: number;
  }) => void;
  mapboxToken: string;
  className?: string; // Added className prop
}

const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  placeholder = "Enter a location",
  onSelect,
  mapboxToken,
  className = "", // Default to empty string
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);

  const fetchSuggestions = debounce(async (search: string) => {
    if (!search || !mapboxToken) return;

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        search
      )}.json?access_token=${mapboxToken}&autocomplete=true&limit=5`
    );
    const data = await res.json();
    setSuggestions(data.features || []);
  }, 300);

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  const handleSelect = (feature: any) => {
    setQuery(feature.place_name);
    setSuggestions([]);
    onSelect({
      name: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
    });
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)} // delay blur to allow click
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded shadow-sm text-sm"
      />
      {focused && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
          {suggestions.map((feature) => (
            <li
              key={feature.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(feature)}
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocompleteInput;
