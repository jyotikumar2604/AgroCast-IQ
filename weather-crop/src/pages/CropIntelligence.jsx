import { useState, useMemo } from "react";
import {
  Sprout, Droplets, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Minus, Activity, FlaskConical,
  CalendarDays, Bug, ChevronRight, Leaf, BarChart3,
  Thermometer, Zap, Info, ShieldAlert, Target
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, Cell
} from "recharts";
import {
  CROPS, GROWTH_STAGES, WEEKLY_HEALTH_TREND,
  PEST_DISEASE_MATRIX, IRRIGATION_LOG, NUTRIENT_STATUS
} from "../data/cropData";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  none:   { label: "None",   dot: "bg-slate-600",   text: "text-slate-500",  cell: "bg-slate-800/40" },
  low:    { label: "Low",    dot: "bg-emerald-500",  text: "text-emerald-400",cell: "bg-emerald-500/10 border border-emerald-500/20" },
  medium: { label: "Medium", dot: "bg-amber-500",    text: "text-amber-400",  cell: "bg-amber-500/10 border border-amber-500/20" },
  high:   { label: "High",   dot: "bg-rose-500",     text: "text-rose-400",   cell: "bg-rose-500/10 border border-rose-500/20" },
};

const MOISTURE_CONFIG = {
  low:     { label: "Low — Irrigate",  color: "text-rose-400",    bar: "bg-rose-500"    },
  optimal: { label: "Optimal",         color: "text-emerald-400", bar: "bg-emerald-500" },
  excess:  { label: "Excess — Drain",  color: "text-sky-400",     bar: "bg-sky-500"     },
};

function healthColor(h) {
  if (h >= 85) return { text: "text-emerald-400", ring: "ring-emerald-500/30", bg: "bg-emerald-500" };
  if (h >= 70) return { text: "text-amber-400",   ring: "ring-amber-500/30",   bg: "bg-amber-500"   };
  return             { text: "text-rose-400",     ring: "ring-rose-500/30",    bg: "bg-rose-500"    };
}

function TrendIcon({ trend }) {
  if (trend === "improving") return <TrendingUp  className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "declining") return <TrendingDown className="w-3.5 h-3.5 text-rose-400"   />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

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

// ─── Circular Health Score ────────────────────────────────────────────────────
function HealthRing({ score, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const { text } = healthColor(score);
  const strokeColor = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={strokeColor} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${text}`}>
        {score}
      </span>
    </div>
  );
}

// ─── Growth Stage Timeline ────────────────────────────────────────────────────
function GrowthTimeline({ cropId, currentStage, progress }) {
  const stages = GROWTH_STAGES[cropId] || [];
  const currentIdx = stages.findIndex(s => s === currentStage);
  return (
    <div className="relative mt-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-slate-700" />
        <div
          className="absolute top-2.5 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
          style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }}
        />
        {stages.map((stage, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={stage} className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${active ? "border-emerald-400 bg-emerald-400/20 scale-125"
                : done  ? "border-emerald-600 bg-emerald-600"
                : "border-slate-600 bg-slate-800"}`}>
                {done && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />}
                {active && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <span className={`text-[9px] text-center leading-tight max-w-[40px]
                ${active ? "text-emerald-400 font-bold" : done ? "text-slate-500" : "text-slate-600"}`}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{progress}%</span>
      </div>
    </div>
  );
}

// ─── Crop Health Card ─────────────────────────────────────────────────────────
function CropHealthCard({ crop, isSelected, onClick }) {
  const hc = healthColor(crop.health);
  const mc = MOISTURE_CONFIG[crop.soilMoistureStatus];
  const alertCount = crop.alerts.length;
  const daysToHarvest = Math.ceil(
    (new Date(crop.expectedHarvest) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={onClick}
      className={`bento-card p-5 cursor-pointer transition-all duration-200 hover:scale-[1.015] relative overflow-hidden
        ${isSelected ? `ring-2 ${hc.ring} shadow-lg` : "hover:border-slate-600/70"}`}
    >
      {/* accent glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: crop.gradientFrom }} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${crop.gradientFrom}22` }}>
            {crop.emoji}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">{crop.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{crop.variety}</p>
          </div>
        </div>
        <HealthRing score={crop.health} size={48} />
      </div>

      {/* Field + area */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-md border border-slate-600/40">
          {crop.field}
        </span>
        <span className="text-[10px] text-slate-500">{crop.area} {crop.areaUnit}</span>
        <div className="flex items-center gap-1 ml-auto">
          <TrendIcon trend={crop.healthTrend} />
          <span className={`text-[10px] capitalize ${
            crop.healthTrend === "improving" ? "text-emerald-400"
            : crop.healthTrend === "declining" ? "text-rose-400" : "text-slate-400"
          }`}>{crop.healthTrend}</span>
        </div>
      </div>

      {/* Soil Moisture bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-slate-500">Soil Moisture</span>
          <span className={`font-semibold ${mc.color}`}>{crop.soilMoisture}% — {mc.label}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${mc.bar} transition-all duration-700`}
            style={{ width: `${crop.soilMoisture}%` }} />
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Stage",     value: crop.stage,                   icon: Sprout       },
          { label: "Harvest",   value: `${daysToHarvest}d`,          icon: CalendarDays },
          { label: "Yield Est", value: `${crop.yieldEstimate} ${crop.yieldUnit}`, icon: Target },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-slate-900/50 rounded-lg p-2 text-center border border-slate-700/30">
            <Icon className="w-3 h-3 text-slate-500 mx-auto mb-0.5" />
            <p className="text-[11px] font-semibold text-slate-200 truncate">{value}</p>
            <p className="text-[9px] text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Yield vs target */}
      <div className={`flex items-center gap-2 text-[10px] px-2.5 py-1.5 rounded-lg mb-2
        ${crop.yieldVsTarget >= 0 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
        {crop.yieldVsTarget >= 0
          ? <TrendingUp className="w-3 h-3 text-emerald-400" />
          : <TrendingDown className="w-3 h-3 text-rose-400" />}
        <span className={crop.yieldVsTarget >= 0 ? "text-emerald-300" : "text-rose-300"}>
          {crop.yieldVsTarget >= 0 ? "+" : ""}{crop.yieldVsTarget}% vs target yield
        </span>
      </div>

      {/* Alerts */}
      {alertCount > 0 && (
        <div className="flex items-center gap-2 text-[10px] text-amber-400">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{alertCount} active alert{alertCount > 1 ? "s" : ""}</span>
        </div>
      )}

      {isSelected && (
        <div className="absolute bottom-3 right-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Crop Detail Panel ────────────────────────────────────────────────────────
function CropDetailPanel({ crop }) {
  const [activeTab, setActiveTab] = useState("overview");
  const hc = healthColor(crop.health);

  // Nutrient radar data
  const radarData = NUTRIENT_STATUS.labels.map((label, i) => ({
    subject: label.split(" — ")[1] || label,
    value: NUTRIENT_STATUS[crop.id][i],
    fullMark: 100,
  }));

  // Health trend line data
  const trendData = WEEKLY_HEALTH_TREND[crop.id].map((v, i) => ({
    day: `D-${6 - i}`,
    health: v,
  })).reverse();

  const tabs = [
    { id: "overview",   label: "Overview",    icon: Activity      },
    { id: "nutrients",  label: "Nutrients",   icon: FlaskConical  },
    { id: "schedule",   label: "Schedule",    icon: CalendarDays  },
    { id: "pest",       label: "Pest & Disease", icon: Bug        },
  ];

  return (
    <div className="bento-card p-5 h-full flex flex-col">
      {/* Panel header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${crop.gradientFrom}22` }}>
          {crop.emoji}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white">{crop.name}
            <span className="ml-2 text-xs text-slate-500 font-normal">— {crop.variety}</span>
          </h2>
          <p className="text-xs text-slate-500">{crop.field} · {crop.area} ha</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          crop.health >= 85 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : crop.health >= 70 ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
          : "bg-rose-500/15 text-rose-400 border-rose-500/30"
        }`}>
          Health {crop.health}%
        </div>
      </div>

      {/* Growth Timeline */}
      <div className="mb-4 p-3 bg-slate-900/40 rounded-xl border border-slate-700/40">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Sprout className="w-3 h-3" /> Growth Stage
        </p>
        <GrowthTimeline cropId={crop.id} currentStage={crop.stage} progress={crop.stageProgress} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-900/50 p-1 rounded-xl border border-slate-700/40">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
              ${activeTab === id
                ? "bg-slate-700/80 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"}`}>
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Alerts */}
            {crop.alerts.length > 0 && (
              <div className="space-y-2">
                {crop.alerts.map((a, i) => {
                  const styles = {
                    danger:  "bg-rose-500/10 border-rose-500/30 text-rose-300",
                    warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
                    info:    "bg-sky-500/10 border-sky-500/30 text-sky-300",
                  };
                  const icons = { danger: XCircle, warning: AlertTriangle, info: Info };
                  const Icon = icons[a.type] || Info;
                  return (
                    <div key={i} className={`flex gap-2.5 p-3 rounded-xl border text-xs ${styles[a.type]}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{a.message}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Health trend mini chart */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> 7-Day Health Trend
              </p>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="health" name="Health" unit="%"
                    stroke={crop.health >= 85 ? "#10b981" : crop.health >= 70 ? "#f59e0b" : "#f43f5e"}
                    strokeWidth={2.5} dot={false}
                    activeDot={{ r: 4, stroke: "#1e293b", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Planted",        value: new Date(crop.plantedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), icon: "📅" },
                { label: "Expected Harvest",value: new Date(crop.expectedHarvest).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), icon: "🌾" },
                { label: "Last Irrigated", value: new Date(crop.lastIrrigated).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), icon: "💧" },
                { label: "Next Irrigation",value: new Date(crop.nextIrrigation).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), icon: "📆" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-200">{icon} {value}</p>
                </div>
              ))}
            </div>

            {/* Water usage bar */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-sky-400" /> Water Used</span>
                <span className="font-mono text-slate-300">{crop.waterUsed} / {crop.waterTarget} mm</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${(crop.waterUsed / crop.waterTarget) * 100}%` }} />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">{Math.round((crop.waterUsed / crop.waterTarget) * 100)}% of seasonal requirement met</p>
            </div>
          </div>
        )}

        {/* ── Nutrients Tab ── */}
        {activeTab === "nutrients" && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FlaskConical className="w-3 h-3" /> Soil Nutrient Profile
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Radar name={crop.name} dataKey="value" stroke={crop.gradientFrom}
                    fill={crop.gradientFrom} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {NUTRIENT_STATUS.labels.map((label, i) => {
                const val = NUTRIENT_STATUS[crop.id][i];
                const status = val >= 75 ? { text: "Optimal", color: "text-emerald-400", bar: "bg-emerald-500" }
                  : val >= 55 ? { text: "Adequate", color: "text-amber-400", bar: "bg-amber-500" }
                  : { text: "Deficient", color: "text-rose-400", bar: "bg-rose-500" };
                return (
                  <div key={label} className="bg-slate-900/50 border border-slate-700/30 rounded-xl px-3 py-2.5">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">{label}</span>
                      <span className={`text-[10px] font-bold ${status.color}`}>{status.text} ({val}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${status.bar} transition-all duration-700`}
                        style={{ width: `${val}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Schedule Tab ── */}
        {activeTab === "schedule" && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" /> Irrigation Log (L/m²)
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart
                data={IRRIGATION_LOG.map(d => ({ date: d.date, amount: d[crop.id] }))}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="irrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={crop.gradientFrom} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={crop.gradientTo}   stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Water Applied" unit=" L/m²" fill="url(#irrGrad)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Upcoming schedule */}
            <div className="space-y-2">
              {[0, 1, 2].map(i => {
                const d = new Date();
                d.setDate(d.getDate() + (i === 0 ? 1 : i * 4));
                return (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs
                    ${i === 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/30 border-slate-700/30"}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold
                        ${i === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                        {i === 0 ? "→" : i + 1}
                      </div>
                      <span className="text-slate-200">{d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                      {i === 0 && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Next</span>}
                    </div>
                    <span className="text-slate-500 text-[10px]">{crop.waterUsed / 7 | 0} L/m² recommended</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Pest & Disease Tab ── */}
        {activeTab === "pest" && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Bug className="w-3 h-3" /> Risk Matrix — {crop.name}
            </p>
            <div className="space-y-2">
              {PEST_DISEASE_MATRIX.map(row => {
                const risk = row[crop.id];
                if (risk === "none") return null;
                const rc = RISK_CONFIG[risk];
                const TypeIcon = row.type === "pest" ? Bug : ShieldAlert;
                return (
                  <div key={row.name} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${rc.cell}`}>
                    <div className="flex items-center gap-2.5">
                      <TypeIcon className={`w-3.5 h-3.5 ${rc.text}`} />
                      <div>
                        <span className="text-xs font-medium text-slate-200">{row.name}</span>
                        <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full ${
                          row.type === "pest" ? "bg-orange-500/20 text-orange-400" : "bg-purple-500/20 text-purple-400"
                        }`}>{row.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                      <span className={`text-[10px] font-bold ${rc.text}`}>{rc.label}</span>
                    </div>
                  </div>
                );
              })}
              {PEST_DISEASE_MATRIX.filter(r => r[crop.id] !== "none").length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No active pest or disease risks
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pest Risk Heatmap ────────────────────────────────────────────────────────
function PestHeatmap() {
  const cropKeys = ["wheat", "rice", "maize", "cotton", "tomato"];
  const cropEmojis = { wheat: "🌾", rice: "🌿", maize: "🌽", cotton: "🌱", tomato: "🍅" };
  const riskScore = { none: 0, low: 1, medium: 2, high: 3 };
  const cellBg = {
    0: "bg-slate-800/50 text-slate-600",
    1: "bg-emerald-500/20 text-emerald-400",
    2: "bg-amber-500/20 text-amber-400",
    3: "bg-rose-500/20 text-rose-400",
  };
  const cellLabel = { 0: "—", 1: "Low", 2: "Med", 3: "High" };

  return (
    <div className="bento-card p-5">
      <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Bug className="w-4 h-4 text-orange-400" /> Pest & Disease Risk Matrix
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-medium px-2 py-1.5 min-w-[130px]">Threat</th>
              <th className="text-[10px] text-slate-500 font-medium px-1 text-center w-8">Type</th>
              {cropKeys.map(k => (
                <th key={k} className="text-center text-slate-400 px-2 py-1.5 min-w-[70px]">
                  <span>{cropEmojis[k]}</span>
                  <br />
                  <span className="text-[9px] capitalize">{k}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PEST_DISEASE_MATRIX.map(row => (
              <tr key={row.name}>
                <td className="text-slate-300 px-2 py-1.5 font-medium">{row.name}</td>
                <td className="text-center px-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    row.type === "pest" ? "bg-orange-500/20 text-orange-400" : "bg-violet-500/20 text-violet-400"
                  }`}>{row.type === "pest" ? "P" : "D"}</span>
                </td>
                {cropKeys.map(k => {
                  const s = riskScore[row[k]] ?? 0;
                  return (
                    <td key={k} className="text-center px-1">
                      <span className={`inline-block w-full text-center text-[10px] font-bold px-1 py-1 rounded-lg ${cellBg[s]}`}>
                        {cellLabel[s]}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/40">
        {[{ label: "None", s: 0 }, { label: "Low", s: 1 }, { label: "Medium", s: 2 }, { label: "High", s: 3 }].map(({ label, s }) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm ${cellBg[s].split(" ")[0]}`} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-slate-600">P = Pest · D = Disease</span>
      </div>
    </div>
  );
}

// ─── Fleet Summary Bar ────────────────────────────────────────────────────────
function FleetSummary() {
  const avgHealth = Math.round(CROPS.reduce((s, c) => s + c.health, 0) / CROPS.length);
  const highRisk  = CROPS.filter(c => c.pestRisk === "high" || c.diseaseRisk === "high").length;
  const overdue   = CROPS.filter(c => {
    const next = new Date(c.nextIrrigation);
    return next <= new Date();
  }).length;
  const totalArea = CROPS.reduce((s, c) => s + c.area, 0).toFixed(1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Avg Crop Health",  value: `${avgHealth}%`,       icon: Activity,    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { label: "Fields Monitored", value: `${CROPS.length}`,     icon: Leaf,        color: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20" },
        { label: "High Risk Fields", value: `${highRisk}`,         icon: ShieldAlert, color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
        { label: "Total Area",       value: `${totalArea} ha`,     icon: BarChart3,   color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
      ].map(({ label, value, icon: Icon, color, bg, border }) => (
        <div key={label} className={`bento-card p-4 flex items-center gap-3 border ${border} ${bg}`}>
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center border ${border}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Irrigation Comparison Chart ─────────────────────────────────────────────
function IrrigationComparison() {
  const CROP_COLORS = {
    wheat: "#f59e0b", rice: "#10b981", maize: "#eab308", cotton: "#f43f5e", tomato: "#f97316"
  };
  return (
    <div className="bento-card p-5">
      <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Droplets className="w-4 h-4 text-sky-400" /> Irrigation Comparison — All Crops (L/m²)
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={IRRIGATION_LOG} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "10px", color: "#64748b" }} />
          {Object.entries(CROP_COLORS).map(([key, color]) => (
            <Bar key={key} dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)}
              fill={color} fillOpacity={0.8} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CropIntelligence() {
  const [selectedCropId, setSelectedCropId] = useState("wheat");
  const selectedCrop = useMemo(() => CROPS.find(c => c.id === selectedCropId), [selectedCropId]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Crop Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time health monitoring · Kharif + Rabi Season · Ghaziabad, UP
        </p>
      </div>

      {/* Fleet summary KPI row */}
      <FleetSummary />

      {/* Main split — cards left, detail right */}
      <div className="grid grid-cols-12 gap-4">
        {/* Crop cards — 5 cols */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Sprout className="w-3 h-3" /> Active Fields
          </p>
          {CROPS.map(crop => (
            <CropHealthCard
              key={crop.id}
              crop={crop}
              isSelected={selectedCropId === crop.id}
              onClick={() => setSelectedCropId(crop.id)}
            />
          ))}
        </div>

        {/* Detail panel — 7 cols */}
        <div className="col-span-12 lg:col-span-7">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Activity className="w-3 h-3" /> Field Analysis
          </p>
          <CropDetailPanel crop={selectedCrop} />
        </div>
      </div>

      {/* Bottom row — heatmap + irrigation comparison */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <PestHeatmap />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <IrrigationComparison />
        </div>
      </div>
    </div>
  );
}