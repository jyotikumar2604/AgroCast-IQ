/**
 * WeatherService.js
 * Handles all weather API calls using Open-Meteo (free, no API key required).
 * Docs: https://open-meteo.com/en/docs
 */

const DEFAULT_LAT      = 28.6692;
const DEFAULT_LON      = 77.4538;
const DEFAULT_LOCATION = "Ghaziabad, UP, India";
const BASE_URL         = "https://api.open-meteo.com/v1";

export const WMO_CODES = {
  0:  { label: "Clear Sky",            icon: "☀️"  },
  1:  { label: "Mainly Clear",         icon: "🌤️" },
  2:  { label: "Partly Cloudy",        icon: "⛅"  },
  3:  { label: "Overcast",             icon: "☁️"  },
  45: { label: "Foggy",               icon: "🌫️" },
  48: { label: "Icy Fog",             icon: "🌫️" },
  51: { label: "Light Drizzle",        icon: "🌦️" },
  53: { label: "Moderate Drizzle",     icon: "🌦️" },
  55: { label: "Dense Drizzle",        icon: "🌧️" },
  61: { label: "Slight Rain",          icon: "🌧️" },
  63: { label: "Moderate Rain",        icon: "🌧️" },
  65: { label: "Heavy Rain",           icon: "🌧️" },
  71: { label: "Slight Snow",          icon: "🌨️" },
  73: { label: "Moderate Snow",        icon: "❄️"  },
  75: { label: "Heavy Snow",           icon: "❄️"  },
  80: { label: "Rain Showers",         icon: "🌦️" },
  81: { label: "Moderate Showers",     icon: "🌧️" },
  82: { label: "Violent Showers",      icon: "⛈️" },
  95: { label: "Thunderstorm",         icon: "⛈️" },
  96: { label: "Thunderstorm + Hail",  icon: "⛈️" },
  99: { label: "Severe Thunderstorm",  icon: "⛈️" },
};

/**
 * Fetches weather from Open-Meteo for the given lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @param {string} locationLabel  — human-readable name for display
 */
export async function fetchWeatherData(
  lat           = DEFAULT_LAT,
  lon           = DEFAULT_LON,
  locationLabel = DEFAULT_LOCATION
) {
  const params = new URLSearchParams({
    latitude:     lat,
    longitude:    lon,
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature",
      "weather_code", "wind_speed_10m", "wind_direction_10m",
      "precipitation", "surface_pressure", "uv_index", "cloud_cover",
    ].join(","),
    hourly: [
      "temperature_2m", "precipitation_probability", "precipitation",
      "weather_code", "wind_speed_10m", "uv_index", "relative_humidity_2m",
    ].join(","),
    daily: [
      "weather_code", "temperature_2m_max", "temperature_2m_min",
      "precipitation_sum", "precipitation_probability_max",
      "wind_speed_10m_max", "uv_index_max", "sunrise", "sunset",
    ].join(","),
    timezone:      "auto",   // auto-detects timezone from lat/lon
    forecast_days: 7,
  });

  const response = await fetch(`${BASE_URL}/forecast?${params}`);
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
  const raw = await response.json();
  return parseWeatherResponse(raw, locationLabel);
}

function parseWeatherResponse(raw, locationLabel) {
  const { current, hourly, daily } = raw;

  const currentWeather = {
    temperature:  Math.round(current.temperature_2m),
    feelsLike:    Math.round(current.apparent_temperature),
    humidity:     current.relative_humidity_2m,
    windSpeed:    Math.round(current.wind_speed_10m),
    windDirection:current.wind_direction_10m,
    precipitation:current.precipitation,
    pressure:     Math.round(current.surface_pressure),
    uvIndex:      current.uv_index,
    cloudCover:   current.cloud_cover,
    weatherCode:  current.weather_code,
    condition:    WMO_CODES[current.weather_code] || { label: "Unknown", icon: "🌡️" },
    timestamp:    current.time,
  };

  const dailyForecast = daily.time.map((date, i) => ({
    date,
    day:              new Date(date).toLocaleDateString("en-IN", { weekday: "short" }),
    weatherCode:      daily.weather_code[i],
    condition:        WMO_CODES[daily.weather_code[i]] || { label: "Unknown", icon: "🌡️" },
    tempMax:          Math.round(daily.temperature_2m_max[i]),
    tempMin:          Math.round(daily.temperature_2m_min[i]),
    precipitation:    daily.precipitation_sum[i],
    precipProbability:daily.precipitation_probability_max[i],
    windSpeedMax:     Math.round(daily.wind_speed_10m_max[i]),
    uvIndexMax:       daily.uv_index_max[i],
    sunrise:          daily.sunrise[i],
    sunset:           daily.sunset[i],
  }));

  const nowIndex   = findCurrentHourIndex(hourly.time);
  const next24Hours = hourly.time.slice(nowIndex, nowIndex + 24).map((time, i) => ({
    time:             new Date(time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    rawTime:          time,
    temperature:      Math.round(hourly.temperature_2m[nowIndex + i]),
    precipProbability:hourly.precipitation_probability[nowIndex + i],
    precipitation:    hourly.precipitation[nowIndex + i],
    weatherCode:      hourly.weather_code[nowIndex + i],
    windSpeed:        Math.round(hourly.wind_speed_10m[nowIndex + i]),
    uvIndex:          hourly.uv_index[nowIndex + i],
    humidity:         hourly.relative_humidity_2m[nowIndex + i],
  }));

  return {
    location:    locationLabel,
    coordinates: { lat: raw.latitude, lon: raw.longitude },
    timezone:    raw.timezone,
    current:     currentWeather,
    daily:       dailyForecast,
    hourly:      next24Hours,
    fetchedAt:   new Date().toISOString(),
  };
}

function findCurrentHourIndex(times) {
  const now = new Date().toISOString().substring(0, 13);
  const idx = times.findIndex(t => t.startsWith(now));
  return idx >= 0 ? idx : 0;
}

export function generateAgriAlerts(weatherData) {
  if (!weatherData) return [];
  const alerts = [];
  const { current, daily } = weatherData;

  if (current.temperature > 38) {
    alerts.push({
      id: "temp-high", type: "danger", title: "Extreme Heat Warning",
      message: `Temperature at ${current.temperature}°C. Risk of heat stress for wheat & paddy. Irrigate during early morning.`,
    });
  }
  if (current.uvIndex >= 8) {
    alerts.push({
      id: "uv-high", type: "warning", title: "High UV Index",
      message: `UV Index at ${current.uvIndex}. Avoid fieldwork between 11 AM – 3 PM.`,
    });
  }
  const rainDay = daily?.find(d => d.precipProbability >= 60);
  if (rainDay) {
    alerts.push({
      id: "rain-forecast", type: "info", title: "Rain Expected",
      message: `${rainDay.precipProbability}% chance of rain on ${rainDay.day}. Hold irrigation 48 hours.`,
    });
  }
  if (current.windSpeed > 30) {
    alerts.push({
      id: "wind-high", type: "warning", title: "High Wind Alert",
      message: `Wind at ${current.windSpeed} km/h. Avoid pesticide spraying.`,
    });
  }
  if (current.humidity < 30) {
    alerts.push({
      id: "humidity-low", type: "warning", title: "Low Humidity",
      message: `Humidity at ${current.humidity}%. Increase irrigation frequency.`,
    });
  }
  return alerts;
}

export function getIrrigationScore(weatherData) {
  if (!weatherData) return 50;
  const { current, daily } = weatherData;
  let score = 50;
  score += (current.temperature - 25) * 1.2;
  score -= current.humidity * 0.3;
  score -= current.precipitation * 10;
  if (daily?.[0]?.precipProbability > 50) score -= 15;
  return Math.min(100, Math.max(0, Math.round(score)));
}