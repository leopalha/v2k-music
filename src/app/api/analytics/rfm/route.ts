import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/permissions';
import {
  getRFMDistribution,
  segmentUsers,
  getSegmentRecommendations,
  type RFMSegment,
} from '@/lib/analytics/rfm';
import { get as getCache, set as setCache } from '@/lib/cache/redis';

export async function GET() {
  try {
    await requireAdmin();

    // Try cache first (10min TTL)
    const cacheKey = 'analytics:rfm:distribution';
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Calculate RFM distribution
    const distribution = await getRFMDistribution();

    // Get all segments with users
    const segments = await segmentUsers();

    // Add recommendations to each segment
    const segmentsWithRecommendations = distribution.map((dist) => {
      const recommendations = getSegmentRecommendations(dist.segment as RFMSegment);
      return {
        ...dist,
        recommendations,
      };
    });

    const response = {
      distribution: segmentsWithRecommendations,
      totalUsers: segments.length,
      summary: {
        champions: distribution.find((d) => d.segment === 'Champions')?.count || 0,
        loyal: distribution.find((d) => d.segment === 'Loyal')?.count || 0,
        potential: distribution.find((d) => d.segment === 'Potential')?.count || 0,
        atRisk: distribution.find((d) => d.segment === 'At Risk')?.count || 0,
        dormant: distribution.find((d) => d.segment === 'Dormant')?.count || 0,
      },
    };

    // Cache for 10 minutes
    await setCache(cacheKey, response, { ttl: 600 });

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[RFM API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
