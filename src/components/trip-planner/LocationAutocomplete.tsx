
import { useState, useEffect, useRef } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: { placeName: string; coordinates: string }) => void;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

interface Suggestion {
  id: string;
  place_name: string;
  lat: number;
  lng: number;
}

const LocationAutocomplete = ({
  placeholder,
  value,
  onChange,
  onLocationSelect,
  icon,
  onIconClick
}: LocationAutocompleteProps) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const dummyElementRef = useRef<HTMLDivElement | null>(null);

  // Initialize Google Maps Places services
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (it requires a DOM element)
      if (!dummyElementRef.current) {
        dummyElementRef.current = document.createElement('div');
        dummyElementRef.current.style.display = 'none';
        document.body.appendChild(dummyElementRef.current);
      }
      
      placesServiceRef.current = new google.maps.places.PlacesService(dummyElementRef.current);
    }
    
    return () => {
      if (dummyElementRef.current) {
        document.body.removeChild(dummyElementRef.current);
      }
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3 || !autocompleteServiceRef.current) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: query },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setSuggestions([]);
            setIsLoading(false);
            return;
          }
          
          // Format predictions into our Suggestion format
          const formattedSuggestions = predictions.map(prediction => ({
            id: prediction.place_id,
            place_name: prediction.description,
            lat: 0, // Will be populated when selected
            lng: 0  // Will be populated when selected
          }));
          
          setSuggestions(formattedSuggestions);
          setIsOpen(formattedSuggestions.length > 0);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch location suggestions",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce API calls
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!placesServiceRef.current) {
      return;
    }
    
    // Get detailed place information
    placesServiceRef.current.getDetails(
      { placeId: suggestion.id, fields: ['geometry'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          onChange(suggestion.place_name);
          onLocationSelect({
            placeName: suggestion.place_name,
            coordinates: `${lng},${lat}`
          });
        } else {
          console.error("Error getting place details");
          onChange(suggestion.place_name);
          onLocationSelect({
            placeName: suggestion.place_name,
            coordinates: '0,0' // Fallback coordinates
          });
        }
      }
    );
    
    setIsOpen(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onClick={() => value && suggestions.length > 0 && setIsOpen(true)}
            className="w-full pr-10"
          />
          {icon && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={onIconClick}
              type="button"
            >
              {icon}
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ul className="max-h-[300px] overflow-auto py-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left px-3 py-2 h-auto"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{suggestion.place_name}</span>
                </Button>
              </li>
            ))}
            {suggestions.length === 0 && value.length >= 3 && (
              <li className="px-3 py-2 text-muted-foreground text-sm">
                No suggestions found
              </li>
            )}
            {value.length < 3 && (
              <li className="px-3 py-2 text-muted-foreground text-sm">
                Type at least 3 characters to search
              </li>
            )}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default LocationAutocomplete;
