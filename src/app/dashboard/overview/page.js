import DashboardHero from '@/components/dashboard/DashboardHero';
import DashboardHub from '@/components/dashboard/DashboardHub';

export const metadata = {
  title: 'Workspace Overview | Barakah',
};

export default function OverviewPage() {
  return (
    <div className="bk-overview-page"><DashboardHero title="Your Workspace" subtitle="A little clarity for your focus, habits, and next steps." image="/images/barakah/hero/01-fajr-to-dhuhr.webp" /><DashboardHub /></div>
  );
}
