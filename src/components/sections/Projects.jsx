import Image from 'next/image';
import { ArrowUpRight, Github } from 'lucide-react';
import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function Projects() {
  return (
    <section id="projects" className="section projects-section">
      <Reveal>
        <SectionHeading number="01" label={profile.design.workLabel} title={profile.projectsSection.title} description={profile.design.workDescription}>
          <a className="text-link" href={profile.socials.github} target="_blank" rel="noopener noreferrer">{profile.design.repositoriesLabel}<ArrowUpRight size={17} /></a>
        </SectionHeading>
      </Reveal>
      <div className="projects-grid">
        {profile.projects.map((project, index) => (
          <Reveal key={project.title} className={`project-card${project.featured ? ' project-featured' : ''}`} delay={index * 0.06}>
            <article>
              {project.image && (
                <a className="project-art" href={project.links.live || project.links.repo || project.links.caseStudy} target="_blank" rel="noopener noreferrer" aria-label={`${profile.projectsSection.primaryActionLabel}: ${project.title}`}>
                  <Image src={project.image} alt={`${project.title} — ${project.eyebrow}`} width={project.featured ? 1200 : 560} height={project.featured ? 260 : 220} sizes={project.featured ? '(max-width: 1200px) 92vw, 1120px' : '(max-width: 640px) 92vw, 550px'} />
                </a>
              )}
              <div className="project-content">
                <div className="project-copy">
                  <p className="eyebrow project-eyebrow">{String(index + 1).padStart(2, '0')} / {project.eyebrow}</p>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <ul className="tech-tags" aria-label={profile.skills.title}>{project.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul>
                </div>
                <div className="project-details">
                  {project.highlights && <div className="project-highlights"><p className="eyebrow">{profile.design.projectContribution}</p><ul>{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                  <div className="project-links">
                    {project.links.live && <a className="text-link" href={project.links.live} target="_blank" rel="noopener noreferrer">{project.featured ? profile.projectsSection.primaryActionLabel : profile.design.productSignIn}<ArrowUpRight size={18} /></a>}
                    {project.links.repo && <a className="text-link" href={project.links.repo} target="_blank" rel="noopener noreferrer"><Github size={16} />{profile.projectsSection.secondaryActionLabel}</a>}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
