import './barakah.css';
import './prayer-routine.css';
import './tasks.css';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const metadata = {
  title: 'Barakah | Prayer Routine',
  description: 'A prayer-based daily work structure.',
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
