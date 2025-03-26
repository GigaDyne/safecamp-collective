
import { useState, useEffect, useRef } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

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
  center: [number, number];
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
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem("mapbox_token");
    if (!token) {
      toast({
        title: "Missing Mapbox Token",
        description: "Please set your Mapbox token to use location search",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    const mapboxToken = localStorage.getItem("mapbox_token");
    if (!mapboxToken) {
      setShowTokenDialog(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxToken}&types=place,address,poi&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location suggestions");
      }

      const data = await response.json();
      setSuggestions(data.features);
      setIsOpen(data.features.length > 0);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch location suggestions",
        variant: "destructive",
      });
    } finally {
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
    const coordinates = `${suggestion.center[0]},${suggestion.center[1]}`;
    onChange(suggestion.place_name);
    onLocationSelect({
      placeName: suggestion.place_name,
      coordinates: coordinates
    });
    setIsOpen(false);
  };

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem("mapbox_token", tokenInput.trim());
      setShowTokenDialog(false);
      toast({
        title: "Success",
        description: "Mapbox token saved successfully",
      });
      // Retry the search if there was a value
      if (value && value.length >= 3) {
        fetchSuggestions(value);
      }
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive",
      });
    }
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
    <>
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

      {/* Dialog for entering Mapbox token */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Mapbox Token</DialogTitle>
            <DialogDescription>
              A Mapbox token is required for location search functionality. 
              You can get a free token from <a href="https://mapbox.com/" className="text-primary underline" target="_blank" rel="noopener noreferrer">mapbox.com</a>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter your Mapbox token"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This token will be stored in your browser's local storage.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTokenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveToken}>
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationAutocomplete;
