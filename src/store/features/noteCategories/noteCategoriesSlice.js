import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/store/apiClient';

export const fetchNoteCategories = createAsyncThunk(
  'noteCategories/fetch',
  () => apiRequest('/api/note-categories', { cache: 'no-store' }),
  {
    condition: (_, { getState }) => getState().noteCategories.status !== 'loading',
  },
);

const initialState = {
  items: [],
  status: 'idle',
  error: '',
  lastFetchedAt: 0,
};

const noteCategoriesSlice = createSlice({
  name: 'noteCategories',
  initialState,
  reducers: {
    setNoteCategories: (state, action) => {
      state.items = action.payload;
      state.status = 'succeeded';
      state.error = '';
      state.lastFetchedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoteCategories.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchNoteCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = '';
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchNoteCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Categories could not be loaded.';
      });
  },
});

export const { setNoteCategories } = noteCategoriesSlice.actions;
export default noteCategoriesSlice.reducer;
