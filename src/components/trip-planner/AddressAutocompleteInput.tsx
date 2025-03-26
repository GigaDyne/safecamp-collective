
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
            value
          )}.json?access_token=${mapboxToken}&limit=5&country=us,ca,mx`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setFeatures(data.features || []);
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
              setInputValue(e.target.value);
              if (e.target.value.length >= 3) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
            }}
            className={cn("w-full", className)}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto"
        align="start"
      >
        <div className="rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddressAutocompleteInput;
