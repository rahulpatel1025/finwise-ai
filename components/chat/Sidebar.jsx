"use client";

import Image from "next/image";
import { useChat } from "../context/ChatContext"; // Adjust path as needed

export default function Sidebar({ collapsed, setCollapsed }) {
  const { chats, currentChatId, setCurrentChatId, createNewChat } = useChat();

  return (
    <div
      className={`bg-zinc-950 border-r border-zinc-800 h-screen transition-all duration-300 flex flex-col
      ${collapsed ? "w-16 items-center" : "w-72 p-6"}`}
    >
      {/* Always visible button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 mt-2 flex justify-center"
      >
        <Image src="/menu-white.png" alt="menu" width={28} height={28} />
      </button>

      {/* Hide everything when collapsed */}
      {!collapsed && (
        <>
          <h2 className="text-xl font-semibold mb-6">Chats</h2>

          <button 
            onClick={createNewChat}
            className="bg-white text-black py-2 rounded-lg mb-6 hover:opacity-80 transition w-full"
          >
            + New Chat
          </button>

          <div className="text-sm text-gray-400 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
            {chats.map((chat) => (
              <p
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                className={`cursor-pointer truncate px-3 py-2 rounded-md transition ${
                  currentChatId === chat.id
                    ? "bg-zinc-800 text-white font-medium"
                    : "hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {chat.title}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}