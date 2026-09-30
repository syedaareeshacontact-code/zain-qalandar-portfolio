import { configureStore } from '@reduxjs/toolkit';
import cloudinaryUsageReducer from './features/cloudinaryUsage/cloudinaryUsageSlice';
import mongodbUsageReducer from './features/mongodbUsage/mongodbUsageSlice';
import noteCategoriesReducer from './features/noteCategories/noteCategoriesSlice';
import prayerRoutineReducer from './features/prayerRoutine/prayerRoutineSlice';
import tasksReducer from './features/tasks/tasksSlice';
import uploadsReducer from './features/uploads/uploadsSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      cloudinaryUsage: cloudinaryUsageReducer,
      mongodbUsage: mongodbUsageReducer,
      noteCategories: noteCategoriesReducer,
      prayerRoutine: prayerRoutineReducer,
      tasks: tasksReducer,
      uploads: uploadsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg'],
      },
    }),
  });
}
