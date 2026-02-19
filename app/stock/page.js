"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage"; // 🔥 Imported your new component

export default function StockPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🚀 Smart symbol extractor (stocks + indices)
  const extractSymbol = (text) => {
    const upper = text.toUpperCase();

    if (upper.includes("NIFTY 50") || upper.includes("NIFTY")) return "^NSEI";
    if (upper.includes("SENSEX")) return "^BSESN";
    if (upper.includes("DOW JONES")) return "^DJI";
    if (upper.includes("NASDAQ")) return "^IXIC";

    const indexMatch = upper.match(/\^[A-Z]{1,6}/);
    if (indexMatch) return indexMatch[0];

    const blacklist = [
      "I", "IN", "ON", "AT", "IS", "AM", "ARE", "THE",
      "BUY", "SELL", "INVEST", "STOCK", "SHOULD",
      "WHAT", "HOW", "WHY", "WILL", "WOULD", "CAN",
      "GOOD", "NOW", "NIFTY"
    ];

    const tokens = upper.match(/\b[A-Z]{2,5}\b/g);
    if (!tokens) return null;

    const filtered = tokens.filter((t) => !blacklist.includes(t));
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const symbol = extractSymbol(text);

      if (!symbol) {
        throw new Error("No valid stock symbol found.");
      }

      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.explanation },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Unable to generate analysis. Please enter a valid stock symbol like AAPL, TSLA, MSFT.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <ChatLayout>
      {/* Removed pb-32 so there is no massive gap at the bottom. 
        Changed bg-black to transparent so it inherits the sleek dark gray from ChatLayout 
      */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent scroll-smooth">

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 mt-10 md:mt-20">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl">📈</span>
            </div>
            <p>Ask something like:</p>
            <button 
              onClick={() => handleSend("Should I invest in AAPL?")}
              className="mt-4 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl transition shadow-md"
            >
              “Should I invest in AAPL?”
            </button>
          </div>
        )}

        {/* Mapped Messages using your ChatMessage Component */}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            text={
              msg.role === "bot" ? (
                <div className="prose prose-invert prose-blue max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ ...props }) => <h1 className="text-xl font-bold mb-3 text-white" {...props} />,
                      h2: ({ ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-white" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-base font-medium mt-3 mb-2 text-gray-200" {...props} />,
                      li: ({ ...props }) => <li className="mb-1 text-gray-300" {...props} />,
                      p: ({ ...props }) => <p className="mb-3 leading-relaxed text-gray-300" {...props} />,
                      strong: ({ ...props }) => <strong className="text-white font-semibold" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.text
              )
            }
          />
        ))}

        {/* Native-looking Loading State */}
        {loading && (
          <ChatMessage
            role="bot"
            text={
              <div className="flex items-center space-x-3 text-blue-400 font-medium animate-pulse py-1">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                <span>Analyzing technical indicators & sentiment...</span>
              </div>
            }
          />
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      <ChatInput onSend={handleSend} />
    </ChatLayout>
  );
}