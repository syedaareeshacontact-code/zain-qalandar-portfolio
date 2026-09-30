import { NextResponse } from 'next/server';
import {
  AHD_NAMA_LOCK_PASSWORD_ENV,
  AHD_NAMA_UNLOCK_COOKIE,
  AHD_NAMA_UNLOCK_TTL_SECONDS,
  createAhdNamaUnlockToken,
  verifyAhdNamaPassword,
} from '@/lib/ahdNamaLock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const storedHash = process.env[AHD_NAMA_LOCK_PASSWORD_ENV];
  if (!storedHash) {
    return NextResponse.json(
      { message: 'Ahd Nama lock is not configured yet.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let password;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json(
      { message: 'Enter your Ahd Nama password.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (typeof password !== 'string' || password.length === 0) {
    return NextResponse.json(
      { message: 'Enter your Ahd Nama password.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const isValid = await verifyAhdNamaPassword(password, storedHash);
    if (!isValid) {
      return NextResponse.json(
        { message: 'That password is not correct.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }
  } catch {
    return NextResponse.json(
      { message: 'Ahd Nama lock is not configured correctly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const response = NextResponse.json(
    { data: { unlocked: true } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.cookies.set(AHD_NAMA_UNLOCK_COOKIE, createAhdNamaUnlockToken(storedHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AHD_NAMA_UNLOCK_TTL_SECONDS,
  });
  return response;
}

