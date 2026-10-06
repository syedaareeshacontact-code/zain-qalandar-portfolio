import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DEFAULT_PRAYER_LOCATION, getActivePrayerBlockIndex, getHeroBlockIndex, getPrayerIntervalProgress, isOvernightReview } from '@/lib/prayerTimes';

export const fetchPrayerRoutine = createAsyncThunk('prayerRoutine/fetch', async (locationId = DEFAULT_PRAYER_LOCATION.id, { signal }) => {
  const response = await fetch(`/api/prayer-times?city=${encodeURIComponent(locationId)}`, { cache: 'no-store', signal });
  const payload = await response.json();
  if (!response.ok || !payload.data) throw new Error(payload.message || 'Prayer times could not be loaded.');
  return payload.data;
}, {
  condition: (locationId = DEFAULT_PRAYER_LOCATION.id, { getState }) => {
    const state = getState().prayerRoutine;
    return state.status !== 'loading' || state.requestedLocationId !== locationId;
  },
});

const prayerRoutineSlice = createSlice({
  name: 'prayerRoutine',
  initialState: { data: null, status: 'idle', error: '', requestId: null, requestedLocationId: null },
  reducers: {
    refreshPrayerProgress: (state, action) => {
      if (!state.data) return;
      const now = action.payload;
      const { timings, dateKey, previousTimings, nextTimings } = state.data;
      state.data.activeBlockIndex = getActivePrayerBlockIndex(timings, dateKey, now);
      state.data.heroBlockIndex = getHeroBlockIndex(timings, dateKey, now);
      state.data.overnightReview = isOvernightReview(timings, dateKey, now);
      state.data.progress = getPrayerIntervalProgress(timings, dateKey, { previousTimings, nextTimings }, now);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPrayerRoutine.pending, (state, action) => {
      state.status = 'loading';
      state.error = '';
      state.requestId = action.meta.requestId;
      state.requestedLocationId = action.meta.arg || DEFAULT_PRAYER_LOCATION.id;
      if (state.data?.locationId !== state.requestedLocationId) state.data = null;
    }).addCase(fetchPrayerRoutine.fulfilled, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.status = 'succeeded';
      state.data = action.payload;
    }).addCase(fetchPrayerRoutine.rejected, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.status = 'failed';
      state.error = action.error.message || 'Prayer times could not be loaded.';
    });
  },
});

export const { refreshPrayerProgress } = prayerRoutineSlice.actions;
export default prayerRoutineSlice.reducer;
