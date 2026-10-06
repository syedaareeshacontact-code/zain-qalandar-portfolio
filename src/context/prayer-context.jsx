'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPrayerRoutine, refreshPrayerProgress } from '@/store/features/prayerRoutine/prayerRoutineSlice';
import { DEFAULT_PRAYER_LOCATION, getLivePrayerState, getPrayerDateKey, getPrayerLocation } from '@/lib/prayerTimes';

const PrayerContext = createContext(null);
const LOCATION_KEY = 'barakah.prayer.city.v1';

export function PrayerProvider({ children }) {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((state) => state.prayerRoutine);
  const [locationId, setLocationId] = useState(DEFAULT_PRAYER_LOCATION.id);
  const [now, setNow] = useState(null);
  const [ready, setReady] = useState(false);
  const location = getPrayerLocation(locationId);
  const dateKey = now ? getPrayerDateKey(location, new Date(now)) : null;

  useEffect(() => {
    try { setLocationId(getPrayerLocation(localStorage.getItem(LOCATION_KEY)).id); } catch { /* Storage is optional. */ }
    const tick = () => setNow(Date.now());
    tick();
    setReady(true);
    const timer = window.setInterval(tick, 15_000);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', tick);
    };
  }, []);

  useEffect(() => {
    if (ready) void dispatch(fetchPrayerRoutine(locationId));
  }, [dispatch, ready, locationId, dateKey]);

  useEffect(() => {
    if (now && data?.dateKey === dateKey && data.locationId === locationId) dispatch(refreshPrayerProgress(now));
  }, [dispatch, now, data?.dateKey, data?.locationId, dateKey, locationId]);

  // If yesterday's in-flight request finishes after midnight, immediately load the new day.
  useEffect(() => {
    if (ready && status === 'succeeded' && data?.locationId === locationId && data.dateKey !== dateKey) {
      void dispatch(fetchPrayerRoutine(locationId));
    }
  }, [dispatch, ready, status, data?.locationId, data?.dateKey, locationId, dateKey]);

  useEffect(() => {
    if (!ready) return;
    const retry = () => void dispatch(fetchPrayerRoutine(locationId));
    const timer = window.setInterval(retry, 5 * 60_000);
    window.addEventListener('online', retry);
    return () => { window.clearInterval(timer); window.removeEventListener('online', retry); };
  }, [dispatch, locationId, ready]);

  const value = useMemo(() => {
    const freshData = data?.locationId === locationId && data.dateKey === dateKey ? data : null;
    return {
      data: freshData, status, error, now, location, dateKey,
      live: freshData && now ? getLivePrayerState(freshData, now) : null,
      changeLocation: (id) => {
        const selected = getPrayerLocation(id).id;
        setLocationId(selected);
        try { localStorage.setItem(LOCATION_KEY, selected); } catch { /* Keep the selection in memory. */ }
      },
      retry: () => void dispatch(fetchPrayerRoutine(locationId)),
    };
  }, [data, locationId, dateKey, status, error, now, location, dispatch]);

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

export function usePrayer() {
  const context = useContext(PrayerContext);
  if (!context) throw new Error('usePrayer must be used inside PrayerProvider.');
  return context;
}
