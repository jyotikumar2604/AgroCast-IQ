import { useState } from "react";
import { Send, Bot, User, Leaf } from "lucide-react";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! 🌱 I am your Agro AI Assistant. Ask me about weather, irrigation, or crop health.",
    },
  ]);
  const [input, setInput] = useState("");

  // Dummy intelligent response logic
  const getResponse = (msg) => {
    const text = msg.toLowerCase();

    if (text.includes("irrigation")) {
      return "💧 Based on current weather, irrigation is recommended early morning (5–7 AM).";
    }
    if (text.includes("weather")) {
      return "🌤️ Weather looks moderate today. No extreme alerts. Good day for field work.";
    }
    if (text.includes("crop")) {
      return "🌾 Crop health seems stable. Monitor nitrogen levels and pest activity regularly.";
    }
    if (text.includes("rain")) {
      return "🌧️ Rain is expected in the next 48 hours. Avoid irrigation.";
    }

    return "🤖 I’m still learning! Try asking about irrigation, weather, or crops.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    const botMsg = { role: "bot", text: getResponse(input) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col p-6 text-white">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Leaf className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Agro AI Assistant</h1>
          <p className="text-xs text-slate-400">
            Smart farming advice powered by weather + crop data
          </p>
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "bot" && (
              <Bot className="w-5 h-5 text-emerald-400 mt-1" />
            )}

            <div
              className={`px-4 py-2 rounded-xl max-w-[70%] text-sm ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {msg.text}
            </div>

            {msg.role === "user" && (
              <User className="w-5 h-5 text-slate-400 mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask about weather, irrigation, crops..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={handleSend}
          className="bg-emerald-500 hover:bg-emerald-600 p-2 rounded-xl transition"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}