import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/store/apiClient';

export const fetchUploads = createAsyncThunk(
  'uploads/fetch',
  ({ category = 'ahd-nama', kind = 'pdf' } = {}) => apiRequest(
    `/api/uploads?category=${encodeURIComponent(category)}&kind=${encodeURIComponent(kind)}`,
    { cache: 'no-store' },
  ),
);

export const uploadPdf = createAsyncThunk(
  'uploads/uploadPdf',
  async ({ file, category = 'ahd-nama', documentCategory = '' }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (documentCategory) formData.append('documentCategory', documentCategory);
    return apiRequest('/api/uploads', { method: 'POST', body: formData });
  },
);

export const deleteUpload = createAsyncThunk(
  'uploads/deleteUpload',
  async (id) => {
    await apiRequest(`/api/uploads?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return id;
  },
);

const initialState = {
  items: [],
  listStatus: 'idle',
  uploadStatus: 'idle',
  deleteStatus: 'idle',
  deletingId: '',
  error: '',
};

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    clearUploadError: (state) => {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUploads.pending, (state) => {
        state.listStatus = 'loading';
        state.error = '';
      })
      .addCase(fetchUploads.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUploads.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.error.message || 'Could not load PDFs.';
      })
      .addCase(uploadPdf.pending, (state) => {
        state.uploadStatus = 'loading';
        state.error = '';
      })
      .addCase(uploadPdf.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(uploadPdf.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.error.message || 'Upload failed.';
      })
      .addCase(deleteUpload.pending, (state, action) => {
        state.deleteStatus = 'loading';
        state.deletingId = action.meta.arg;
        state.error = '';
      })
      .addCase(deleteUpload.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.deletingId = '';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteUpload.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deletingId = '';
        state.error = action.error.message || 'Could not delete this PDF.';
      });
  },
});

export const { clearUploadError } = uploadsSlice.actions;
export default uploadsSlice.reducer;
