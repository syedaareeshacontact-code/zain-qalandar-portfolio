import DashboardHero from '@/components/dashboard/DashboardHero';
import GoalsWorkspace from '@/components/dashboard/GoalsWorkspace';

export const metadata = { title: 'Goals | Barakah' };

export default function GoalsPage() {
  return (
    <section className="bk-goals-page" aria-labelledby="goals-title">
      <DashboardHero
        title="Goals"
        subtitle="Build what matters in the hours when your energy is highest."
        image="/images/barakah/hero/goals-hero.webp"
      />
      <GoalsWorkspace />
    </section>
  );
}
