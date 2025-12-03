import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "1d";

    // Calculate time range based on timeframe
    const now = new Date();
    const intervals: Record<string, { hours: number; points: number }> = {
      "1h": { hours: 24, points: 24 },      // Last 24 hours, hourly
      "4h": { hours: 24 * 7, points: 42 },  // Last 7 days, 4h intervals
      "1d": { hours: 24 * 90, points: 90 }, // Last 90 days, daily
      "1w": { hours: 24 * 365, points: 52 },// Last year, weekly
    };

    const config = intervals[timeframe] || intervals["1d"];
    const startDate = new Date(now.getTime() - config.hours * 60 * 60 * 1000);

    // Get real price history from database

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        trackId: id,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: config.points,
    });

    let data;

    // If we have real data, use it
    if (priceHistory.length > 0) {
      // Group by time period for OHLCV
      const grouped = groupPriceData(priceHistory, timeframe);
      data = grouped;
    } else {
      // Fallback: Generate realistic mock data if no history exists
      data = generateMockPriceData(config.points, timeframe);
    }

    return NextResponse.json({
      trackId: id,
      timeframe,
      data,
      source: priceHistory.length > 0 ? 'database' : 'mock',
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de preços" },
      { status: 500 }
    );
  }
}

// Group price data into OHLCV format
function groupPriceData(
  history: Array<{ price: number; volume: number; timestamp: Date }>,
  timeframe: string
) {
  if (history.length === 0) return [];

  // For simplicity, treat each record as a candle (open=close=price)
  return history.map(record => ({
    time: record.timestamp.toISOString().split('T')[0],
    open: Number(record.price.toFixed(6)),
    high: Number(record.price.toFixed(6)),
    low: Number(record.price.toFixed(6)),
    close: Number(record.price.toFixed(6)),
    volume: Math.floor(record.volume),
  }));
}

// Generate mock price data (fallback)
function generateMockPriceData(points: number, timeframe: string) {
  const now = Date.now();
  const intervals: Record<string, number> = {
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
  };

  const interval = intervals[timeframe] || intervals["1d"];
  const basePrice = 0.01 + Math.random() * 0.09;
  const data = [];
  let previousClose = basePrice;

  for (let i = 0; i < points; i++) {
    const time = new Date(now - (points - i) * interval)
      .toISOString()
      .split("T")[0];

    const trend = Math.sin(i / 10) * 0.0005;
    const volatility = (Math.random() - 0.5) * 0.002;
    const change = trend + volatility;

    const open = previousClose;
    const close = Math.max(0.001, open + change);
    const high = Math.max(open, close) + Math.random() * 0.001;
    const low = Math.min(open, close) - Math.random() * 0.001;
    const volume = Math.floor(1000 + Math.random() * 9000);

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

  return data;
}
