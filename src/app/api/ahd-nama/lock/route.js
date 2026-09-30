import { NextResponse } from 'next/server';
import { AHD_NAMA_UNLOCK_COOKIE } from '@/lib/ahdNamaLock';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json(
    { data: { locked: true } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.cookies.set(AHD_NAMA_UNLOCK_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

