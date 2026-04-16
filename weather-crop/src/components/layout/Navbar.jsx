import { useState, useRef, useEffect } from "react";
import { Bell, Bot, Search, Sun, MapPin, Loader, X, AlertTriangle, Info, XCircle } from "lucide-react";
import { geocodeCity, useLocation } from "../../context/LocationContext";

// ─── Dummy notifications ──────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1, type: "danger",
    title: "Heat Stress Warning",
    body:  "Temperature exceeds 38°C. Irrigate wheat fields before 7 AM tomorrow.",
    time:  "2 min ago",  read: false,
  },
  {
    id: 2, type: "warning",
    title: "Bollworm Alert",
    body:  "Cotton trap count exceeded threshold (8/trap). Spray Chlorpyrifos today.",
    time:  "18 min ago", read: false,
  },
  {
    id: 3, type: "info",
    title: "Rain Expected in 48 Hours",
    body:  "67% chance of rain on Friday. Hold all scheduled irrigation.",
    time:  "1 hr ago",   read: false,
  },
  {
    id: 4, type: "warning",
    title: "Low Soil Moisture — Cotton",
    body:  "Field D-4 at 38% moisture. Irrigation overdue by 7 days.",
    time:  "3 hrs ago",  read: true,
  },
  {
    id: 5, type: "info",
    title: "Weather Refresh Complete",
    body:  "All weather data updated successfully for your location.",
    time:  "10 hrs ago", read: true,
  },
];

const TYPE_STYLE = {
  danger:  { Icon: XCircle,       dot: "bg-rose-500",  badge: "bg-rose-500/15 border-rose-500/30 text-rose-300"    },
  warning: { Icon: AlertTriangle, dot: "bg-amber-500", badge: "bg-amber-500/15 border-amber-500/30 text-amber-300" },
  info:    { Icon: Info,          dot: "bg-sky-500",   badge: "bg-sky-500/15 border-sky-500/30 text-sky-300"       },
};

export default function Navbar({ onChatOpen }) {
  const { location, updateLocation } = useLocation();

  // search state
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const [searching,   setSearching]   = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showDrop,    setShowDrop]    = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // notification state
  const [notifs,    setNotifs]    = useState(INITIAL_NOTIFICATIONS);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  // close search dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close notification panel on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── search handlers ──────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearchError("");
    clearTimeout(debounceRef.current);
    if (!val.trim() || val.trim().length < 2) { setResults([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const found = await geocodeCity(val.trim());
        setResults(found);
        setShowDrop(true);
      } catch (err) {
        setSearchError(err.message);
        setResults([]);
        setShowDrop(true);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  const handleSelect = (r) => {
    updateLocation({ label: r.label, lat: r.lat, lon: r.lon });
    setQuery(r.label);
    setShowDrop(false);
    setResults([]);
  };

  const clearSearch = () => { setQuery(""); setResults([]); setShowDrop(false); setSearchError(""); };

  // ── notification handlers ────────────────────────────────────────────────────
  const markAllRead = ()    => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismissOne  = (id)  => setNotifs(prev => prev.filter(n => n.id !== id));
  const markOneRead = (id)  => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const now     = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-[#0d1426]/90 backdrop-blur-md sticky top-0 z-20">

      {/* ── Left — date + time ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sun className="text-amber-400 w-5 h-5 animate-spin-slow" />
          <span className="text-sm font-semibold text-slate-300 tracking-wide">{dateStr}</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-sm text-slate-500 font-mono">{timeStr}</span>
      </div>

      {/* ── Centre — city search ── */}
      <div ref={wrapperRef} className="hidden md:block relative w-80">
        <div className={`flex items-center gap-2 bg-slate-800/60 border rounded-xl px-4 py-2 transition-colors ${
          showDrop ? "border-emerald-500/50" : "border-slate-700 hover:border-slate-600"
        }`}>
          {searching
            ? <Loader className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            : <Search className="w-4 h-4 text-slate-500 shrink-0" />
          }
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => results.length > 0 && setShowDrop(true)}
            placeholder={`📍 ${location.label}`}
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full"
          />
          {query && (
            <button onClick={clearSearch} className="text-slate-500 hover:text-slate-300 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {showDrop && (
          <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            {searchError ? (
              <div className="px-4 py-3 text-xs text-rose-400">{searchError}</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-500">No cities found — try a different name</div>
            ) : (
              results.map((r, i) => (
                <button key={i} onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800/60 last:border-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.admin1 ? `${r.admin1}, ` : ""}{r.country}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Right — bell + AI button only (avatar removed) ── */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(v => !v)}
            className={`relative p-2 rounded-lg transition-colors ${showNotif ? "bg-slate-700" : "hover:bg-slate-800"}`}
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-amber-400" : "text-slate-400"}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {showNotif && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications</p>
                  </div>
                ) : (
                  notifs.map(n => {
                    const { dot } = TYPE_STYLE[n.type] || TYPE_STYLE.info;
                    return (
                      <div key={n.id} onClick={() => markOneRead(n.id)}
                        className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-800/50 ${n.read ? "opacity-60" : ""}`}>
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${n.read ? "bg-slate-600" : dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`text-xs font-semibold ${n.read ? "text-slate-400" : "text-slate-200"}`}>{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                              <p className="text-xs text-slate-600 mt-1">{n.time}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); dismissOne(n.id); }}
                              className="text-slate-600 hover:text-slate-400 transition-colors shrink-0 mt-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifs.length > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-700/60 bg-slate-800/40">
                  <button onClick={() => setNotifs([])}
                    className="w-full text-xs text-slate-500 hover:text-rose-400 transition-colors text-center">
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Assistant button */}
        <button
          onClick={onChatOpen}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-violet-900/40 transition-all"
        >
          <Bot className="w-4 h-4" />
          AI Assistant
        </button>

      </div>
    </header>
  );
}