'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

const MAX_NOTIFICATIONS = 4;
const DEFAULT_DURATIONS = {
  success: 4000,
  error: 6500,
  warning: 5500,
  info: 4500,
};

const NotificationContext = createContext(null);

function reducer(state, action) {
  if (action.type === 'ADD') return [action.payload, ...state].slice(0, MAX_NOTIFICATIONS);
  if (action.type === 'REMOVE') return state.filter((notification) => notification.id !== action.id);
  if (action.type === 'CLEAR') return [];
  return state;
}

export function NotificationProvider({ children }) {
  const [notifications, dispatch] = useReducer(reducer, []);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    dispatch({ type: 'REMOVE', id });
  }, []);

  const notify = useCallback((type, message, duration = DEFAULT_DURATIONS[type] || DEFAULT_DURATIONS.info) => {
    const id = `notice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const notification = { id, type, message: String(message), duration };
    dispatch({ type: 'ADD', payload: notification });

    if (duration > 0) {
      const timer = window.setTimeout(() => {
        timers.current.delete(id);
        dispatch({ type: 'REMOVE', id });
      }, duration);
      timers.current.set(id, timer);
    }

    return id;
  }, []);

  const success = useCallback((message) => notify('success', message), [notify]);
  const error = useCallback((message) => notify('error', message), [notify]);
  const warning = useCallback((message) => notify('warning', message), [notify]);
  const info = useCallback((message) => notify('info', message), [notify]);
  const clear = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    dispatch({ type: 'CLEAR' });
  }, []);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  const value = useMemo(() => ({
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
  }), [clear, dismiss, error, info, notify, notifications, success, warning]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used inside NotificationProvider');
  return context;
}
