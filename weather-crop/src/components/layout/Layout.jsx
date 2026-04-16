import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatbotModal from "../assistant/ChatbotModal";

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-slate-100 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onChatOpen={() => setChatOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
          <Outlet />
        </main>
      </div>

      <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}