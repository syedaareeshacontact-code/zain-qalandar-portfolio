import { ArrowUpRight } from 'lucide-react';
import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function Experience() {
  return (
    <section id="experience" className="section experience-section">
      <Reveal><SectionHeading number="04" label={profile.design.experienceLabel} title={profile.experienceSection.title} /></Reveal>
      <div className="experience-list">
        {profile.experience.map((experience, index) => (
          <Reveal key={`${experience.company}-${experience.role}`} className="experience-row" delay={index * 0.05}>
            <div className="experience-meta"><span className="eyebrow">{experience.start} — {experience.end}</span><span>{experience.location}</span></div>
            <div className="experience-content">
              <h3>{experience.role}</h3>
              <div className="experience-company">{experience.links?.[0] ? <a href={experience.links[0].href} target="_blank" rel="noopener noreferrer">{experience.company}<ArrowUpRight size={15} /></a> : experience.company}</div>
              <ul>{experience.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              {experience.tech && <ul className="tech-tags">{experience.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul>}
            </div>
            <span className="experience-number" aria-hidden="true">0{index + 1}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
