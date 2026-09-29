import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = { title: 'Goals | Barakah' };

export default function GoalsPage() {
  return (
    <BarakahPage
      title="Goals"
      subtitle="Build what matters in the hours when your energy is highest."
      heroImage="/images/barakah/hero/goals-hero.webp"
      items={[
        { kicker: 'Aim', title: 'One worthy target', body: 'A goal is only useful if it can live inside the Fajr to Dhuhr deep-work block.' },
        { kicker: 'Pace', title: 'Steady progress', body: 'Light work after Dhuhr should support the goal, not compete with it.' },
        { kicker: 'Close', title: 'End with clarity', body: 'Each night, decide what moves tomorrow — and what can wait.' },
      ]}
    />
  );
}
