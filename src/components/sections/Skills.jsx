import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';

export default function Skills() {
  return (
    <section id="skills" className="skills-section">
      <Reveal className="toolkit-heading"><p className="eyebrow">{profile.design.toolkitLabel}</p><h2>{profile.skills.title}</h2></Reveal>
      <div className="toolkit-grid">
        {profile.skills.categories.map((category, index) => (
          <Reveal key={category.title} className="toolkit-category" delay={index * 0.05}>
            <h3><span className="small-cross" aria-hidden="true">+</span>{category.title}</h3>
            <ul className="tech-tags">{category.items.map((skill) => <li key={skill}>{skill}</li>)}</ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
