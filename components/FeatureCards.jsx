import Link from "next/link";

export default function FeatureCards() {
  return (
    <section className="grid md:grid-cols-3 gap-12 px-10 pb-28">

      {/* CARD */}
       <Link href="/tutor">
        <div className="group relative p-10 rounded-2xl cursor-pointer transition-all duration-500
                        bg-zinc-900 border border-zinc-800
                        hover:-translate-y-2 hover:border-blue-400
                        hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]">

          {/* glow layer */}
          <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-0 
                          group-hover:opacity-10 blur-2xl transition duration-500"></div>

          <h3 className="text-2xl font-semibold mb-4 text-white z-10 relative">
            AI Finance Tutor
          </h3>

          <p className="text-gray-400 z-10 relative">
            Confused by financial jargon? Ask our AI to explain investment concepts, market trends, and economic terms simply and clearly.
          </p>
        </div>
      </Link>

      {/* CARD */}
      <Link href="/stock">
        <div className="group relative p-10 rounded-2xl cursor-pointer transition-all duration-500
                        bg-zinc-900 border border-zinc-800
                        hover:-translate-y-2 hover:border-emerald-400
                        hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]">

          <div className="absolute inset-0 rounded-2xl bg-emerald-500 opacity-0 
                          group-hover:opacity-10 blur-2xl transition duration-500"></div>

          <h3 className="text-2xl font-semibold mb-4 text-white z-10 relative">
            Stock Market Advice
          </h3>

          <p className="text-gray-400 z-10 relative">
            Get real-time stock advice using live market data and AI reasoning.
          </p>
        </div>
      </Link>

      {/* CARD */}
      <Link href="/stockmarket">
        <div className="group relative p-10 rounded-2xl cursor-pointer transition-all duration-500
                        bg-zinc-900 border border-zinc-800
                        hover:-translate-y-2 hover:border-purple-400
                        hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">

          <div className="absolute inset-0 rounded-2xl bg-purple-500 opacity-0 
                          group-hover:opacity-10 blur-2xl transition duration-500"></div>

          <h3 className="text-2xl font-semibold mb-4 text-white z-10 relative">
            Live Stock Market
          </h3>

          <p className="text-gray-400 z-10 relative">
            View real-time stock prices, interactive charts, and trends across
            multiple companies.
          </p>
        </div>
      </Link>

    </section>
  );
}
