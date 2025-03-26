
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SearchBarProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

const SearchBar = ({ visible, setVisible }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);
  
  const handleClear = () => {
    setSearchTerm("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className={cn(
      "flex items-center gap-2 transition-all duration-300",
      !visible && "opacity-90 scale-[0.97]"
    )}>
      <div className={cn(
        "relative flex-1 flex items-center transition-all duration-300 ease-in-out",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for campsite or location"
          className="glass-card w-full pl-10 pr-10 py-2.5 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 shrink-0 rounded-full glass-card",
          visible ? "bg-secondary" : "bg-background/80"
        )}
        onClick={() => setVisible(!visible)}
      >
        {visible ? (
          <X className="h-4 w-4" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default SearchBar;
