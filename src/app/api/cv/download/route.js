import { NextResponse } from 'next/server';
import { getLatestCv } from '@/lib/cv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_CV_PATH = '/pro/Zain_Qalandar_CV.pdf';

function safeDownloadName(fileName = 'Zain_Qalandar_CV.pdf') {
  const cleaned = fileName
    .replace(/[\r\n"]/g, '')
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .trim();

  if (!cleaned) return 'Zain_Qalandar_CV.pdf';
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

export async function GET(request) {
  const latestCv = await getLatestCv();
  if (!latestCv) return NextResponse.redirect(new URL(FALLBACK_CV_PATH, request.url));

  try {
    const fileResponse = await fetch(latestCv.url, { cache: 'no-store' });
    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.redirect(new URL(FALLBACK_CV_PATH, request.url));
    }

    return new Response(fileResponse.body, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${safeDownloadName(latestCv.fileName)}"`,
        'Content-Type': fileResponse.headers.get('content-type') || 'application/pdf',
      },
    });
  } catch (error) {
    console.error('CV download route error:', error);
    return NextResponse.redirect(new URL(FALLBACK_CV_PATH, request.url));
  }
}

