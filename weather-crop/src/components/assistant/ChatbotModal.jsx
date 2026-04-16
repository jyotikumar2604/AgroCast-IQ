import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Leaf, Minus } from "lucide-react";

const getDummyResponse = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes("irrigat"))
    return "Based on current soil moisture (42%) and the 3-day forecast showing 68% rain probability, I recommend **holding irrigation for 48 hours**. Expected rainfall of ~8mm should suffice for Kharif crops.";
  if (msg.includes("wheat"))
    return "Wheat at this stage (tillering) requires:\n• Temperature: 15–22°C (current: 24°C — slightly above optimal)\n• Irrigation interval: Every 10–12 days\n• Alert: Watch for yellow rust — humidity at 71% is a risk factor.";
  if (msg.includes("rain") || msg.includes("forecast"))
    return "7-day outlook shows a **moderate rain event on Day 3–4** with 14mm expected. I recommend scheduling fertilizer application **before Day 3** to maximise absorption.";
  if (msg.includes("pest") || msg.includes("disease"))
    return "Current conditions (high humidity: 71%, temp: 32°C) are conducive to **fungal diseases**. Preventive spray of Mancozeb is advised within the next 24 hours for paddy fields.";
  if (msg.includes("harvest"))
    return "Based on the maturity stage and weather window, **Day 5–6** appears optimal for harvest — dry conditions expected with wind speed < 15 km/h. Avoid Day 3–4 due to forecasted rain.";
  if (msg.includes("temperature") || msg.includes("hot") || msg.includes("heat"))
    return "Temperature forecast shows **max 39°C on Day 2**. I recommend:\n1. Pre-dawn irrigation to cool soil\n2. Mulching to retain moisture\n3. Avoid transplanting on this day.";
  return "I can help you with irrigation scheduling, crop health analysis, weather interpretation, and harvest planning. Try asking about **irrigation timing**, **specific crops**, **pest risks**, or **harvest windows**.";
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    text: "Hello! I'm **AgroCast IQ AI**, your crop intelligence assistant 🌱\n\nAsk me about irrigation schedules, crop health, pest risks, or weather impacts on your farm.",
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function ChatbotModal({ isOpen, onClose }) {
  const [messages,  setMessages]  = useState(INITIAL_MESSAGES);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [minimised, setMinimised] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!minimised) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, minimised]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = {
      id:   Date.now(),
      role: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const reply = {
      id:   Date.now() + 1,
      role: "assistant",
      text: getDummyResponse(userMsg.text),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setIsTyping(false);
    setMessages(prev => [...prev, reply]);
  };

  const renderText = (text) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="font-semibold text-emerald-300">{part}</strong>
            : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  if (!isOpen) return null;

  // ── Minimised pill ──────────────────────────────────────────────────────────
  if (minimised) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMinimised(false)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-2xl shadow-emerald-900/50 transition-all"
        >
          <Leaf className="w-4 h-4" />
          AgroCast IQ AI
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </button>
      </div>
    );
  }

  // ── Full chat window ────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[370px] flex flex-col bg-[#0d1a2d] border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-slide-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-900/70 to-teal-900/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AgroCast IQ AI</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>

        {/* Minimise + Close buttons — clearly labelled */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimised(true)}
            title="Minimise"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors text-xs"
          >
            <Minus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Min</span>
          </button>
          <button
            onClick={onClose}
            title="Close chat"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-transparent transition-colors text-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="overflow-y-auto p-4 space-y-4 h-80">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "assistant"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-violet-500 to-indigo-600"
            }`}>
              {msg.role === "assistant"
                ? <Bot  className="w-3.5 h-3.5 text-white" />
                : <User className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/40"
                  : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none"
              }`}>
                {renderText(msg.text)}
              </div>
              <span className="text-xs text-slate-600">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/40 px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="p-3 border-t border-slate-700/50 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Ask about crops, weather, irrigation..."
          className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-900/50 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}