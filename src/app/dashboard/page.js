import PrayerRoutine from '@/components/dashboard/PrayerRoutine';
import GoogleAttendance from '@/components/dashboard/GoogleAttendance';

export const metadata = {
  title: 'Dashboard | Barakah',
  description: 'A prayer-based daily work structure.',
};

export default function DashboardPage() {
  return (
    <>
      <GoogleAttendance />
      <PrayerRoutine />
    </>
  );
}
