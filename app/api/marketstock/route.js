import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'AAPL';
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  try {
    // Fetch both Current Details and Historical Graph Data
    const [quoteRes, seriesRes] = await Promise.all([
      fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${apiKey}`)
    ]);

    const quoteData = await quoteRes.json();
    const seriesData = await seriesRes.json();

    if (quoteData.status === 'error' || seriesData.status === 'error') {
      return NextResponse.json({ error: 'Symbol not found or API limit reached' }, { status: 400 });
    }

    const chartData = seriesData.values.reverse().map(item => ({
      date: item.datetime,
      price: parseFloat(item.close)
    }));

    return NextResponse.json({
      symbol: quoteData.symbol,
      name: quoteData.name,
      price: parseFloat(quoteData.close).toFixed(2),
      change: parseFloat(quoteData.change).toFixed(2),
      percentChange: parseFloat(quoteData.percent_change).toFixed(2),
      high52: parseFloat(quoteData.fifty_two_week.high).toFixed(2),
      low52: parseFloat(quoteData.fifty_two_week.low).toFixed(2),
      volume: parseInt(quoteData.volume).toLocaleString(),
      open: parseFloat(quoteData.open).toFixed(2),
      chartData
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}