import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/store/apiClient';

export const TASK_CACHE_TTL = 2 * 60 * 1000;

export function isTaskWorkspaceStale({ status, lastFetchedAt = 0 }) {
  return status === 'idle' || (status === 'succeeded' && (Date.now() - lastFetchedAt) > TASK_CACHE_TTL);
}

export const fetchTaskWorkspace = createAsyncThunk(
  'tasks/fetchWorkspace',
  async () => {
    const [tasks, lists] = await Promise.all([
      apiRequest('/api/tasks', { cache: 'no-store' }),
      apiRequest('/api/task-lists', { cache: 'no-store' }),
    ]);

    return { tasks, lists };
  },
  {
    condition: (_, { getState }) => getState().tasks.status !== 'loading',
  },
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task) => {
    const data = await apiRequest('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    return data.task;
  },
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }) => apiRequest('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  }),
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id) => {
    await apiRequest(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return id;
  },
);

export const createTaskList = createAsyncThunk(
  'tasks/createTaskList',
  async (list) => apiRequest('/api/task-lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  }),
);

export const updateTaskList = createAsyncThunk(
  'tasks/updateTaskList',
  async ({ id, updates }) => apiRequest('/api/task-lists', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  }),
);

export const deleteTaskList = createAsyncThunk(
  'tasks/deleteTaskList',
  async (id) => apiRequest(`/api/task-lists?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
);

export const reorderTasks = createAsyncThunk(
  'tasks/reorderTasks',
  async (orderedTasks) => {
    await Promise.all(orderedTasks.map((task) => apiRequest('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, order: task.order }),
    })));

    return orderedTasks;
  },
);

const initialState = {
  tasks: [],
  lists: [],
  status: 'idle',
  lastFetchedAt: 0,
  error: '',
  mutationStatus: 'idle',
  mutationError: '',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    replaceTasks: (state, action) => {
      state.tasks = action.payload;
    },
    optimisticallyUpdateTask: (state, action) => {
      const { id, updates } = action.payload;
      state.tasks = state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
    },
    clearTaskError: (state) => {
      state.error = '';
      state.mutationError = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskWorkspace.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(fetchTaskWorkspace.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload.tasks;
        state.lists = action.payload.lists;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchTaskWorkspace.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Tasks could not be loaded.';
      })
      .addCase(createTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task could not be created.';
      })
      .addCase(updateTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { task, recurringTask } = action.payload;
        state.mutationStatus = 'succeeded';
        state.tasks = state.tasks.map((item) => (item.id === task.id ? task : item));
        if (recurringTask) state.tasks.push(recurringTask);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task could not be updated.';
      })
      .addCase(deleteTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task could not be deleted.';
      })
      .addCase(createTaskList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(createTaskList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.lists.push(action.payload);
      })
      .addCase(createTaskList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task list could not be created.';
      })
      .addCase(updateTaskList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(updateTaskList.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.lists = state.lists.map((list) => (list.id === action.payload.id ? action.payload : list));
      })
      .addCase(updateTaskList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task list could not be updated.';
      })
      .addCase(deleteTaskList.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(deleteTaskList.fulfilled, (state, action) => {
        const { deletedId, fallbackListId } = action.payload;
        state.mutationStatus = 'succeeded';
        state.lists = state.lists.filter((list) => list.id !== deletedId);
        state.tasks = state.tasks.map((task) => (
          task.listId === deletedId ? { ...task, listId: fallbackListId } : task
        ));
      })
      .addCase(deleteTaskList.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task list could not be deleted.';
      })
      .addCase(reorderTasks.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = '';
      })
      .addCase(reorderTasks.fulfilled, (state, action) => {
        const orderMap = new Map(action.payload.map((task) => [task.id, task.order]));
        state.mutationStatus = 'succeeded';
        state.tasks = state.tasks.map((task) => (
          orderMap.has(task.id) ? { ...task, order: orderMap.get(task.id) } : task
        ));
      })
      .addCase(reorderTasks.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.error.message || 'Task order could not be saved.';
      });
  },
});

export const { clearTaskError, optimisticallyUpdateTask, replaceTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
