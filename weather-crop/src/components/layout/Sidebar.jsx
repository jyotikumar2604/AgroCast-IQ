import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, CloudSun, Sprout, Bot, Leaf,
  ChevronRight, Settings, HelpCircle, X,
  Bell, Shield, Monitor, Moon, Globe, BookOpen,
  MessageCircle, Mail, FileText, ExternalLink
} from "lucide-react";

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose }) {
  const [notif,  setNotif]  = useState(true);
  const [darkMode,setDark]  = useState(true);
  const [units,  setUnits]  = useState("metric");
  const [lang,   setLang]   = useState("en");
  const [autoRef,setAutoRef]= useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md mx-4 bg-[#0d1426] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-800/60 to-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Settings</p>
              <p className="text-xs text-slate-500">Preferences &amp; configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Notifications */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Notifications</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">Agri Alerts</p>
                <p className="text-xs text-slate-500">Pest risk, irrigation, and weather alerts</p>
              </div>
              <button
                onClick={() => setNotif(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notif ? "bg-emerald-500" : "bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notif ? "left-5.5 translate-x-0.5" : "left-0.5"}`}
                  style={{ left: notif ? "22px" : "2px" }} />
              </button>
            </div>
          </div>

          {/* Display */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Display</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-200">Dark Mode</p>
                <p className="text-xs text-slate-500">Toggle light / dark theme</p>
              </div>
              <button
                onClick={() => setDark(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-emerald-500" : "bg-slate-700"}`}
              >
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: darkMode ? "22px" : "2px" }} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">Auto Refresh</p>
                <p className="text-xs text-slate-500">Refresh weather every 10 minutes</p>
              </div>
              <button
                onClick={() => setAutoRef(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoRef ? "bg-emerald-500" : "bg-slate-700"}`}
              >
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: autoRef ? "22px" : "2px" }} />
              </button>
            </div>
          </div>

          {/* Units & Language */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Units &amp; Language</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Temperature Units</p>
                <div className="flex gap-2">
                  {["metric", "imperial"].map(u => (
                    <button key={u} onClick={() => setUnits(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        units === u ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-700/50 text-slate-400 border border-slate-600/40"
                      }`}>
                      {u === "metric" ? "°C Metric" : "°F Imperial"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Language</p>
                <div className="flex gap-2">
                  {["en", "hi"].map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        lang === l ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-700/50 text-slate-400 border border-slate-600/40"
                      }`}>
                      {l === "en" ? "🇬🇧 English" : "🇮🇳 Hindi"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Account</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/40">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white">JY</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Jyoti</p>
                <p className="text-xs text-slate-500">jyoti@agrocastiq.in · Free Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-700/60">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-slate-700/60 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/40">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Help & Docs Modal ────────────────────────────────────────────────────────
function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("guide");

  const guides = [
    { icon: "🌤️", title: "Reading Weather Forecasts",     desc: "Understand WMO codes, precipitation probability, and UV index levels for farming decisions." },
    { icon: "💧", title: "Smart Irrigation Planner",       desc: "The demand score is calculated from temperature, humidity, soil moisture, and 3-day rain probability." },
    { icon: "🌱", title: "Crop Health Monitoring",         desc: "Health scores (0–100) combine soil moisture, nutrient levels, pest risk, and growth stage progress." },
    { icon: "🔔", title: "Alert Rules Explained",          desc: "Alerts fire when conditions cross thresholds: Temp > 38°C, UV > 8, wind > 30 km/h, rain prob > 60%." },
    { icon: "🔍", title: "Searching Locations",            desc: "Type any city name in the search bar. Select from the autocomplete list to update all weather data." },
    { icon: "🤖", title: "AI Assistant",                   desc: "Ask about irrigation timing, pest risks, harvest windows, or crop-specific conditions." },
  ];

  const faqs = [
    { q: "Why is weather data sometimes delayed?",  a: "Open-Meteo updates forecasts every hour. If you see stale data, click the Refresh button." },
    { q: "Can I add my own farm location?",          a: "Yes — type your village or nearest town in the search bar and select the correct result from the dropdown." },
    { q: "What is the Irrigation Demand Score?",     a: "A 0–100 score. Above 70 = irrigate today. 45–70 = within 36 hours. Below 45 = no action needed." },
    { q: "How often does data auto-refresh?",        a: "Weather data refreshes automatically every 10 minutes in the background." },
    { q: "Are crop health scores real sensor data?", a: "No — they are calculated from weather conditions and seasonal crop models. For precise data, connect IoT sensors." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[#0d1426] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-800/60 to-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Help &amp; Docs</p>
              <p className="text-xs text-slate-500">Guides, FAQs &amp; support</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 bg-slate-900/40 border-b border-slate-700/40">
          {[
            { id: "guide", label: "User Guide",  icon: BookOpen     },
            { id: "faq",   label: "FAQ",          icon: MessageCircle},
            { id: "about", label: "About",         icon: FileText     },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === id ? "bg-slate-700/80 text-white" : "text-slate-500 hover:text-slate-300"
              }`}>
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {activeTab === "guide" && guides.map(g => (
            <div key={g.title} className="flex gap-3 p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <span className="text-xl shrink-0">{g.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-200">{g.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}

          {activeTab === "faq" && faqs.map(f => (
            <div key={f.q} className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <p className="text-sm font-semibold text-emerald-400 mb-1">Q: {f.q}</p>
              <p className="text-xs text-slate-400 leading-relaxed">A: {f.a}</p>
            </div>
          ))}

          {activeTab === "about" && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-700/30 rounded-xl text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <p className="text-base font-bold text-white">AgroCast IQ v1.0</p>
                <p className="text-xs text-slate-400 mt-1">Weather-Crop Intelligence Dashboard</p>
                <p className="text-xs text-slate-600 mt-0.5">Built with React + Tailwind + Open-Meteo</p>
              </div>
              {[
                { icon: Globe,         label: "Weather API",  val: "Open-Meteo (free, no key required)", href: "https://open-meteo.com" },
                { icon: Globe,         label: "Geocoding",    val: "Open-Meteo Geocoding API",            href: "https://open-meteo.com/en/docs/geocoding-api" },
                { icon: ExternalLink,  label: "License",      val: "MIT — Free for academic use",         href: null },
              ].map(({ icon: Icon, label, val, href }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                  <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm text-slate-200">{val}</p>
                  </div>
                  {href && (
                    <a href={href} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
              <div className="flex gap-3">
                <a href="mailto:support@agrocastiq.in"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700/60 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { to: "/",                icon: LayoutDashboard, label: "Dashboard",        end: true },
  { to: "/weather-planner", icon: CloudSun,         label: "Weather Planner"            },
  { to: "/crop-intelligence",icon: Sprout,          label: "Crop Intelligence"          },
  { to: "/assistant",       icon: Bot,              label: "AI Assistant"               },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp,     setShowHelp]     = useState(false);

  return (
    <>
      <aside className="w-64 flex flex-col h-full bg-[#0d1426] border-r border-slate-800 shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide leading-none">AgroCast IQ</p>
            <p className="text-xs text-slate-500 mt-0.5">Crop Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`
              }>
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {label}
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="py-4 px-3 border-t border-slate-800 space-y-1">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            Help &amp; Docs
          </button>
          <div className="mt-3 mx-1 p-3 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-800/30">
            <p className="text-xs font-semibold text-emerald-400">Season: Kharif 2025</p>
            <p className="text-xs text-slate-500 mt-0.5">Sowing window active</p>
            <div className="mt-2 h-1 bg-slate-700 rounded-full">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "62%" }} />
            </div>
            <p className="text-xs text-slate-600 mt-1">62% of season elapsed</p>
          </div>
        </div>
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showHelp     && <HelpModal     onClose={() => setShowHelp(false)}     />}
    </>
  );
}