'use client';

import { useCallback, useEffect } from 'react';
import { Database, LoaderCircle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMongoDBUsage } from '@/store/features/mongodbUsage/mongodbUsageSlice';

const MEBIBYTE = 1024 * 1024;

function formatStorage(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < MEBIBYTE) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / MEBIBYTE).toFixed(bytes < 10 * MEBIBYTE ? 1 : 0)} MB`;
}

function getPercentage(used, limit) {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}

export default function MongoDBUsageSidebar() {
  const dispatch = useAppDispatch();
  const { data: usage, status, error } = useAppSelector((state) => state.mongodbUsage);
  const isLoading = status === 'idle' || status === 'loading';
  const refresh = useCallback(() => dispatch(fetchMongoDBUsage()), [dispatch]);

  useEffect(() => {
    if (status === 'idle') void refresh();
  }, [refresh, status]);

  const usedPercent = getPercentage(usage?.usedBytes, usage?.limitBytes);

  return (
    <section className="bk-mongodb-sidebar-card" aria-label="MongoDB database usage">
      <div className="bk-mongodb-sidebar-head">
        <span><Database size={14} /> MongoDB space</span>
        <button type="button" onClick={() => void refresh()} disabled={isLoading} aria-label="Refresh MongoDB usage" title="Refresh MongoDB usage">
          <RefreshCw size={13} className={isLoading ? 'bk-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <p className="bk-mongodb-sidebar-status"><LoaderCircle size={12} className="bk-spin" /> Loading…</p>
      ) : error || !usage ? (
        <p className="bk-mongodb-sidebar-status is-error">{error || 'Usage unavailable.'}</p>
      ) : (
        <>
          <div className="bk-mongodb-sidebar-numbers"><strong>{formatStorage(usage.usedBytes)}</strong><span>of {formatStorage(usage.limitBytes)}</span></div>
          <div className="bk-mongodb-progress" role="progressbar" aria-label="MongoDB database usage" aria-valuemin={0} aria-valuemax={usage.limitBytes} aria-valuenow={usage.usedBytes}><i style={{ width: `${usedPercent}%` }} /></div>
          <p className="bk-mongodb-sidebar-remaining">{formatStorage(usage.remainingBytes)} free <span>{usedPercent}% used</span></p>
        </>
      )}
    </section>
  );
}
