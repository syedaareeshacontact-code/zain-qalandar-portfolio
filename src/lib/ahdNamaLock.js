import { cookies } from 'next/headers';
import { createHash, createHmac, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export const AHD_NAMA_LOCK_PASSWORD_ENV = 'AHD_NAMA_LOCK_PASSWORD_HASH';
export const AHD_NAMA_UNLOCK_COOKIE = 'ahd_nama_unlocked';
export const AHD_NAMA_UNLOCK_TTL_SECONDS = 12 * 60 * 60;

const AHD_NAMA_UNLOCK_TTL_MS = AHD_NAMA_UNLOCK_TTL_SECONDS * 1000;
const SCRYPT_KEY_LENGTH = 64;

function parsePasswordHash(storedHash) {
  if (typeof storedHash !== 'string') throw new Error('Ahd Nama password hash is missing.');

  const [algorithm, nValue, rValue, pValue, saltValue, hashValue] = storedHash.split('$');
  const n = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    algorithm !== 'scrypt'
    || !Number.isInteger(n) || n < 1024 || n > 1_048_576 || (n & (n - 1)) !== 0
    || !Number.isInteger(r) || r < 1 || r > 32
    || !Number.isInteger(p) || p < 1 || p > 16
    || !saltValue || !hashValue
  ) {
    throw new Error('Ahd Nama password hash has an invalid format.');
  }

  const salt = Buffer.from(saltValue, 'base64');
  const expectedHash = Buffer.from(hashValue, 'base64');
  if (salt.length < 16 || expectedHash.length !== SCRYPT_KEY_LENGTH) {
    throw new Error('Ahd Nama password hash has invalid key material.');
  }

  return { n, r, p, salt, expectedHash };
}

function getSigningKey(storedHash) {
  return createHash('sha256').update(storedHash).digest();
}

export async function verifyAhdNamaPassword(password, storedHash = process.env[AHD_NAMA_LOCK_PASSWORD_ENV]) {
  if (typeof password !== 'string' || !storedHash) return false;

  const { n, r, p, salt, expectedHash } = parsePasswordHash(storedHash);
  const derivedHash = await scryptAsync(password, salt, SCRYPT_KEY_LENGTH, {
    N: n,
    r,
    p,
    maxmem: Math.max(32 * 1024 * 1024, 128 * n * r * 2),
  });
  const candidateHash = Buffer.from(derivedHash);

  return candidateHash.length === expectedHash.length && timingSafeEqual(candidateHash, expectedHash);
}

export function createAhdNamaUnlockToken(storedHash = process.env[AHD_NAMA_LOCK_PASSWORD_ENV]) {
  if (!storedHash) throw new Error('Ahd Nama password hash is missing.');

  const expiresAt = Date.now() + AHD_NAMA_UNLOCK_TTL_MS;
  const payload = String(expiresAt);
  const signature = createHmac('sha256', getSigningKey(storedHash)).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAhdNamaUnlockToken(token, storedHash = process.env[AHD_NAMA_LOCK_PASSWORD_ENV]) {
  if (!token || !storedHash) return false;

  const [expiresAtValue, signature] = token.split('.');
  const expiresAt = Number(expiresAtValue);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) return false;

  const expectedSignature = createHmac('sha256', getSigningKey(storedHash))
    .update(expiresAtValue)
    .digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function isAhdNamaUnlocked() {
  const storedHash = process.env[AHD_NAMA_LOCK_PASSWORD_ENV];
  if (!storedHash) return false;

  const cookieStore = await cookies();
  return verifyAhdNamaUnlockToken(cookieStore.get(AHD_NAMA_UNLOCK_COOKIE)?.value, storedHash);
}

