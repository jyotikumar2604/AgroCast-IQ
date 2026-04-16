import { useState } from "react";
import {
  CloudRain, Wind, Droplets, Thermometer, Sun, Eye,
  RefreshCw, MapPin, Sunrise, Sunset, Gauge, Umbrella,
  CheckCircle2, AlertTriangle, XCircle, Clock, Zap,
  ChevronDown, ChevronUp, Waves
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine
} from "recharts";
import { useWeather } from "../hooks/useWeather";

// ─── SVG Gauge Arc ────────────────────────────────────────────────────────────
function GaugeArc({ value, max = 100, color, label, unit }) {
  const pct   = Math.min(value / max, 1);
  const angle = pct * 180 - 90;
  const r = 36, cx = 50, cy = 54;
  const startX = cx - r;
  const endX   = cx + r;
  const arcX   = cx + r * Math.cos(((angle - 90) * Math.PI) / 180);
  const arcY   = cy + r * Math.sin(((angle - 90) * Math.PI) / 180);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 60" className="w-20 h-12">
        <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
          fill="none" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
        <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${arcX} ${arcY}`}
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
          {value}{unit}
        </text>
      </svg>
      <span className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">{p.value}{p.unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({ alerts }) {
  const [expanded, setExpanded] = useState(false);
  if (!alerts.length) return null;
  const typeStyle = {
    danger:  { bg: "bg-rose-500/10 border-rose-500/30",  icon: XCircle,       iconColor: "text-rose-400",  badge: "bg-rose-500/20 text-rose-300"  },
    warning: { bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, iconColor: "text-amber-400", badge: "bg-amber-500/20 text-amber-300" },
    info:    { bg: "bg-sky-500/10 border-sky-500/30",     icon: CheckCircle2,  iconColor: "text-sky-400",   badge: "bg-sky-500/20 text-sky-300"    },
  };
  const shown = expanded ? alerts : alerts.slice(0, 2);
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Active Alerts
          <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alerts.length}</span>
        </h3>
        {alerts.length > 2 && (
          <button onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
            {expanded
              ? <><ChevronUp className="w-3 h-3" />Show less</>
              : <><ChevronDown className="w-3 h-3" />+{alerts.length - 2} more</>}
          </button>
        )}
      </div>
      {shown.map((alert) => {
        const s    = typeStyle[alert.type] || typeStyle.info;
        const Icon = s.icon;
        return (
          <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg}`}>
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.iconColor}`} />
            <div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mr-2 ${s.badge}`}>{alert.title}</span>
              <span className="text-xs text-slate-300 leading-relaxed">{alert.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 7-Day Forecast Card ──────────────────────────────────────────────────────
function ForecastCard({ day, isToday }) {
  const precipRisk  = day.precipProbability >= 60 ? "high" : day.precipProbability >= 30 ? "medium" : "low";
  const riskColor   = { high: "text-rose-400", medium: "text-amber-400", low: "text-emerald-400" };

  // Safe precipitation display — guard against null/undefined from API
  const precipMm    = typeof day.precipitation === "number" ? day.precipitation : 0;
  const precipProb  = typeof day.precipProbability === "number" ? day.precipProbability : 0;
  const windMax     = typeof day.windSpeedMax === "number" ? day.windSpeedMax : 0;
  const tempHigh    = typeof day.tempMax === "number" ? day.tempMax : "--";
  const tempLow     = typeof day.tempMin === "number" ? day.tempMin : "--";
  const dayLabel    = day.day ? day.day.toUpperCase() : "---";
  const condIcon    = day.condition?.icon ?? "🌡️";

  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer hover:scale-[1.03] min-w-0
      ${isToday
        ? "bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border-emerald-500/40 shadow-lg shadow-emerald-900/20"
        : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"}`}>

      {/* Day label */}
      <span className={`text-[10px] font-bold tracking-wide truncate w-full text-center ${isToday ? "text-emerald-400" : "text-slate-400"}`}>
        {isToday ? "TODAY" : dayLabel}
      </span>

      {/* Weather icon */}
      <span className="text-xl leading-none">{condIcon}</span>

      {/* Temp */}
      <div className="text-center">
        <p className="text-sm font-bold text-white leading-none">{tempHigh}°</p>
        <p className="text-xs text-slate-500 mt-0.5">{tempLow}°</p>
      </div>

      {/* Rain probability */}
      <div className={`flex items-center gap-0.5 text-[10px] ${riskColor[precipRisk]}`}>
        <Umbrella className="w-2.5 h-2.5" />
        <span>{precipProb}%</span>
      </div>

      {/* Wind */}
      <div className="flex items-center gap-0.5 text-[10px] text-slate-500">
        <Wind className="w-2.5 h-2.5" />
        <span>{windMax}</span>
      </div>

      {/* Rain amount badge — only show if > 0 */}
      {precipMm > 0 && (
        <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full border border-sky-500/20 leading-none">
          {precipMm.toFixed(1)}mm
        </span>
      )}
    </div>
  );
}

// ─── Smart Irrigation Planner ─────────────────────────────────────────────────
function IrrigationPlanner({ weatherData, irrigationScore }) {
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const crops = {
    wheat:  { label: "Wheat",  emoji: "🌾", waterNeed: 6, stage: "Tillering",  interval: 10 },
    rice:   { label: "Paddy",  emoji: "🌿", waterNeed: 9, stage: "Vegetative", interval: 5  },
    maize:  { label: "Maize",  emoji: "🌽", waterNeed: 7, stage: "Tasseling",  interval: 7  },
    cotton: { label: "Cotton", emoji: "🌱", waterNeed: 5, stage: "Flowering",  interval: 12 },
    tomato: { label: "Tomato", emoji: "🍅", waterNeed: 8, stage: "Fruiting",   interval: 4  },
  };
  const crop = crops[selectedCrop];

  const rainComing = weatherData?.daily?.slice(0, 3).some(d => d.precipProbability >= 55);
  const score      = irrigationScore ?? 50;

  let rec, recColor, recIcon;
  if (rainComing) {
    rec = "Hold irrigation — rain forecast within 72 hours. Estimated 8–12mm expected. Conserve water.";
    recColor = "text-sky-400"; recIcon = "🌧️";
  } else if (score >= 70) {
    rec = "Irrigate today — high demand due to heat and low humidity. Morning window (05:00–07:00) preferred.";
    recColor = "text-rose-400"; recIcon = "🔴";
  } else if (score >= 45) {
    rec = "Irrigate in next 24–36 hours. Soil moisture borderline. Evening slot recommended.";
    recColor = "text-amber-400"; recIcon = "🟡";
  } else {
    rec = "No irrigation needed — conditions are optimal. Monitor soil moisture in 48 hours.";
    recColor = "text-emerald-400"; recIcon = "✅";
  }

  const today    = new Date();
  const schedule = Array.from({ length: 5 }, (_, i) => {
    const date    = new Date(today);
    date.setDate(today.getDate() + i * crop.interval);
    const rainDay = weatherData?.daily?.[Math.min(i * crop.interval, 6)];
    const blocked = rainDay?.precipProbability >= 55;
    return {
      date:    date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      day:     date.toLocaleDateString("en-IN", { weekday: "short" }),
      blocked,
      note: blocked ? "Rain expected — skip" : `${crop.waterNeed * 10}L/m² · ${crop.interval}-day cycle`,
    };
  });

  return (
    <div className="bento-card p-5 h-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Waves className="w-4 h-4 text-sky-400" /> Smart Irrigation Planner
        </h2>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(crops).map(([key, c]) => (
            <button key={key} onClick={() => setSelectedCrop(key)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all border ${
                selectedCrop === key
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "text-slate-500 hover:text-slate-300 border-slate-700/60 hover:border-slate-600"}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crop info */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Growth Stage", value: crop.stage,             icon: "🌱" },
          { label: "Water Need",   value: `${crop.waterNeed * 10}L/m²`, icon: "💧" },
          { label: "Interval",     value: `${crop.interval} days`, icon: "📅" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/40 text-center">
            <span className="text-lg">{icon}</span>
            <p className="text-xs font-bold text-white mt-1">{value}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 mb-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">AI Recommendation</p>
        <p className="text-sm text-slate-200 leading-relaxed">
          <span className="mr-1.5">{recIcon}</span>
          <span className={`font-semibold ${recColor}`}>{rec.split("—")[0]}—</span>
          <span className="text-slate-300">{rec.split("—").slice(1).join("—")}</span>
        </p>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Irrigation Demand Score</span>
            <span className={`font-bold ${score >= 70 ? "text-rose-400" : score >= 45 ? "text-amber-400" : "text-emerald-400"}`}>
              {score}/100
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              score >= 70 ? "bg-gradient-to-r from-amber-500 to-rose-500"
              : score >= 45 ? "bg-gradient-to-r from-yellow-500 to-amber-400"
              : "bg-gradient-to-r from-emerald-500 to-teal-400"
            }`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
        <Clock className="w-3 h-3" /> Upcoming Schedule
      </p>
      <div className="space-y-2">
        {schedule.map((s, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all
            ${s.blocked ? "bg-rose-500/5 border-rose-500/20 opacity-60"
              : i === 0  ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-slate-800/30 border-slate-700/30"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold
                ${s.blocked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {s.blocked ? "✕" : i === 0 ? "→" : i + 1}
              </div>
              <div>
                <span className="font-semibold text-slate-200">{s.day}, {s.date}</span>
                {i === 0 && !s.blocked && (
                  <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Next</span>
                )}
              </div>
            </div>
            <span className={`text-[10px] ${s.blocked ? "text-rose-400" : "text-slate-400"}`}>{s.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WeatherPlanner() {
  // No arguments — reads location from LocationContext automatically
  const { weatherData, alerts, irrigationScore, loading, error, lastUpdated, refresh } = useWeather();

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-t-2 border-emerald-400 animate-spin" />
        </div>
        <p className="text-sm text-slate-400">Fetching live weather data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="text-center space-y-3">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-300">{error}</p>
        <button onClick={refresh} className="text-xs text-emerald-400 hover:underline">Retry</button>
      </div>
    </div>
  );

  const { current, daily, hourly } = weatherData;

  // Chart data
  const tempChartData  = hourly.slice(0, 24).map(h => ({ time: h.time, temp: h.temperature, humidity: h.humidity }));
  const precipChartData = daily.map(d => ({ day: d.day, rain: parseFloat((d.precipitation ?? 0).toFixed(1)), prob: d.precipProbability }));
  const windChartData  = hourly.slice(0, 24).map(h => ({ time: h.time, wind: h.windSpeed }));

  const uvLevel =
    current.uvIndex >= 8 ? { label: "Very High", color: "text-rose-400" }
    : current.uvIndex >= 6 ? { label: "High",    color: "text-amber-400" }
    : current.uvIndex >= 3 ? { label: "Moderate",color: "text-yellow-400" }
    : { label: "Low", color: "text-emerald-400" };

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Weather Planner</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm text-slate-400">{weatherData.location}</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600 font-mono">
              Updated {lastUpdated?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
            </span>
          </div>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 bg-slate-800/60 border border-slate-700/60 px-3 py-2 rounded-xl transition-all hover:border-emerald-500/40">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Alerts */}
      <AlertBanner alerts={alerts} />

      {/* Current Conditions */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 bento-card p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-end gap-1 leading-none">
                  <span className="text-7xl font-bold text-white tracking-tighter">{current.temperature}</span>
                  <span className="text-2xl text-slate-400 mb-2">°C</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Feels like <span className="text-slate-200 font-semibold">{current.feelsLike}°C</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-5xl">{current.condition.icon}</span>
                <p className="text-xs text-slate-400 mt-2 text-right leading-snug max-w-[110px]">{current.condition.label}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Droplets, label: "Humidity",    value: `${current.humidity}%`,      color: "text-sky-400"    },
                { icon: Wind,     label: "Wind",         value: `${current.windSpeed} km/h`, color: "text-slate-300"  },
                { icon: Gauge,    label: "Pressure",     value: `${current.pressure} hPa`,   color: "text-violet-400" },
                { icon: Eye,      label: "Cloud Cover",  value: `${current.cloudCover}%`,    color: "text-slate-400"  },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-2.5 bg-slate-900/50 rounded-xl px-3 py-2.5 border border-slate-700/40">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{value}</p>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sun Schedule */}
        <div className="col-span-6 lg:col-span-3 bento-card p-5 flex flex-col gap-4 justify-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sun Schedule</p>
          {[
            { icon: Sunrise, label: "Sunrise",  time: daily[0]?.sunrise, color: "text-amber-300",  bg: "bg-amber-500/15",  iconColor: "text-amber-400"  },
            { icon: Sunset,  label: "Sunset",   time: daily[0]?.sunset,  color: "text-orange-300", bg: "bg-orange-500/15", iconColor: "text-orange-400" },
            { icon: Sun,     label: "UV Index", time: null,               color: uvLevel.color,     bg: "bg-violet-500/15", iconColor: "text-violet-300",
              custom: `${current.uvIndex} — ${uvLevel.label}` },
          ].map(({ icon: Icon, label, time, color, bg, iconColor, custom }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-sm font-bold ${color}`}>
                  {custom ?? (time ? new Date(time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--:--")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Live gauges */}
        <div className="col-span-6 lg:col-span-4 bento-card p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Live Metrics</p>
          <div className="grid grid-cols-2 gap-4 place-items-center">
            <GaugeArc value={current.humidity}   max={100} color="#38bdf8" label="Humidity"  unit="%" />
            <GaugeArc value={current.windSpeed}  max={60}  color="#a78bfa" label="Wind"      unit=""  />
            <GaugeArc value={current.uvIndex}    max={11}  color="#fb923c" label="UV Index"  unit=""  />
            <GaugeArc value={current.cloudCover} max={100} color="#94a3b8" label="Clouds"    unit="%" />
          </div>
        </div>
      </div>

      {/* ── 7-Day Forecast ───────────────────────────────────────────────────── */}
      <div className="bento-card p-5">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-sky-400" /> 7-Day Forecast
        </h2>

        {/* Responsive grid:
            • Mobile  (< md): 2 cols  — cards are large enough to read
            • Tablet  (md):   4 cols
            • Desktop (lg+):  7 cols  — full row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daily.map((day, i) => (
            <ForecastCard key={day.date ?? i} day={day} isToday={i === 0} />
          ))}
        </div>

        {/* Summary bar below cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Avg High",   value: `${Math.round(daily.reduce((s,d)=>s+(d.tempMax??0),0)/daily.length)}°C`, icon: "🌡️" },
            { label: "Avg Low",    value: `${Math.round(daily.reduce((s,d)=>s+(d.tempMin??0),0)/daily.length)}°C`, icon: "❄️"  },
            { label: "Total Rain", value: `${daily.reduce((s,d)=>s+(d.precipitation??0),0).toFixed(1)} mm`,        icon: "🌧️" },
            { label: "Max Wind",   value: `${Math.max(...daily.map(d=>d.windSpeedMax??0))} km/h`,                  icon: "💨" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-xs font-bold text-white">{value}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 bento-card p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-400" /> 24-Hour Temperature &amp; Humidity
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={tempChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temp"     name="Temp"     unit="°C" stroke="#f87171" strokeWidth={2} fill="url(#tempGrad)" />
              <Area type="monotone" dataKey="humidity" name="Humidity" unit="%"  stroke="#38bdf8" strokeWidth={2} fill="url(#humGrad)"  />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-4 bento-card p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-400" /> 7-Day Rainfall (mm)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={precipChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rain" name="Rain" unit="mm" fill="url(#rainGrad)" radius={[4, 4, 0, 0]} />
              <ReferenceLine y={5} stroke="#f87171" strokeDasharray="4 2"
                label={{ value: "Flood risk", fill: "#f87171", fontSize: 9 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wind Chart + Irrigation Planner */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 bento-card p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Wind className="w-4 h-4 text-violet-400" /> Wind Speed — 24h (km/h)
          </h2>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={windChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={25} stroke="#fbbf24" strokeDasharray="4 2"
                label={{ value: "No-spray limit", fill: "#fbbf24", fontSize: 9 }} />
              <Line type="monotone" dataKey="wind" name="Wind" unit=" km/h"
                stroke="#a78bfa" strokeWidth={2.5} dot={false}
                activeDot={{ r: 4, fill: "#a78bfa", stroke: "#1e293b", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <IrrigationPlanner weatherData={weatherData} irrigationScore={irrigationScore} />
        </div>
      </div>

      {/* Outdoor Activity Windows */}
      <div className="bento-card p-5">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smart Outdoor Activity Windows (Today)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { activity: "Field Spraying", icon: "🌿", windows: hourly.filter(h => h.windSpeed < 20 && h.humidity < 80),              rule: "Wind < 20 km/h & Humidity < 80%",    barColor: "bg-emerald-500" },
            { activity: "Harvesting",     icon: "🌾", windows: hourly.filter(h => h.precipProbability < 30 && h.windSpeed < 25),      rule: "Rain prob < 30% & Wind < 25 km/h",   barColor: "bg-amber-500"  },
            { activity: "Transplanting",  icon: "🌱", windows: hourly.filter(h => h.temperature < 32 && h.humidity > 50),             rule: "Temp < 32°C & Humidity > 50%",       barColor: "bg-teal-500"   },
            { activity: "Irrigation",     icon: "💧", windows: hourly.filter(h => { const hr = parseInt(h.time.split(":")[0], 10); return (hr >= 5 && hr <= 8) || (hr >= 18 && hr <= 20); }), rule: "Early morning or evening only", barColor: "bg-sky-500" },
          ].map(({ activity, icon, windows, rule, barColor }) => {
            const pct         = Math.round((windows.length / 24) * 100);
            const status      = pct >= 60 ? "Excellent" : pct >= 35 ? "Moderate" : "Poor";
            const statusColor = pct >= 60 ? "text-emerald-400" : pct >= 35 ? "text-amber-400" : "text-rose-400";
            return (
              <div key={activity} className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-4 space-y-3 hover:border-slate-600/60 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-semibold text-slate-200">{activity}</span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-slate-500">{windows.length}h suitable</span>
                    <span className={`font-bold ${statusColor}`}>{status}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">{rule}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}