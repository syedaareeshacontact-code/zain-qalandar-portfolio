import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/store/apiClient';

export const fetchMongoDBUsage = createAsyncThunk(
  'mongodbUsage/fetch',
  () => apiRequest('/api/mongodb/usage', { cache: 'no-store' }),
);

const initialState = {
  data: null,
  status: 'idle',
  error: '',
};

const mongodbUsageSlice = createSlice({
  name: 'mongodbUsage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMongoDBUsage.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchMongoDBUsage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMongoDBUsage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'MongoDB usage could not be loaded.';
      });
  },
});

export default mongodbUsageSlice.reducer;
