import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = { title: 'Tasks | Barakah' };

export default function TasksPage() {
  return (
    <BarakahPage
      title="Tasks"
      subtitle="Keep work inside the prayer blocks, not around them."
      items={[
        { kicker: 'Priority 1', title: 'Morning deep work', body: 'Put only high-value tasks between Fajr and Dhuhr.' },
        { kicker: 'Priority 2', title: 'Midday light work', body: 'Meetings, admin, and follow-ups belong after Dhuhr.' },
        { kicker: 'Later', title: 'Nothing after Asr', body: 'The restful block is for family, worship, and recovery — not extra tasks.' },
      ]}
    />
  );
}
