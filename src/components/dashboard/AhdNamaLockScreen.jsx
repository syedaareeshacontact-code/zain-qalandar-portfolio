'use client';

import { useState } from 'react';
import { Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/notification-context';

export default function AhdNamaLockScreen() {
  const router = useRouter();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isUnlocking) return;

    if (!password) {
      const message = 'Enter your Ahd Nama password.';
      setError(message);
      notifyError(message);
      return;
    }

    setError('');
    setIsUnlocking(true);
    try {
      const response = await fetch('/api/ahd-nama/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Ahd Nama could not be unlocked.');

      setPassword('');
      notifySuccess('Ahd Nama unlocked. Your private archive is ready.');
      router.refresh();
    } catch (unlockError) {
      const message = unlockError instanceof Error ? unlockError.message : 'Ahd Nama could not be unlocked.';
      setError(message);
      notifyError(message);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="bk-ahd-lock-screen">
      <div className="bk-ahd-lock-orbit bk-ahd-lock-orbit-one" aria-hidden="true" />
      <div className="bk-ahd-lock-orbit bk-ahd-lock-orbit-two" aria-hidden="true" />
      <div className="bk-ahd-lock-card">
        <div className="bk-ahd-lock-emblem" aria-hidden="true">
          <LockKeyhole size={24} strokeWidth={1.8} />
        </div>
        <span className="bk-ahd-lock-kicker"><ShieldCheck size={14} /> Private archive</span>
        <h2>Keep this promise private.</h2>
        <p className="bk-ahd-lock-copy">
          Ahd Nama is locked. Enter your password to open your personal covenant and reflection archive.
        </p>
        <form className="bk-ahd-lock-form" onSubmit={handleSubmit}>
          <label htmlFor="ahd-nama-password">Ahd Nama password</label>
          <div className="bk-ahd-password-field">
            <KeyRound size={17} aria-hidden="true" />
            <input
              id="ahd-nama-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
              disabled={isUnlocking}
              autoFocus
            />
            <button
              type="button"
              className="bk-ahd-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              disabled={isUnlocking}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {error ? <p className="bk-ahd-lock-error" role="alert">{error}</p> : null}
          <button type="submit" className="bk-ahd-unlock-button" disabled={isUnlocking}>
            {isUnlocking ? <LoaderCircle className="bk-spin" size={17} /> : <LockKeyhole size={17} />}
            {isUnlocking ? 'Checking…' : 'Unlock Ahd Nama'}
          </button>
        </form>
        <p className="bk-ahd-lock-footnote">This private session locks again automatically after 12 hours.</p>
      </div>
    </div>
  );
}

