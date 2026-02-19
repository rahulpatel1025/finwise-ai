import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-20">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-400">
            About FINWISE
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            FINWISE is your next-generation AI-powered financial companion, designed to democratize financial literacy and provide professional-grade market insights.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-10 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <span>🎯</span> Our Mission
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">
            We believe that everyone deserves access to high-quality financial guidance. Traditional wealth management is often gated by high fees, complex jargon, and exclusivity. FINWISE bridges this gap by combining advanced artificial intelligence with real-time market data to make smart financial decision-making accessible, understandable, and actionable for all.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center text-white">The Power of FINWISE</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Education</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Break down complex economic terms and learn investment strategies through our conversational AI Finance Tutor.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Predictive ML</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our custom Python-based machine learning engine analyzes sentiment and technicals to provide calculated risk scores.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Live Markets</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track real-time prices, volume, and interactive historical charts integrated directly from reliable financial APIs.
              </p>
            </div>

          </div>
        </div>

        {/* Technology & CTA */}
        <div className="text-center space-y-8 pt-10 border-t border-zinc-800">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Built for the Future</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Under the hood, FINWISE utilizes state-of-the-art technologies including <strong>Google's Gemini 2.5 Flash</strong> for rapid natural language processing and modern web frameworks to deliver a seamless, native-app-like experience.
            </p>
          </div>

          <Link href="/tutor">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
              Start Learning Now
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}