import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';

export default function Stats() {
  return (
    <Reveal className="stats-strip">
      {profile.stats.map((stat) => (
        <div className="stat" key={stat.label}>
          <span className="stat-value">{stat.value}<span>{stat.suffix}</span></span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </Reveal>
  );
}
