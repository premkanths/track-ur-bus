export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

// Convert free-form text to Lat/Lng via OpenStreetMap Nominatim
export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) return [];

  try {
    // Add 'India' and 'Bengaluru' context if you wish to restrict searches slightly, 
    // or rely entirely on free-form search with viewbox.
    // For free OpenStreetMap Nominatim, remember it requires a User-Agent in production,
    // but works fine for simple dev requests in the browser.
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
    );
    
    if (!response.ok) {
      console.error("Geocoding error", response.status);
      return [];
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name
    }));
  } catch (error) {
    console.error("Geocoding exception:", error);
    return [];
  }
}
