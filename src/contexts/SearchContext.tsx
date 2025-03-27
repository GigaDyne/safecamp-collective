
import { createContext, useContext, useState, ReactNode } from "react";
import { CampSite } from "@/lib/supabase";

interface SearchContextType {
  searchResults: CampSite[];
  setSearchResults: (results: CampSite[]) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchResults, setSearchResults] = useState<CampSite[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const clearSearch = () => {
    setSearchResults([]);
    setIsSearchActive(false);
  };

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        setSearchResults,
        isSearchActive,
        setIsSearchActive,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
