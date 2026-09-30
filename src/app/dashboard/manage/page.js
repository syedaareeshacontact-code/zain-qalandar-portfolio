import BarakahPage from '@/components/dashboard/BarakahPage';
import { CloudinaryUsageCard } from '@/components/dashboard/CloudinaryUsage';
import CvLibrary from '@/components/dashboard/CvLibrary';

export const metadata = { title: 'Manage | Barakah' };

export default function ManagePage() {
  return (
    <section className="bk-manage-page">
      <BarakahPage
        title="Manage"
        subtitle="Keep your workspace clear, focused, and ready for what matters next."
        heroImage="/images/barakah/hero/goals-hero.webp"
        items={[
          { kicker: 'Workspace', title: 'Shape your day', body: 'Keep the important parts of your Barakah workspace easy to find and simple to maintain.' },
          { kicker: 'Order', title: 'Make room for focus', body: 'Review lists, routines, and priorities so your tools support the prayer-led rhythm of your day.' },
          { kicker: 'Clarity', title: 'Choose what stays', body: 'Remove distractions and keep only the systems that help you move with purpose.' },
        ]}
      />
      <CvLibrary />
      <div className="bk-manage-usage"><CloudinaryUsageCard /></div>
    </section>
  );
}
