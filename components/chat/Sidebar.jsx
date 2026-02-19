"use client";

import Image from "next/image";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <div
      className={`bg-zinc-950 border-r border-zinc-800 h-screen transition-all duration-300 flex flex-col
      ${collapsed ? "w-16 items-center" : "w-72 p-6"}`}
    >
      {/* Always visible button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 mt-2"
      >
        <Image
          src="/menu-white.png"
          alt="menu"
          width={28}
          height={28}
        />
      </button>

      {/* Hide everything when collapsed */}
      {!collapsed && (
        <>
          <h2 className="text-xl font-semibold mb-6">Chats</h2>

          <button className="bg-white text-black py-2 rounded-lg mb-6 hover:opacity-80 transition">
            + New Chat
          </button>

          <div className="text-sm text-gray-400 space-y-3">
            <p className="hover:text-white cursor-pointer">Previous Chat 1</p>
            <p className="hover:text-white cursor-pointer">Previous Chat 2</p>
          </div>
        </>
      )}
    </div>
  );
}
