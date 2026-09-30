import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/store/apiClient';

export const fetchCloudinaryUsage = createAsyncThunk(
  'cloudinaryUsage/fetch',
  () => apiRequest('/api/cloudinary/usage', { cache: 'no-store' }),
);

const initialState = {
  data: null,
  status: 'idle',
  error: '',
};

const cloudinaryUsageSlice = createSlice({
  name: 'cloudinaryUsage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCloudinaryUsage.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchCloudinaryUsage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCloudinaryUsage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Cloudinary usage could not be loaded.';
      });
  },
});

export default cloudinaryUsageSlice.reducer;
