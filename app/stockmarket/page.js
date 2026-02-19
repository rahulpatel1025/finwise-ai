'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function StockMarketPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('AAPL');

  const fetchData = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      // UPDATED PATH: Pointing exactly to your new api folder
      const res = await fetch(`/api/marketstock?symbol=${symbol}`);
      const result = await res.json();
      
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('AAPL');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) fetchData(search.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-400">
              Market Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time trends & insights</p>
          </div>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Symbol (e.g., TSLA, INFY)..."
              className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {loading && <div className="text-center py-20 text-gray-500 animate-pulse">Loading market data...</div>}
        {error && <div className="text-center py-20 text-red-400 bg-red-900/10 rounded-xl border border-red-900">{error}</div>}

        {!loading && !error && data && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Current Price" value={`$${data.price}`} subValue={`${data.percentChange}%`} isPositive={parseFloat(data.percentChange) >= 0} />
              <StatCard label="Volume" value={data.volume} subValue="Shares Traded" />
              <StatCard label="52W High" value={`$${data.high52}`} subValue="Yearly Peak" />
              <StatCard label="52W Low" value={`$${data.low52}`} subValue="Yearly Bottom" />
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 h-125">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-200">{data.name} ({data.symbol})</h3>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">30 Day Trend</span>
              </div>
              
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280" 
                    tickFormatter={(str) => str.substring(5)}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    domain={['auto', 'auto']}
                    tickFormatter={(number) => `$${number}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#60A5FA' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, isPositive }) {
  let colorClass = "text-gray-400";
  if (isPositive === true) colorClass = "text-green-400";
  if (isPositive === false) colorClass = "text-red-400";

  return (
    <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className={`text-xs mt-1 ${colorClass}`}>{subValue}</p>
    </div>
  );
}