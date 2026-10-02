'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck2, Check, LoaderCircle, RefreshCw, RotateCcw, Unlink } from 'lucide-react';
import { getPrayerDateKey } from '@/lib/prayerTimes';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', className: 'is-present' },
  { value: 'late', label: 'Late', className: 'is-late' },
  { value: 'absent', label: 'Absent', className: 'is-absent' },
];

export default function GoogleAttendance() {
  const [date, setDate] = useState(() => getPrayerDateKey());
  const [connection, setConnection] = useState({ loading: true, connected: false, calendarName: '' });
  const [attendance, setAttendance] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const recordedStatus = STATUS_OPTIONS.find((option) => option.value === attendance?.status);
  const attendanceRecorded = Boolean(recordedStatus);

  useEffect(() => {
    const refreshDate = () => {
      const currentDate = getPrayerDateKey();
      setDate((previousDate) => previousDate === currentDate ? previousDate : currentDate);
    };

    const timer = window.setInterval(refreshDate, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function loadAttendance() {
    const response = await fetch(`/api/calendar/attendance?date=${date}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Attendance could not be loaded.');
    const payload = await response.json();
    setAttendance(payload.data?.attendance || null);
  }

  async function loadConnection() {
    const response = await fetch('/api/calendar/status', { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Google Calendar status could not be checked.');
    setConnection({ loading: false, ...payload.data });
  }

  useEffect(() => {
    setAttendance(null);
    setError('');
    Promise.all([loadConnection(), loadAttendance()]).catch((loadError) => {
      setConnection((current) => ({ ...current, loading: false }));
      setError(loadError.message);
    });
  }, [date]);

  async function markAttendance(status) {
    setBusy(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/calendar/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Attendance could not be synced.');
      setAttendance(payload.data.attendance);
      setMessage('');
    } catch (markError) {
      setError(markError.message);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError('');
    try {
      await fetch('/api/auth/google/disconnect', { method: 'POST' });
      setConnection({ loading: false, connected: false, calendarName: '' });
      setMessage('Google Calendar disconnect ho gaya.');
    } finally {
      setBusy(false);
    }
  }

  async function resetAttendance() {
    setBusy(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/calendar/attendance?date=${date}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Attendance could not be reset.');
      setAttendance(null);
      setMessage('Aaj ki attendance reset ho gayi.');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`bk-attendance-card${attendanceRecorded ? ' is-complete' : ''}`} aria-labelledby="google-attendance-title">
      <div className="bk-attendance-head">
        <div className="bk-attendance-heading">
          <span className="bk-attendance-icon">
            {attendanceRecorded ? <Check size={18} aria-hidden="true" /> : <CalendarCheck2 size={18} aria-hidden="true" />}
          </span>
          <div>
            <span className="bk-attendance-kicker">{attendanceRecorded ? 'TODAY · RECORDED' : 'ATTENDANCE'}</span>
            <h2 id="google-attendance-title">{attendanceRecorded ? 'Attendance complete' : 'Today\'s attendance'}</h2>
            <p>
              {attendanceRecorded
                ? `${recordedStatus.label} · Saved to Google Calendar`
                : connection.connected
                  ? `Calendar: ${connection.calendarName || 'Primary calendar'}`
                  : 'Mark attendance and highlight it on Google Calendar.'}
            </p>
          </div>
        </div>
        {attendanceRecorded ? (
          <div className="bk-attendance-complete-actions">
            <span className={`bk-attendance-recorded ${recordedStatus.className}`}>
              <Check size={13} aria-hidden="true" /> {recordedStatus.label}
            </span>
            <button className="bk-attendance-reset" type="button" onClick={resetAttendance} disabled={busy}>
              <RotateCcw size={13} aria-hidden="true" /> Reset
            </button>
          </div>
        ) : connection.connected && (
          <button className="bk-attendance-disconnect" type="button" onClick={disconnect} disabled={busy}>
            <Unlink size={14} aria-hidden="true" /> Disconnect
          </button>
        )}
      </div>

      {attendanceRecorded ? null : connection.loading ? (
        <p className="bk-attendance-status"><LoaderCircle className="bk-spin" size={16} /> Checking Google Calendar...</p>
      ) : !connection.connected ? (
        <div className="bk-attendance-connect">
          <p>Google Calendar ko connect karein, phir yahan se Present/Late/Absent mark karein.</p>
          <a className="bk-attendance-connect-button" href="/api/auth/google">
            <CalendarCheck2 size={16} aria-hidden="true" /> Connect Google Calendar
          </a>
        </div>
      ) : (
        <div className="bk-attendance-actions">
          {STATUS_OPTIONS.map((option) => (
            <button
              className={`bk-attendance-option ${option.className}${attendance?.status === option.value ? ' is-selected' : ''}`}
              type="button"
              key={option.value}
              onClick={() => markAttendance(option.value)}
              disabled={busy}
            >
              {busy && attendance?.status !== option.value ? <LoaderCircle className="bk-spin" size={15} /> : attendance?.status === option.value ? <Check size={15} /> : null}
              {option.label}
            </button>
          ))}
        </div>
      )}

      {message && <p className="bk-attendance-message"><Check size={15} /> {message}</p>}
      {error && <p className="bk-attendance-error"><RefreshCw size={15} /> {error}</p>}
    </section>
  );
}
