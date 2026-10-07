import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';
import TechnologyIcon from '@/components/ui/TechnologyIcon';

export default function Skills() {
  return (
    <section id="skills" className="skills-section">
      <Reveal className="toolkit-heading">
        <div><p className="eyebrow">{profile.design.toolkitLabel}</p><h2>{profile.skills.title}</h2></div>
        <p className="toolkit-description">{profile.skills.description}</p>
      </Reveal>
      <div className="toolkit-grid">
        {profile.skills.categories.map((category, index) => (
          <Reveal key={category.title} className="toolkit-category" delay={index * 0.05}>
            <div className="toolkit-category-heading"><span className="eyebrow" aria-hidden="true">0{index + 1}</span><h3>{category.title}</h3></div>
            <ul className="skill-list" aria-label={category.title}>{category.items.map((skill) => <li key={skill}><TechnologyIcon name={skill} /><span>{skill}</span></li>)}</ul>
            {category.notes && <ul className="skill-notes" aria-label={`${category.title} practices`}>{category.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
