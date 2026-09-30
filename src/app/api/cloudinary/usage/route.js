import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toMetric(value) {
  const usage = Number(value?.usage);
  const limit = Number(value?.limit);

  return {
    usage: Number.isFinite(usage) ? usage : null,
    limit: Number.isFinite(limit) && limit > 0 ? limit : null,
  };
}

export async function GET() {
  try {
    const usage = await cloudinary.api.usage();

    return NextResponse.json({
      data: {
        plan: typeof usage.plan === 'string' ? usage.plan : null,
        storage: toMetric(usage.storage),
        credits: toMetric(usage.credits),
        bandwidth: toMetric(usage.bandwidth),
        lastUpdated: usage.last_updated || null,
      },
    });
  } catch (error) {
    console.error('Cloudinary usage route error:', error);
    return NextResponse.json(
      { message: 'Cloudinary usage could not be loaded right now.' },
      { status: 502 },
    );
  }
}
