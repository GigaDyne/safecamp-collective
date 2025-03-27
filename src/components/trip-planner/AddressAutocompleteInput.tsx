
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

interface AddressAutocompleteInputProps {
  placeholder: string;
  mapboxToken: string;
  onSelect: (location: { name: string; lat: number; lng: number }) => void;
  className?: string;
  initialValue?: string;
}

const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  placeholder,
  mapboxToken,
  onSelect,
  className,
  initialValue = ""
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [features, setFeatures] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial value effect
  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  const fetchResults = useRef(
    debounce(async (value: string) => {
      if (!value || value.length < 3 || !mapboxToken) {
        setFeatures([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value.trim()
          )}.json?access_token=${mapboxToken}&limit=5&country=us,ca,mx`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Mapbox autocomplete results:", data);
        setFeatures(data.features || []);
        setSearchPerformed(true);
        
        // Show the dropdown if we have results
        if (data.features && data.features.length > 0) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch geocoding results:", error);
        setFeatures([]);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (inputValue.length >= 3) {
      setIsLoading(true);
      fetchResults(inputValue);
    } else {
      setFeatures([]);
    }

    return () => {
      fetchResults.cancel();
    };
  }, [inputValue, fetchResults]);

  const handleSelect = (feature: MapboxFeature) => {
    setInputValue(feature.place_name);
    setIsOpen(false);
    const [lng, lat] = feature.center;
    onSelect({ name: feature.place_name, lat, lng });
  };

  return (
    <Popover open={isOpen && features.length > 0} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setInputValue(newValue);
              if (newValue.length >= 3) {
                setIsLoading(true);
                // Let fetchResults handle opening the popover
              } else {
                setIsOpen(false);
              }
            }}
            className={cn("w-full", className)}
            disabled={!mapboxToken}
            onFocus={() => {
              // Re-open dropdown when focusing if we have results and sufficient input length
              if (features.length > 0 && inputValue.length >= 3) {
                setIsOpen(true);
              }
            }}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && inputValue && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-border shadow-lg z-50"
        align="start"
        sideOffset={5}
      >
        <div className="rounded-md overflow-hidden">
          {features.map((feature) => (
            <Button
              key={feature.id}
              variant="ghost"
              className="w-full justify-start font-normal px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(feature)}
            >
              {feature.place_name}
            </Button>
          ))}
          {searchPerformed && features.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              No locations found. Try a different search term.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddressAutocompleteInput;
