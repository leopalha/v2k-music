import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/permissions';
import {
  calculateFunnel,
  getFunnelDropoff,
  getTimeToConversion,
} from '@/lib/analytics/funnels';
import { get as getCache, set as setCache } from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Cache key com dates
    const cacheKey = `analytics:funnel:${startDateParam || 'all'}:${endDateParam || 'all'}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Calculate funnel
    const funnel = await calculateFunnel(startDate, endDate);
    const dropoffs = await getFunnelDropoff(startDate, endDate);
    const timeToConversion = await getTimeToConversion();

    const response = {
      funnel,
      dropoffs,
      timeToConversion,
      period: {
        startDate: startDateParam || null,
        endDate: endDateParam || null,
      },
    };

    // Cache for 15 minutes
    await setCache(cacheKey, response, { ttl: 900 });

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[Funnel API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
