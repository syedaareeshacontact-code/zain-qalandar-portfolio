import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-ahd-nama-password.mjs "your-password"');
  process.exitCode = 1;
} else {
  const cost = 16_384;
  const blockSize = 8;
  const parallelization = 1;
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem: 32 * 1024 * 1024,
  });

  const hash = `scrypt$${cost}$${blockSize}$${parallelization}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
  console.log(
    `AHD_NAMA_LOCK_PASSWORD_HASH=${hash.replaceAll('$', '\\$')}`,
  );
}
