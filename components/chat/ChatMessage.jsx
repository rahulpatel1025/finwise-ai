export default function ChatMessage({ role, text }) {
  const isUser = role === "user";

  return (
    // Added mb-6 to give breathing room between multiple messages
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* Wrapper to control max-width and layout avatars */}
      <div className={`flex max-w-[85%] md:max-w-3xl gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* AI Avatar Icon (Only shows for the AI) */}
        {!isUser && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center border border-blue-400 mt-1 shadow-md cursor-default">
            <span className="text-[10px] font-bold text-white tracking-wider">AI</span>
          </div>
        )}

        {/* Chat Bubble */}
        <div
          className={`px-5 py-3.5 text-sm md:text-base leading-relaxed rounded-2xl shadow-sm
            ${
              isUser
                ? "bg-white text-black rounded-tr-sm" // Sharp top-right corner for user
                : "bg-zinc-800 border border-zinc-700 text-gray-100 rounded-tl-sm" // Sharp top-left for AI
            }`}
        >
          {/* FIX: Changed <p> to <div> to prevent nested paragraph HTML hydration errors */}
          <div className="whitespace-pre-wrap wrap-break-word">{text}</div>
        </div>
        
      </div>
    </div>
  );
}