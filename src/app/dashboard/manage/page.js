import { CloudinaryUsageCard } from '@/components/dashboard/CloudinaryUsage';
import CvLibrary from '@/components/dashboard/CvLibrary';
import DashboardHero from '@/components/dashboard/DashboardHero';
import ProjectManager from '@/components/dashboard/ProjectManager';

export const metadata = { title: 'Manage | Barakah' };

export default function ManagePage() {
  return (
    <section className="bk-manage-page" aria-labelledby="manage-title">
      <DashboardHero
        title="Manage"
        subtitle="Publish your projects, organize your stacks, and keep your public portfolio up to date."
        image="/images/barakah/hero/goals-hero.webp"
      />
      <div className="bk-manage-body">
        <ProjectManager />
        <CvLibrary />
        <div className="bk-manage-usage"><CloudinaryUsageCard /></div>
      </div>
    </section>
  );
}
