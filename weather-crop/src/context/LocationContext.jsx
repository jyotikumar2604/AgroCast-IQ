import { createContext, useContext, useState, useCallback } from "react";

// ─── Geocoding via Open-Meteo (free, no API key) ─────────────────────────────
export async function geocodeCity(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();
  if (!data.results?.length) throw new Error(`No results found for "${query}"`);
  return data.results.map(r => ({
    name:      r.name,
    country:   r.country,
    admin1:    r.admin1 || "",          // state / province
    lat:       r.latitude,
    lon:       r.longitude,
    label:     `${r.name}${r.admin1 ? ", " + r.admin1 : ""}, ${r.country}`,
  }));
}

// ─── Context ──────────────────────────────────────────────────────────────────
const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState({
    label: "Ghaziabad, UP, India",
    lat:   28.6692,
    lon:   77.4538,
  });

  const updateLocation = useCallback((newLoc) => {
    setLocation(newLoc);
  }, []);

  return (
    <LocationContext.Provider value={{ location, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside <LocationProvider>");
  return ctx;
}