
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Initial value effect
  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  const clearInput = () => {
    setInputValue("");
    setFeatures([]);
    setIsOpen(false);
    setError(null);
    setSearchPerformed(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const fetchResults = useCallback(
    debounce(async (value: string) => {
      if (!value || value.length < 3 || !mapboxToken) {
        setFeatures([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setError(null);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value.trim()
          )}.json?access_token=${mapboxToken}&limit=5&country=us,ca,mx`
        );

        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Mapbox autocomplete results:", data);
        
        if (data.features && data.features.length > 0) {
          setFeatures(data.features);
          setIsOpen(true);
        } else {
          setFeatures([]);
          setError("No locations found. Try a different search term.");
        }
        
        setSearchPerformed(true);
      } catch (error) {
        console.error("Failed to fetch geocoding results:", error);
        setFeatures([]);
        setError("Unable to fetch results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [mapboxToken]
  );

  useEffect(() => {
    if (inputValue.length >= 3) {
      setIsLoading(true);
      fetchResults(inputValue);
    } else {
      setFeatures([]);
      setError(null);
      setIsOpen(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              } else {
                setIsOpen(false);
                setError(null);
              }
            }}
            className={cn("w-full pr-8", className)}
            disabled={!mapboxToken}
            onFocus={() => {
              // Re-open dropdown when focusing if we have results and sufficient input length
              if (features.length > 0 && inputValue.length >= 3) {
                setIsOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
          />
          
          {/* Loading spinner or clear/search icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : inputValue ? (
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearInput();
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Clear input</span>
                </Button>
              </div>
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-border shadow-lg z-50"
        align="start"
        sideOffset={5}
      >
        <div className="rounded-md overflow-hidden">
          {features.length > 0 ? (
            features.map((feature) => (
              <Button
                key={feature.id}
                variant="ghost"
                className="w-full justify-start font-normal px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(feature)}
              >
                {feature.place_name}
              </Button>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">
              {error || (searchPerformed ? "No locations found. Try a different search term." : "Type at least 3 characters to search...")}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddressAutocompleteInput;
