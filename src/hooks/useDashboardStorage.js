'use client';

import { useCallback, useEffect, useState } from 'react';
import { DASHBOARD_STORAGE_KEY, defaultDashboard, restoreDashboard } from '@/lib/dashboard';

export default function useDashboardStorage() {
  const [workspace, setWorkspace] = useState(defaultDashboard);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try { setWorkspace(restoreDashboard(JSON.parse(localStorage.getItem(DASHBOARD_STORAGE_KEY) || 'null'))); }
    catch { setStorageError(true); }
    setReady(true);
    const sync = (event) => {
      if (event.key !== DASHBOARD_STORAGE_KEY) return;
      try { setWorkspace(restoreDashboard(JSON.parse(event.newValue || 'null'))); }
      catch { /* Keep the current workspace if another tab writes invalid data. */ }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(workspace)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [workspace, ready]);

  const updateWorkspace = useCallback((updater) => setWorkspace((current) => restoreDashboard(updater(current))), []);
  return { workspace, updateWorkspace, ready, storageError };
}
