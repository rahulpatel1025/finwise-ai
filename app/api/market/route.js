export const runtime = "nodejs";

import { getStockPrice } from "@/lib/yahooFinance";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "AAPL";

  const data = await getStockPrice(symbol);

  return Response.json(data);
}
