import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = { title: 'Notes | Barakah' };

export default function NotesPage() {
  return (
    <BarakahPage
      title="Notes"
      subtitle="Capture what mattered today, without turning the night into more work."
      items={[
        { kicker: 'Reflect', title: 'Evening notes', body: 'After Maghrib, write what you finished, what you learned, and what you are grateful for.' },
        { kicker: 'Decide', title: 'Night direction', body: 'After Isha, keep a short note for tomorrow’s one priority.' },
        { kicker: 'Keep', title: 'Light record', body: 'Notes here are for clarity, not for filling every gap in the day.' },
      ]}
    />
  );
}
