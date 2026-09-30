import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FREE_CLUSTER_LIMIT_BYTES = 512 * 1024 * 1024;

export async function GET() {
  try {
    const database = await getDatabase();
    const stats = await database.command({ dbStats: 1, scale: 1 });
    const dataBytes = Number(stats.dataSize) || 0;
    const indexBytes = Number(stats.indexSize) || 0;
    const usedBytes = dataBytes + indexBytes;

    return NextResponse.json({
      data: {
        database: stats.db || database.databaseName,
        usedBytes,
        dataBytes,
        indexBytes,
        limitBytes: FREE_CLUSTER_LIMIT_BYTES,
        remainingBytes: Math.max(FREE_CLUSTER_LIMIT_BYTES - usedBytes, 0),
      },
    });
  } catch (error) {
    console.error('MongoDB usage route error:', error);
    return NextResponse.json(
      { message: 'MongoDB usage could not be loaded right now.' },
      { status: 502 },
    );
  }
}
