import './barakah.css';
import './prayer-routine.css';
import './tasks.css';
import DashboardShell from '@/components/dashboard/DashboardShell';
import StoreProvider from '@/store/provider';

export const metadata = {
  title: 'Barakah | Prayer Routine',
  description: 'A prayer-based daily work structure.',
};

export default function DashboardLayout({ children }) {
  return (
    <StoreProvider>
      <DashboardShell>{children}</DashboardShell>
    </StoreProvider>
  );
}
