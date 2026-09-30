import { CloudinaryUsageCard } from '@/components/dashboard/CloudinaryUsage';
import CvLibrary from '@/components/dashboard/CvLibrary';
import DashboardHero from '@/components/dashboard/DashboardHero';

export const metadata = { title: 'Manage | Barakah' };

export default function ManagePage() {
  return (
    <section className="bk-manage-page" aria-labelledby="manage-title">
      <DashboardHero
        title="Manage"
        subtitle="Keep your workspace clear, focused, and ready for what matters next."
        image="/images/barakah/hero/goals-hero.webp"
      />
      <div className="bk-manage-body">
        <div className="bk-page-grid">
          {[
            { kicker: 'Workspace', title: 'Shape your day', body: 'Keep the important parts of your Barakah workspace easy to find and simple to maintain.' },
            { kicker: 'Order', title: 'Make room for focus', body: 'Review lists, routines, and priorities so your tools support the prayer-led rhythm of your day.' },
            { kicker: 'Clarity', title: 'Choose what stays', body: 'Remove distractions and keep only the systems that help you move with purpose.' },
          ].map((item) => (
            <article className="bk-page-card" key={item.title}>
              <small>{item.kicker}</small>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <CvLibrary />
        <div className="bk-manage-usage"><CloudinaryUsageCard /></div>
      </div>
    </section>
  );
}
