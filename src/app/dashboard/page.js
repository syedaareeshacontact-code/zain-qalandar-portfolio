import PrayerRoutine from '@/components/dashboard/PrayerRoutine';
import GoogleAttendance from '@/components/dashboard/GoogleAttendance';

export const metadata = {
  title: 'Dashboard | Barakah',
  description: 'Your prayer-led workspace with focus sessions, daily habits, task priorities, and progress.',
};

export default function DashboardPage() {
  return (
    <>
      <GoogleAttendance />
      <PrayerRoutine />
    </>
  );
}
