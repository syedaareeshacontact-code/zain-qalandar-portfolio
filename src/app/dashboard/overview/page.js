import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = {
  title: 'Dashboard | Barakah',
};

export default function OverviewPage() {
  return (
    <BarakahPage
      title="Dashboard"
      subtitle="A calm overview of your prayer-led day."
      items={[
        { kicker: 'Today', title: 'Stay with the block', body: 'Deep work lives between Fajr and Dhuhr. Protect that window first.' },
        { kicker: 'Focus', title: 'One priority', body: 'Choose the work that actually moves your life, then leave the rest for later.' },
        { kicker: 'Close', title: 'Review before night', body: 'After Maghrib, look back with gratitude. After Isha, decide tomorrow with clarity.' },
      ]}
    />
  );
}
