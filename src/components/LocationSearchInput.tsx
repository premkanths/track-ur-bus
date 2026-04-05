import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2 } from "lucide-react";
import { geocodeSearch, GeocodingResult } from "@/lib/geocoding";
import { Card } from "@/components/ui/card";

interface LocationSearchInputProps {
  placeholder: string;
  onLocationSelect: (location: GeocodingResult | null) => void;
  icon?: React.ReactNode;
}

export function LocationSearchInput({ placeholder, onLocationSelect, icon }: LocationSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<GeocodingResult | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search
  useEffect(() => {
    if (!query || query.length < 3 || selectedValue?.displayName === query) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await geocodeSearch(query);
      setResults(data);
      setIsDropdownOpen(true);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [query, selectedValue]);

  const handleSelect = (r: GeocodingResult) => {
    setQuery(r.displayName.split(",")[0]); // Just show the short name in input
    setSelectedValue(r);
    setResults([]);
    setIsDropdownOpen(false);
    onLocationSelect(r);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedValue(null);
    setResults([]);
    onLocationSelect(null);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-zinc-500 flex items-center justify-center pointer-events-none">
          {icon || <MapPin className="w-4 h-4" />}
        </div>
        <Input 
          className="pl-10 pr-10 focus-visible:ring-1 bg-white text-black font-medium border-zinc-200" 
          placeholder={placeholder} 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedValue) {
              setSelectedValue(null);
              onLocationSelect(null);
            }
          }}
          onFocus={() => {
            if (results.length > 0) setIsDropdownOpen(true);
          }}
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 absolute right-3 animate-spin text-zinc-500 pointer-events-none" />
        )}
        {!isLoading && query.length > 0 && (
          <button 
            type="button" 
            onClick={handleClear}
            className="absolute right-3 text-zinc-400 hover:text-black text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {isDropdownOpen && results.length > 0 && (
        <Card className="absolute top-12 left-0 right-0 z-[100] max-h-60 overflow-y-auto shadow-xl flex flex-col p-1 bg-white text-black border-zinc-200">
          {results.map((r, idx) => (
            <button
              key={idx}
              className="text-left px-3 py-2 text-sm hover:bg-zinc-100 rounded-sm transition-colors"
              onClick={() => handleSelect(r)}
            >
              <div className="font-bold text-zinc-900">{r.displayName.split(",")[0]}</div>
              <div className="text-xs text-zinc-500 truncate">{r.displayName}</div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
