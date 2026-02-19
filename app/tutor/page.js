'use client';

import { useState, useRef, useEffect } from 'react';

export default function FinanceTutorPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your FINWISE Finance Tutor. What financial concept can I explain for you today? (e.g., 'What is a mutual fund?' or 'Explain inflation like I'm 5')" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my database right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans flex flex-col items-center">
      <div className="max-w-3xl w-full grow flex flex-col">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-400 to-blue-500 mb-2">
            AI Finance Tutor
          </h1>
          <p className="text-gray-400">Master the markets, one question at a time.</p>
        </div>

        {/* Chat Window */}
        <div className="grow bg-gray-900/50 border border-gray-800 rounded-2xl p-4 md:p-6 mb-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
                }`}>
                  {/* We use whitespace-pre-wrap so the AI's paragraphs and bullet points render correctly */}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 text-gray-400 p-4 rounded-2xl rounded-bl-sm flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a financial question..."
            disabled={loading}
            className="grow bg-gray-900 border border-gray-700 text-white px-6 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
          />
          <button 
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </form>

      </div>
    </div>
  );
}