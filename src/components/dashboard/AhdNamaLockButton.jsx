'use client';

import { useState } from 'react';
import { LockKeyhole, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/notification-context';

export default function AhdNamaLockButton() {
  const router = useRouter();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [isLocking, setIsLocking] = useState(false);

  const lockArchive = async () => {
    if (isLocking) return;
    setIsLocking(true);

    try {
      const response = await fetch('/api/ahd-nama/lock', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Ahd Nama could not be locked.');

      notifySuccess('Ahd Nama locked. Your private archive is protected.');
      router.refresh();
    } catch (lockError) {
      notifyError(lockError instanceof Error ? lockError.message : 'Ahd Nama could not be locked.');
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <button type="button" className="bk-ahd-lock-button" onClick={lockArchive} disabled={isLocking}>
      {isLocking ? <LoaderCircle className="bk-spin" size={15} /> : <LockKeyhole size={15} />}
      {isLocking ? 'Locking…' : 'Lock archive'}
    </button>
  );
}

