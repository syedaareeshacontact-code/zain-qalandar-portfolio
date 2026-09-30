import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/store/apiClient';

export const UPLOAD_CACHE_TTL = 2 * 60 * 1000;

export function getUploadScopeKey(category = 'ahd-nama', kind = 'pdf') {
  return `${category}:${kind}`;
}

export function isUploadScopeStale(scope) {
  return !scope?.hasLoaded || (Date.now() - (scope.lastFetchedAt || 0)) > UPLOAD_CACHE_TTL;
}

export const fetchUploads = createAsyncThunk(
  'uploads/fetch',
  async ({ category = 'ahd-nama', kind = 'pdf' } = {}) => ({
    scopeKey: getUploadScopeKey(category, kind),
    items: await apiRequest(
      `/api/uploads?category=${encodeURIComponent(category)}&kind=${encodeURIComponent(kind)}`,
      { cache: 'no-store' },
    ),
  }),
  {
    condition: ({ category = 'ahd-nama', kind = 'pdf', force = false } = {}, { getState }) => {
      if (force) return true;
      const scope = getState().uploads.scopes?.[getUploadScopeKey(category, kind)];
      return scope?.status !== 'loading';
    },
  },
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
  scopes: {},
  uploadStatus: 'idle',
  deleteStatus: 'idle',
  deletingId: '',
  error: '',
};

function ensureScope(state, scopeKey) {
  if (!state.scopes) state.scopes = {};
  if (!state.scopes[scopeKey]) {
    state.scopes[scopeKey] = {
      items: [],
      status: 'idle',
      error: '',
      hasLoaded: false,
      lastFetchedAt: 0,
    };
  }
  return state.scopes[scopeKey];
}

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
      .addCase(fetchUploads.pending, (state, action) => {
        const { category = 'ahd-nama', kind = 'pdf' } = action.meta.arg || {};
        const scopeKey = getUploadScopeKey(category, kind);
        const scope = ensureScope(state, scopeKey);
        scope.status = 'loading';
        scope.error = '';
        state.error = '';
      })
      .addCase(fetchUploads.fulfilled, (state, action) => {
        const scope = ensureScope(state, action.payload.scopeKey);
        scope.status = 'succeeded';
        scope.items = action.payload.items;
        scope.hasLoaded = true;
        scope.lastFetchedAt = Date.now();
        scope.error = '';
      })
      .addCase(fetchUploads.rejected, (state, action) => {
        const { category = 'ahd-nama', kind = 'pdf' } = action.meta.arg || {};
        const scope = ensureScope(state, getUploadScopeKey(category, kind));
        scope.status = 'failed';
        scope.error = action.error.message || 'Could not load PDFs.';
        state.error = scope.error;
      })
      .addCase(uploadPdf.pending, (state) => {
        state.uploadStatus = 'loading';
        state.error = '';
      })
      .addCase(uploadPdf.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        const scope = ensureScope(state, getUploadScopeKey(action.payload.category, action.payload.kind || 'pdf'));
        scope.items.unshift(action.payload);
        scope.hasLoaded = true;
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
        Object.values(state.scopes || {}).forEach((scope) => {
          scope.items = scope.items.filter((item) => item.id !== action.payload);
        });
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
