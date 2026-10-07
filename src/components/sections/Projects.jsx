'use client';

import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Github, Layers } from 'lucide-react';
import { profile } from '@/data/profile';
import { formatProjectDate } from '@/lib/projectValidation';
import ProjectImage from '@/components/ui/ProjectImage';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function Projects({ workspace }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { projects: allProjects, categories } = workspace;
  const projects = allProjects.filter((project) => !project.isDemo);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const counts = new Map();
  for (const project of projects) counts.set(project.categoryId, (counts.get(project.categoryId) || 0) + 1);
  const filters = [{ id: 'all', name: 'All projects', count: projects.length }, ...categories.filter((category) => counts.has(category.id)).map((category) => ({ ...category, count: counts.get(category.id) }))];
  if (counts.get(null)) filters.push({ id: 'uncategorized', name: 'Uncategorized', count: counts.get(null) });
  const visibleProjects = selectedCategory === 'all' ? projects : projects.filter((project) => (project.categoryId || 'uncategorized') === selectedCategory);
  return (
    <section id="projects" className="section projects-section">
      <Reveal>
        <SectionHeading number="01" label={profile.design.workLabel} title={profile.projectsSection.title} description={profile.design.workDescription}>
          <a className="text-link" href={profile.socials.github} target="_blank" rel="noopener noreferrer">{profile.design.repositoriesLabel}<ArrowUpRight size={17} /></a>
        </SectionHeading>
      </Reveal>
      <div className="portfolio-project-toolbar">
        <div className="portfolio-category-filters" role="group" aria-label="Filter projects by category">
          {filters.map((category) => <button key={category.id} type="button" aria-pressed={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)}>{category.name}<span>{category.count}</span></button>)}
        </div>
        <p className="portfolio-project-count" role="status">{visibleProjects.length} project{visibleProjects.length === 1 ? '' : 's'}</p>
      </div>
      <div className="projects-grid">
        {visibleProjects.map((project, index) => {
          const href = project.liveUrl || project.codeUrl;
          const image = <ProjectImage src={project.imageUrl} alt={`${project.title} project preview`} width={project.featured ? 1200 : 560} height={project.featured ? 380 : 315} sizes={project.featured ? '(max-width: 1200px) 92vw, 1120px' : '(max-width: 640px) 92vw, 550px'} />;
          return (
          <Reveal key={project.id} className={`project-card portfolio-managed-card${project.featured ? ' project-featured' : ''}`} delay={Math.min(index, 5) * 0.04}>
            <article>
              {href ? <a className="project-art" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title}`}>{image}</a> : <div className="project-art">{image}</div>}
              <div className="project-content">
                <div className="project-copy">
                  <div className="portfolio-project-meta"><span><Layers size={13} aria-hidden="true" />{categoryNames.get(project.categoryId) || 'Uncategorized'}</span>{project.date && <time dateTime={project.date}><CalendarDays size={13} aria-hidden="true" />{formatProjectDate(project.date)}</time>}{project.isDemo && <span className="portfolio-demo-badge">Demo</span>}</div>
                  {project.eyebrow && <p className="eyebrow project-eyebrow">{project.eyebrow}</p>}
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  {project.skills.length > 0 && <ul className="tech-tags" aria-label={`${project.title} skills`}>{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>}
                </div>
                <div className="project-details">
                  {project.highlights.length > 0 && <div className="project-highlights"><p className="eyebrow">{profile.design.projectContribution}</p><ul>{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                  {(project.liveUrl || project.codeUrl) && <div className="project-links">
                    {project.liveUrl && <a className="text-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live project<ArrowUpRight size={18} /></a>}
                    {project.codeUrl && <a className="text-link" href={project.codeUrl} target="_blank" rel="noopener noreferrer"><Github size={16} />Source code<ArrowUpRight size={16} /></a>}
                  </div>}
                </div>
              </div>
            </article>
          </Reveal>
        );})}
      </div>
      {!visibleProjects.length && <p className="portfolio-project-empty" role="status">{projects.length ? 'Projects in this category are coming soon.' : 'New projects are on the way. Check back soon.'}</p>}
    </section>
  );
}
