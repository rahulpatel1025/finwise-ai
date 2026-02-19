"use client";

import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  // Changed to handle form submission so the "Enter" key works automatically
  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    // Removed "fixed left-0" so it perfectly fits inside your chat column without overlapping the sidebar
    <div className="w-full p-4 border-t border-zinc-800 bg-black">
      <form 
        onSubmit={handleSubmit} 
        className="relative max-w-4xl mx-auto flex items-center"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about a stock or market trend..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pr-28 transition-all"
        />

        {/* The button now sits perfectly floating inside the input box */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          Send
        </button>
      </form>
    </div>
  );
}