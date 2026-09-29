import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = { title: 'Library | Barakah' };

export default function LibraryPage() {
  return (
    <BarakahPage
      title="Library"
      subtitle="Keep a small shelf of reminders that bring you back to a focused day."
      items={[
        { kicker: 'Quran', title: '2:43', body: '“And establish prayer and do not be among the forgetful.”' },
        { kicker: 'Practice', title: 'Work with salah', body: 'The routine is not a productivity trick. It is a way to stay present.' },
        { kicker: 'Return', title: 'A closer you', body: 'A more focused day is useful only if it brings you closer to what matters.' },
      ]}
    />
  );
}
