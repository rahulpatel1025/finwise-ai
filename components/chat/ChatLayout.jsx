"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function ChatLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-black text-white font-sans">
      
      {/* Sidebar Component */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Chat Area Container */}
      <div className="flex-1 flex flex-col h-full relative bg-[#09090b] border-l border-zinc-800/60 transition-all duration-300">
        
        {children}
        
      </div>
    </div>
  );
}