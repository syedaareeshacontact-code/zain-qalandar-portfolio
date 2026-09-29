import DashboardWorkspace from '@/components/dashboard/DashboardWorkspace';

export const metadata = {
  title: 'Prayer Routine | Zain Qalandar',
  description: 'A personal prayer-based daily work routine.',
};

export default function DashboardPage() {
  return <DashboardWorkspace view="prayer" />;
}
