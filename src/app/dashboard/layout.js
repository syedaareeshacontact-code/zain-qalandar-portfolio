import './barakah.css';
import './notes.css';
import './prayer-routine.css';
import './tasks.css';
import './goals.css';
import DashboardShell from '@/components/dashboard/DashboardShell';
import StoreProvider from '@/store/provider';
import { PrayerProvider } from '@/context/prayer-context';
import './dynamic-dashboard.css';

export const metadata = {
  title: 'Barakah | Prayer Routine',
  description: 'A prayer-based daily work structure.',
};

export default function DashboardLayout({ children }) {
  return (
    <StoreProvider>
      <PrayerProvider><DashboardShell>{children}</DashboardShell></PrayerProvider>
    </StoreProvider>
  );
}
