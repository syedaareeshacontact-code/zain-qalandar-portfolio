import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = { title: 'Notes | Barakah' };

export default function NotesPage() {
  return (
    <BarakahPage
      title="Notes"
      subtitle="Capture the thoughts, reminders, and reflections worth carrying forward."
      heroImage="/images/barakah/hero/ahd-nama-hero.webp"
      items={[
        { kicker: 'Capture', title: 'Keep the thought', body: 'Write down ideas while they are fresh, then return to them when the right block arrives.' },
        { kicker: 'Reflect', title: 'Notice what matters', body: 'Use a quiet space for lessons, observations, and reminders that deserve more than a passing thought.' },
        { kicker: 'Return', title: 'Build a useful record', body: 'Small notes become a clearer direction when you revisit them with consistency and gratitude.' },
      ]}
    />
  );
}
