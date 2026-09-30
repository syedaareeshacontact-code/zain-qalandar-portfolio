import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getActivePrayerBlockIndex,
  getHeroBlockIndex,
  getPrayerIntervalProgress,
  getPrayerRoutineData,
  isOvernightReview,
} from '@/lib/prayerTimes';

export const fetchPrayerRoutine = createAsyncThunk(
  'prayerRoutine/fetch',
  async () => {
    const data = await getPrayerRoutineData();
    if (!data) throw new Error('Prayer times could not be loaded right now.');
    return data;
  },
);

const initialState = {
  data: null,
  status: 'idle',
  error: '',
};

const prayerRoutineSlice = createSlice({
  name: 'prayerRoutine',
  initialState,
  reducers: {
    refreshPrayerProgress: (state) => {
      if (!state.data) return;

      const { timings, dateKey, previousTimings, nextTimings } = state.data;
      state.data.activeBlockIndex = getActivePrayerBlockIndex(timings, dateKey);
      state.data.heroBlockIndex = getHeroBlockIndex(timings, dateKey);
      state.data.overnightReview = isOvernightReview(timings, dateKey);
      state.data.progress = getPrayerIntervalProgress(timings, dateKey, { previousTimings, nextTimings });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrayerRoutine.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchPrayerRoutine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchPrayerRoutine.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Prayer times could not be loaded.';
      });
  },
});

export const { refreshPrayerProgress } = prayerRoutineSlice.actions;
export default prayerRoutineSlice.reducer;
