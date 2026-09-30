import DashboardHero from '@/components/dashboard/DashboardHero';
import TaskWorkspace from '@/components/dashboard/TaskWorkspace';

export const metadata = { title: 'Tasks | Barakah' };

export default function TasksPage() {
  return (
    <section className="bk-tasks-page" aria-labelledby="tasks-title">
      <DashboardHero
        title="Tasks"
        subtitle="Keep work inside the prayer blocks, not around them."
        image="/images/barakah/hero/tasks-hero.webp"
      />
      <TaskWorkspace />
    </section>
  );
}
