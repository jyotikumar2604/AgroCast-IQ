import { useState, useEffect, useCallback } from "react";
import { fetchWeatherData, generateAgriAlerts, getIrrigationScore } from "../services/WeatherService";
import { useLocation } from "../context/LocationContext";

export function useWeather() {
  const { location } = useLocation();

  const [weatherData,     setWeatherData]     = useState(null);
  const [alerts,          setAlerts]           = useState([]);
  const [irrigationScore, setIrrigationScore]  = useState(null);
  const [loading,         setLoading]          = useState(true);
  const [error,           setError]            = useState(null);
  const [lastUpdated,     setLastUpdated]      = useState(null);

  const loadWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherData(location.lat, location.lon, location.label);
      setWeatherData(data);
      setAlerts(generateAgriAlerts(data));
      setIrrigationScore(getIrrigationScore(data));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon, location.label]);

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  return { weatherData, alerts, irrigationScore, loading, error, lastUpdated, refresh: loadWeather };
}