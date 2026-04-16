import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Thermometer, Droplets, Wind, CloudRain, Sun, Activity,
  Sprout, AlertTriangle, CheckCircle2, XCircle, Info,
  TrendingUp, TrendingDown, ArrowRight, Zap, Leaf,
  BarChart3, Waves, RefreshCw, MapPin, ShieldAlert,
  CalendarDays, Eye
} from "lucide-react";
import {
  AreaChart, Area, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { useWeather } from "../hooks/useWeather";
import { CROPS, WEEKLY_HEALTH_TREND } from "../data/cropData";
import { ALERT_RULES, SEASONAL_SUMMARY } from "../data/alertRules";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 shadow-2xl text-xs">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white ml-auto pl-3">{p.value}{p.unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

function AnimatedValue({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value);
    if (isNaN(target)) { setDisplay(value); return; }
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.round(start * 10) / 10);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

function StatCard({ icon: Icon, label, value, suffix, subLabel, subValue, subPositive, accentColor, delay = 0 }) {
  const colors = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "#10b981" },
    sky:     { bg: "bg-sky-500/10",     border: "border-sky-500/20",     icon: "text-sky-400",     glow: "#0ea5e9" },
    amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: "text-amber-400",   glow: "#f59e0b" },
    violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  icon: "text-violet-400",  glow: "#8b5cf6" },
    rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    icon: "text-rose-400",    glow: "#f43f5e" },
    teal:    { bg: "bg-teal-500/10",    border: "border-teal-500/20",    icon: "text-teal-400",    glow: "#14b8a6" },
  };
  const c = colors[accentColor] || colors.emerald;
  return (
    <div
      className={`bento-card p-5 relative overflow-hidden hover:scale-105 transition-all duration-300 cursor-default border ${c.border}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
        style={{ background: c.glow }} />
      <div className="relative">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-none">
          <AnimatedValue value={value} suffix={suffix} />
        </p>
        {subLabel && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${subPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {subPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{subValue}</span>
            <span className="text-slate-600">{subLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherHero({ current, location }) {
  if (!current) return null;
  const uvLabel = current.uvIndex >= 8 ? "Very High" : current.uvIndex >= 6 ? "High" : current.uvIndex >= 3 ? "Moderate" : "Low";
  return (
    <div className="bento-card p-6 relative overflow-hidden h-full">
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-slate-400">{location}</span>
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ml-1" />
          <span className="text-xs text-emerald-400 font-semibold">Live</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-end gap-1 leading-none">
              <span className="text-6xl font-bold text-white tracking-tighter">{current.temperature}</span>
              <span className="text-xl text-slate-400 mb-1">°C</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Feels like <span className="text-slate-200 font-semibold">{current.feelsLike}°C</span>
            </p>
            <p className="text-sm font-semibold text-slate-300 mt-1">{current.condition.label}</p>
          </div>
          <span className="text-5xl">{current.condition.icon}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { icon: Droplets, label: "Humidity",    value: `${current.humidity}%`,      color: "text-sky-400"    },
            { icon: Wind,     label: "Wind",         value: `${current.windSpeed} km/h`, color: "text-violet-400" },
            { icon: Sun,      label: `UV ${uvLabel}`,value: `Index ${current.uvIndex}`,  color: "text-amber-400"  },
            { icon: Eye,      label: "Cloud Cover",  value: `${current.cloudCover}%`,    color: "text-slate-300"  },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2 bg-slate-900/50 rounded-xl px-3 py-2.5 border border-slate-700/40">
              <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
              <div>
                <p className="text-xs font-semibold text-slate-200">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniForecast({ daily }) {
  if (!daily) return null;
  return (
    <div className="bento-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-sky-400" /> 5-Day Outlook
        </h3>
        <Link to="/weather-planner" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
          Full Forecast <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {daily.slice(0, 5).map((d, i) => (
          <div key={d.date} className="flex items-center gap-3 py-1.5 border-b border-slate-800/60 last:border-0">
            <span className="text-xs text-slate-500 w-10 shrink-0 font-medium">{i === 0 ? "Today" : d.day}</span>
            <span className="text-base">{d.condition.icon}</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                style={{ width: `${Math.min(100, Math.max(5, ((d.tempMax - 15) / 30) * 100))}%` }}
              />
            </div>
            <div className="flex gap-2 text-xs shrink-0">
              <span className="text-white font-semibold">{d.tempMax}°</span>
              <span className="text-slate-500">{d.tempMin}°</span>
            </div>
            <span className={`text-xs w-8 text-right font-medium ${
              d.precipProbability >= 60 ? "text-sky-400" :
              d.precipProbability >= 30 ? "text-amber-400" : "text-slate-600"
            }`}>{d.precipProbability}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertFeed({ weatherAlerts }) {
  const [showAll, setShowAll] = useState(false);
  const allAlerts = [
    ...weatherAlerts.map(a => ({ ...a, source: "weather" })),
    ...ALERT_RULES.map(a => ({ ...a, source: "rule" })),
  ];
  const shown = showAll ? allAlerts : allAlerts.slice(0, 4);
  const severityStyle = {
    danger:  { icon: XCircle,       iconClass: "text-rose-400",  bg: "bg-rose-500/10 border-rose-500/25",  badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30"   },
    warning: { icon: AlertTriangle, iconClass: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25",badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
    info:    { icon: Info,          iconClass: "text-sky-400",   bg: "bg-sky-500/10 border-sky-500/25",    badge: "bg-sky-500/20 text-sky-300 border border-sky-500/30"      },
  };
  return (
    <div className="bento-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Alert Feed
          <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
            {allAlerts.filter(a => a.severity === "danger").length} Critical
          </span>
        </h3>
        {allAlerts.length > 4 && (
          <button onClick={() => setShowAll(v => !v)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            {showAll ? "Show less" : `+${allAlerts.length - 4} more`}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {shown.map((alert, i) => {
          const s = severityStyle[alert.severity] || severityStyle.info;
          const Icon = s.icon;
          const title = alert.title || alert.name;
          const body  = alert.message || alert.recommendation;
          const time  = alert.triggeredAt || "Just now";
          return (
            <div key={alert.id || i} className={`flex gap-3 p-3 rounded-xl border ${s.bg}`}>
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.iconClass}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${s.badge}`}>{title}</span>
                  {alert.crop && (
                    <span className="text-xs text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/40">{alert.crop}</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{body}</p>
                <p className="text-xs text-slate-600 mt-1">{time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CropFleetPanel() {
  const avgHealth = Math.round(CROPS.reduce((s, c) => s + c.health, 0) / CROPS.length);
  const strokeColor = avgHealth >= 85 ? "#10b981" : avgHealth >= 70 ? "#f59e0b" : "#f43f5e";
  const circ = 2 * Math.PI * 18;
  const offset = circ * (1 - avgHealth / 100);
  return (
    <div className="bento-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-400" /> Crop Health Overview
        </h3>
        <Link to="/crop-intelligence" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
          Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/40">
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 48 48" className="w-12 h-12" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="24" cy="24" r="18" fill="none" stroke="#1e293b" strokeWidth="4" />
            <circle cx="24" cy="24" r="18" fill="none" stroke={strokeColor} strokeWidth="4"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{avgHealth}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Fleet Average</p>
          <p className="text-xs text-slate-500">Across {CROPS.length} active fields</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {CROPS.map(crop => {
          const hc = crop.health >= 85 ? { bar: "bg-emerald-500", text: "text-emerald-400" }
            : crop.health >= 70 ? { bar: "bg-amber-500", text: "text-amber-400" }
            : { bar: "bg-rose-500", text: "text-rose-400" };
          return (
            <div key={crop.id} className="flex items-center gap-3">
              <span className="text-base w-6 text-center">{crop.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{crop.name}</span>
                  <span className={`font-bold ${hc.text}`}>{crop.health}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${hc.bar}`} style={{ width: `${crop.health}%` }} />
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                crop.pestRisk === "high" ? "bg-rose-500" : crop.pestRisk === "medium" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IrrigationDonut({ irrigationScore }) {
  const score = irrigationScore ?? 50;
  const color = score >= 70 ? "#f43f5e" : score >= 45 ? "#f59e0b" : "#10b981";
  const label = score >= 70 ? "High Demand" : score >= 45 ? "Moderate" : "Low Demand";
  const sub   = score >= 70 ? "Irrigate today" : score >= 45 ? "Within 36h" : "All good";
  const data  = [{ value: score }, { value: 100 - score }];
  return (
    <div className="bento-card p-5 flex flex-col items-center justify-center text-center">
      <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 self-start">
        <Waves className="w-3.5 h-3.5 text-sky-400" /> Irrigation Demand
      </h3>
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={58}
              startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="#1e293b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-bold mt-1" style={{ color }}>{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      <Link to="/weather-planner" className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
        View Planner <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function SeasonProgress() {
  const s = SEASONAL_SUMMARY;
  return (
    <div className="bento-card p-5">
      <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
        <Leaf className="w-3.5 h-3.5 text-emerald-400" /> {s.season}
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Season Progress</span>
            <span className="text-emerald-400 font-bold">{s.progressPct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${s.progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>{s.startDate}</span><span>{s.endDate}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total Fields",   value: `${s.totalFields}`,          icon: "🌱" },
            { label: "Total Area",     value: `${s.totalArea} ha`,          icon: "📐" },
            { label: "Yield Target",   value: `${s.avgYieldTarget} t/ha`,   icon: "🎯" },
            { label: "Yield Estimate", value: `${s.avgYieldEstimate} t/ha`, icon: "📊" },
            { label: "Water Saved",    value: `${s.waterConserved}%`,       icon: "💧" },
            { label: "Resolved",       value: `${s.alertsResolved}`,        icon: "✅" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-900/50 border border-slate-700/30 rounded-xl px-2.5 py-2">
              <p className="text-base leading-none">{icon}</p>
              <p className="text-xs font-bold text-slate-200 mt-1">{value}</p>
              <p className="text-xs text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendCharts({ weatherData }) {
  const hourlyData = weatherData?.hourly?.slice(0, 24).map(h => ({
    time: h.time, temp: h.temperature, humidity: h.humidity, rain: h.precipProbability,
  })) || [];

  const dailyComposite = weatherData?.daily?.map(d => ({
    day: d.day, high: d.tempMax, low: d.tempMin,
    rain: parseFloat(d.precipitation.toFixed(1)),
  })) || [];

  const cropTrendData = [0,1,2,3,4,5,6].map(i => ({
    day: `D-${6-i}`,
    wheat:  WEEKLY_HEALTH_TREND.wheat[i],
    rice:   WEEKLY_HEALTH_TREND.rice[i],
    maize:  WEEKLY_HEALTH_TREND.maize[i],
    cotton: WEEKLY_HEALTH_TREND.cotton[i],
    tomato: WEEKLY_HEALTH_TREND.tomato[i],
  })).reverse();

  const CROP_COLORS = { wheat:"#f59e0b", rice:"#10b981", maize:"#eab308", cotton:"#f43f5e", tomato:"#f97316" };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 bento-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-400" /> 24-Hour Temperature &amp; Humidity
          </h3>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={hourlyData} margin={{ top:5, right:5, left:-22, bottom:0 }}>
              <defs>
                <linearGradient id="db-tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="db-humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="temp"     name="Temp"     unit="°C" stroke="#f87171" strokeWidth={2.5} fill="url(#db-tempGrad)" />
              <Area type="monotone" dataKey="humidity" name="Humidity" unit="%"  stroke="#38bdf8" strokeWidth={2}   fill="url(#db-humGrad)"  />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-12 lg:col-span-5 bento-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-400" /> 7-Day Temp &amp; Rainfall
          </h3>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={dailyComposite} margin={{ top:5, right:5, left:-22, bottom:0 }}>
              <defs>
                <linearGradient id="db-barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="temp" tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="rain" orientation="right" tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar    yAxisId="rain" dataKey="rain" name="Rain" unit="mm" fill="url(#db-barGrad)" radius={[3,3,0,0]} />
              <Line  yAxisId="temp" type="monotone" dataKey="high" name="High" unit="°C" stroke="#f87171" strokeWidth={2.5} dot={{ r:3, fill:"#f87171", strokeWidth:0 }} />
              <Line  yAxisId="temp" type="monotone" dataKey="low"  name="Low"  unit="°C" stroke="#94a3b8" strokeWidth={1.5} dot={{ r:2, fill:"#94a3b8", strokeWidth:0 }} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bento-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> 7-Day Crop Health Trends
          </h3>
          <Link to="/crop-intelligence" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
            Full Analysis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={cropTrendData} margin={{ top:5, right:5, left:-22, bottom:0 }}>
            <defs>
              {Object.entries(CROP_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`crop-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day"    tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} />
            <YAxis domain={[55, 100]} tick={{ fill:"#475569", fontSize:9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize:"10px", color:"#64748b", paddingTop:"8px" }} />
            {Object.entries(CROP_COLORS).map(([key, color]) => (
              <Area key={key} type="monotone" dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={color} strokeWidth={2} fill={`url(#crop-${key})`}
                dot={false} activeDot={{ r:4, stroke:"#0d1426", strokeWidth:2 }} unit="%" />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function QuickNavTiles() {
  const tiles = [
    { to:"/weather-planner",   icon:CloudRain, label:"Weather Planner",   sub:"7-day forecast & irrigation",  borderColor:"border-sky-600/30",    iconColor:"text-sky-400",    fromColor:"from-sky-600/20",     toColor:"to-blue-600/10"   },
    { to:"/crop-intelligence", icon:Sprout,    label:"Crop Intelligence", sub:"Health, pests & nutrients",    borderColor:"border-emerald-600/30",iconColor:"text-emerald-400", fromColor:"from-emerald-600/20", toColor:"to-teal-600/10"   },
    { to:"/assistant",         icon:Activity,  label:"AI Assistant",      sub:"Ask anything about your farm", borderColor:"border-violet-600/30", iconColor:"text-violet-400",  fromColor:"from-violet-600/20", toColor:"to-indigo-600/10" },
  ];
  return (
    <div className="grid grid-cols-3 gap-4">
      {tiles.map(({ to, icon: Icon, label, sub, borderColor, iconColor, fromColor, toColor }) => (
        <Link key={to} to={to}
          className={`bento-card p-4 bg-gradient-to-br ${fromColor} ${toColor} border ${borderColor} hover:scale-105 transition-all duration-200 group`}>
          <Icon className={`w-6 h-6 ${iconColor} mb-3`} />
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sub}</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
            Open <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { weatherData, alerts: weatherAlerts, irrigationScore, loading, error, lastUpdated, refresh } =
    useWeather(28.6692, 77.4538);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center space-y-4">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
          <div className="w-20 h-20 rounded-full border-t-2 border-r-2 border-emerald-400 animate-spin" />
          <Leaf className="absolute inset-0 m-auto w-7 h-7 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Initialising AgroCast IQ</p>
        <p className="text-xs text-slate-500">Fetching live conditions — Ghaziabad, UP</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center space-y-4 bento-card p-8 max-w-sm">
        <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <p className="text-sm font-semibold text-rose-300">Failed to load weather data</p>
        <p className="text-xs text-slate-500">{error}</p>
        <button onClick={refresh}
          className="flex items-center gap-2 mx-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    </div>
  );

  const { current, daily } = weatherData;
  const totalAlerts = weatherAlerts.length + ALERT_RULES.filter(r => r.severity === "danger").length;
  const avgHealth   = Math.round(CROPS.reduce((s, c) => s + c.health, 0) / CROPS.length);
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Good {greeting} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Ghaziabad, UP — Kharif Season Overview
            {lastUpdated && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-slate-600 text-xs">
                  {lastUpdated.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })} IST
                </span>
              </>
            )}
          </p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 bg-slate-800/60 border border-slate-700/60 px-3 py-2 rounded-xl transition-all hover:border-emerald-500/40">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Thermometer} label="Temperature"      value={current.temperature}  suffix="°C"    accentColor="amber"   delay={0}   />
        <StatCard icon={Droplets}    label="Humidity"         value={current.humidity}     suffix="%"     accentColor="sky"     delay={60}  />
        <StatCard icon={Wind}        label="Wind Speed"       value={current.windSpeed}    suffix=" km/h" accentColor="violet"  delay={120} />
        <StatCard icon={Activity}    label="Fleet Health"     value={avgHealth}            suffix="%"     subLabel="vs last week" subValue="+2%" subPositive accentColor="emerald" delay={180} />
        <StatCard icon={ShieldAlert} label="Active Alerts"    value={totalAlerts}          suffix=""      subLabel="critical"   subValue="2"  subPositive={false} accentColor="rose" delay={240} />
        <StatCard icon={BarChart3}   label="Irrigation Score" value={irrigationScore ?? 0} suffix="/100"  subLabel="demand"     subValue={irrigationScore >= 70 ? "High" : irrigationScore >= 45 ? "Med" : "Low"} subPositive={irrigationScore < 45} accentColor="teal" delay={300} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <WeatherHero current={current} location={weatherData.location} />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <MiniForecast daily={daily} />
        </div>
        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
          <IrrigationDonut irrigationScore={irrigationScore} />
          <SeasonProgress />
        </div>
      </div>

      <TrendCharts weatherData={weatherData} />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <CropFleetPanel />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-8">
          <AlertFeed weatherAlerts={weatherAlerts} />
        </div>
      </div>

      <QuickNavTiles />
    </div>
  );
}