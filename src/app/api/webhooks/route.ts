import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { generateWebhookSecret } from '@/lib/webhooks/manager';

// GET /api/webhooks - List user webhooks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
    });

    return NextResponse.json({ webhooks });
  } catch (error: any) {
    console.error('[WEBHOOKS] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/webhooks - Create webhook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, events, description } = body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: url, events' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Validate events
    const validEvents = [
      'trade.completed',
      'trade.failed',
      'alert.triggered',
      'royalty.claimed',
      'portfolio.updated',
      'user.kyc.approved',
      'user.kyc.rejected',
    ];

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    // Check webhook limit (max 10 per user)
    const count = await prisma.webhook.count({
      where: { userId: session.user.id },
    });

    if (count >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 webhooks per user' },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = generateWebhookSecret();

    // Create webhook
    const webhook = await prisma.webhook.create({
      data: {
        userId: session.user.id,
        url,
        secret,
        events,
        description,
      },
    });

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error: any) {
    console.error('[WEBHOOKS] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
