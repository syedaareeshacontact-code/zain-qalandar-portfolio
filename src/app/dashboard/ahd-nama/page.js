import { Check, HeartHandshake, MoonStar, Sunrise } from 'lucide-react';
import DashboardHero from '@/components/dashboard/DashboardHero';
import AhdNamaUpload from '@/components/dashboard/AhdNamaUpload';

export const metadata = {
  title: 'Ahd Nama | Barakah',
};

const commitments = [
  { icon: Sunrise, title: 'Begin with prayer', body: 'I will protect my salah and begin my work with a clear, sincere intention.' },
  { icon: HeartHandshake, title: 'Work with ihsan', body: 'I will be honest, useful, and mindful in the work entrusted to me today.' },
  { icon: MoonStar, title: 'Close with reflection', body: 'I will end the day with gratitude, review, and a better intention for tomorrow.' },
];

export default function AhdNamaPage() {
  return (
    <section className="bk-ahd-nama" aria-labelledby="ahd-nama-title">
      <DashboardHero
        title="Ahd Nama"
        subtitle="A quiet promise to keep faith, character, and work in the right order."
        image="/images/barakah/hero/ahd-nama-hero.webp"
      />

      <div className="bk-ahd-layout">
        <article className="bk-ahd-promise">
          <p className="bk-ahd-kicker">My covenant for today</p>
          <h2>“I seek Allah’s pleasure in my prayer, my character, and my work.”</h2>
          <p>I will use my time with purpose, treat people with kindness, and return to what matters whenever I lose focus.</p>
          <ul>
            {['Pray on time and protect the prayer windows.', 'Choose one meaningful priority and complete it with care.', 'Speak truthfully, act gently, and leave what does not benefit me.'].map((item) => (
              <li key={item}><Check size={16} strokeWidth={2.8} aria-hidden="true" />{item}</li>
            ))}
          </ul>
          <small>A personal daily intention for reflection and action.</small>
        </article>

        <aside className="bk-ahd-reminder" aria-label="Ahd Nama reminder">
          <span className="bk-ahd-reminder-icon" aria-hidden="true"><HeartHandshake size={25} strokeWidth={1.8} /></span>
          <p>Remember</p>
          <strong>Small sincere actions, repeated with care, shape a meaningful life.</strong>
        </aside>
      </div>

      <div className="bk-ahd-commitments">
        {commitments.map(({ icon: Icon, title, body }) => (
          <article className="bk-ahd-commitment" key={title}>
            <span aria-hidden="true"><Icon size={21} strokeWidth={1.8} /></span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>

      <AhdNamaUpload />
    </section>
  );
}
