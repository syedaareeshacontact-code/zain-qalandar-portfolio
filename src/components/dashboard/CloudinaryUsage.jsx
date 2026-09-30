'use client';

import { useCallback, useEffect } from 'react';
import { Database, HardDrive, LoaderCircle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNotification } from '@/context/notification-context';
import { fetchCloudinaryUsage } from '@/store/features/cloudinaryUsage/cloudinaryUsageSlice';

const MEBIBYTE = 1024 * 1024;
const GIBIBYTE = 1024 * MEBIBYTE;

export function formatStorage(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < GIBIBYTE) return `${Math.max(0.1, bytes / MEBIBYTE).toFixed(bytes < 10 * MEBIBYTE ? 1 : 0)} MB`;
  return `${(bytes / GIBIBYTE).toFixed(bytes < 10 * GIBIBYTE ? 1 : 0)} GB`;
}

function formatCredits(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  const formatted = value < 100 ? value.toFixed(1) : value.toFixed(0);
  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
}

function percentage(usage, limit) {
  if (!Number.isFinite(usage) || !Number.isFinite(limit) || limit <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((usage / limit) * 100)));
}

function formatUpdated(value) {
  if (!value) return 'Live usage from Cloudinary';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Live usage from Cloudinary';

  return `Updated ${new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(date)}`;
}

export function useCloudinaryUsage() {
  const dispatch = useAppDispatch();
  const { data: usage, status, error } = useAppSelector((state) => state.cloudinaryUsage);
  const refresh = useCallback(() => dispatch(fetchCloudinaryUsage()), [dispatch]);

  useEffect(() => {
    if (status === 'idle') void refresh();
  }, [refresh, status]);

  return { usage, isLoading: status === 'idle' || status === 'loading', error, refresh };
}

export function CloudinaryUsageCard() {
  const { usage, isLoading, error, refresh } = useCloudinaryUsage();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const storage = usage?.storage;
  const credits = usage?.credits;
  const storageUsed = storage?.usage;
  const storageTotal = storage?.limit;
  const creditUsed = credits?.usage;
  const creditLimit = credits?.limit;
  const storageRemaining = Number.isFinite(storageUsed) && Number.isFinite(storageTotal) ? Math.max(storageTotal - storageUsed, 0) : null;
  const storagePercent = percentage(storageUsed, storageTotal);
  const creditPercent = percentage(creditUsed, creditLimit);
  const creditRemaining = Number.isFinite(creditUsed) && Number.isFinite(creditLimit) ? Math.max(creditLimit - creditUsed, 0) : null;
  const hasStorageLimit = Number.isFinite(storageTotal);

  const handleRefresh = async () => {
    try {
      await refresh().unwrap();
      notifySuccess('Cloudinary usage refreshed.');
    } catch (refreshError) {
      notifyError(refreshError instanceof Error ? refreshError.message : 'Cloudinary usage could not be refreshed.');
    }
  };

  return (
    <section className="bk-ahd-usage" aria-labelledby="cloudinary-usage-title">
      <div className="bk-ahd-usage-head">
        <div>
          <p className="bk-ahd-kicker">Live account data</p>
          <h2 id="cloudinary-usage-title"><HardDrive size={19} /> Cloudinary space</h2>
        </div>
        <button type="button" onClick={() => void handleRefresh()} disabled={isLoading}>
          <RefreshCw size={15} className={isLoading ? 'bk-spin' : ''} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="bk-ahd-usage-status"><LoaderCircle size={16} className="bk-spin" /> Fetching usage directly from Cloudinary…</p>
      ) : error || !Number.isFinite(creditLimit) ? (
        <p className="bk-ahd-usage-status is-error">{error || 'Cloudinary did not return your plan quota.'}</p>
      ) : (
        <>
          <div className="bk-ahd-usage-grid">
            <div><span>Files stored</span><strong>{formatStorage(storageUsed)}{hasStorageLimit && <small> of {formatStorage(storageTotal)}</small>}</strong></div>
            <div><span>{hasStorageLimit ? 'Storage remaining' : 'Free credits left'}</span><strong>{hasStorageLimit ? formatStorage(storageRemaining) : formatCredits(creditRemaining)}{!hasStorageLimit && <small> of {formatCredits(creditLimit)}</small>}</strong></div>
            <div><span>Plan usage</span><strong>{creditPercent}% <small>{formatCredits(creditUsed)} / {formatCredits(creditLimit)} credits</small></strong></div>
          </div>
          <div className="bk-ahd-usage-progress" role="progressbar" aria-label={hasStorageLimit ? 'Cloudinary storage used' : 'Cloudinary plan credits used'} aria-valuemin={0} aria-valuemax={hasStorageLimit ? storageTotal : creditLimit} aria-valuenow={hasStorageLimit ? storageUsed : creditUsed}><i style={{ width: `${hasStorageLimit ? storagePercent : creditPercent}%` }} /></div>
          <p className="bk-ahd-usage-note"><Database size={14} /> {formatUpdated(usage.lastUpdated)}. Free-plan credits are shared by storage, bandwidth, and transformations.</p>
        </>
      )}
    </section>
  );
}
