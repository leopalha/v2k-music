/**
 * Tax Reports API
 * GET /api/reports/tax-summary - Get tax summary for a period
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { calculateTaxSummary } from '@/lib/tax/calculations';

/**
 * GET /api/reports/tax-summary
 * Get tax summary for a specific period
 * 
 * Query params:
 * - year: Tax year (default: current year)
 * - startDate: Custom start date (ISO format)
 * - endDate: Custom end date (ISO format)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse date range
    let startDate: Date;
    let endDate: Date;

    const yearParam = searchParams.get('year');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (startDateParam && endDateParam) {
      // Custom date range
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Year-based (default to current year)
      const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
      startDate = new Date(year, 0, 1); // January 1st
      endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st
    }

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Fetch all completed transactions in the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        type: {
          in: ['BUY', 'SELL'],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate tax summary
    const taxSummary = calculateTaxSummary(
      transactions as any,
      startDate,
      endDate
    );

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: taxSummary.period.start.toISOString(),
          end: taxSummary.period.end.toISOString(),
          year: startDate.getFullYear(),
        },
        summary: {
          totalBuys: taxSummary.totalBuys,
          totalSells: taxSummary.totalSells,
          totalInvested: taxSummary.totalInvested,
          totalReceived: taxSummary.totalReceived,
          realizedGains: taxSummary.realizedGains,
          realizedLosses: taxSummary.realizedLosses,
          netGainLoss: taxSummary.netGainLoss,
          estimatedTax: taxSummary.estimatedTax,
          taxRate: taxSummary.taxRate,
        },
        transactions: taxSummary.transactions.map(tx => ({
          ...tx,
          date: tx.date.toISOString(),
        })),
        byTrack: taxSummary.byTrack,
      },
    });
  } catch (error) {
    console.error('[TAX_SUMMARY_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
