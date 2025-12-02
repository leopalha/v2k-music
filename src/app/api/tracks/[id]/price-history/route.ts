import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "1d";

    // TODO: Get real historical data from database
    // For now, generate mock OHLCV data

    const now = Date.now();
    const intervals: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "4h": 4 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
      "1w": 7 * 24 * 60 * 60 * 1000,
    };

    const interval = intervals[timeframe] || intervals["1d"];
    const dataPoints = timeframe === "1h" ? 168 : timeframe === "4h" ? 90 : 90; // 7 days of data

    // Generate realistic price data with trends and volatility
    const basePrice = 0.01 + Math.random() * 0.09; // Between 0.01 and 0.10
    const data = [];

    let previousClose = basePrice;

    for (let i = 0; i < dataPoints; i++) {
      const time = new Date(now - (dataPoints - i) * interval)
        .toISOString()
        .split("T")[0];

      // Add trend and random volatility
      const trend = Math.sin(i / 10) * 0.0005; // Sine wave trend
      const volatility = (Math.random() - 0.5) * 0.002; // ±0.001 random change
      const change = trend + volatility;

      const open = previousClose;
      const close = Math.max(0.001, open + change);
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      const volume = Math.floor(1000 + Math.random() * 9000); // 1k-10k tokens

      data.push({
        time,
        open: Number(open.toFixed(6)),
        high: Number(high.toFixed(6)),
        low: Number(Math.max(0.001, low).toFixed(6)),
        close: Number(close.toFixed(6)),
        volume,
      });

      previousClose = close;
    }

    return NextResponse.json({
      trackId: id,
      timeframe,
      data,
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de preços" },
      { status: 500 }
    );
  }
}
