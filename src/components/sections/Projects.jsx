'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, ExternalLink, Github } from 'lucide-react'
import { profile } from '@/data/profile'

export default function Projects() {
  const { projects, projectsSection } = profile
  const isExternal = (href = '') => /^https?:\/\//.test(href)

  return (
    <section id="projects" className="mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="section-title mb-12"
      >
        {projectsSection.title}
      </motion.h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } }
        }}
        className="grid gap-8 md:grid-cols-2 mt-8"
      >
        {projects.map((project) => {
          const primaryLink = project.links.live || project.links.caseStudy || projectsSection.fallbackLink
          const hasRepo = Boolean(project.links.repo)
          if (project.featured) {
            return (
              <motion.article
                key={project.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="group md:col-span-2 overflow-hidden rounded-3xl border border-emerald-400/25 bg-[linear-gradient(135deg,rgba(5,46,34,.92),rgba(15,23,42,.94))] shadow-2xl shadow-emerald-950/30"
              >
                <div className="grid lg:grid-cols-[1.08fr_.92fr]">
                  <div className="relative min-h-72 overflow-hidden border-b border-emerald-400/15 lg:min-h-full lg:border-b-0 lg:border-r">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={`${project.title} platform preview`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                    {project.logo && (
                      <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/75 px-4 py-3 shadow-xl backdrop-blur-xl">
                        <Image
                          src={project.logo}
                          alt={`${project.title} logo`}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Live product</p>
                          <p className="font-poppins font-bold text-white">readalquran.online</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-7 md:p-10 lg:p-12">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                      {project.eyebrow}
                    </div>
                    <h3 className="mb-4 text-3xl font-poppins font-bold text-white md:text-4xl">{project.title}</h3>
                    <p className="mb-6 font-inter leading-7 text-slate-200">{project.description}</p>

                    {project.highlights?.length > 0 && (
                      <ul className="mb-7 space-y-3">
                        {project.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-3 text-sm leading-6 text-slate-300">
                            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mb-7 flex flex-wrap gap-2">
                      {project.tech.map((technology) => (
                        <span key={technology} className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                          {technology}
                        </span>
                      ))}
                    </div>

                    <a
                      href={primaryLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-3 font-poppins font-bold text-white shadow-lg shadow-emerald-950/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-900/40"
                    >
                      {projectsSection.primaryActionLabel} <ArrowUpRight size={18} />
                    </a>
                  </div>
                </div>
              </motion.article>
            )
          }

          return (
            <motion.article
              key={project.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              className="glass-effect rounded-2xl overflow-hidden card-hover group flex flex-col"
            >
              {/* Project header */}
              <div className="h-40 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-green-600/5 to-transparent" />
                <div className="text-5xl opacity-30 group-hover:scale-110 transition-transform">{projectsSection.cardSymbol}</div>
              </div>

              {/* Project content */}
              <div className="p-6 md:p-8 flex flex-1 flex-col">
                {project.eyebrow && (
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">{project.eyebrow}</p>
                )}
                <h3 className="text-xl font-poppins font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-6 font-inter flex-1">{project.description}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 font-inter font-semibold border border-green-400/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a
                    href={primaryLink}
                    target={isExternal(primaryLink) ? '_blank' : undefined}
                    rel={isExternal(primaryLink) ? 'noreferrer' : undefined}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-poppins font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    <ExternalLink size={16} /> {projectsSection.primaryActionLabel}
                  </a>
                  {hasRepo && (
                    <a
                      href={project.links.repo}
                      target={isExternal(project.links.repo) ? '_blank' : undefined}
                      rel={isExternal(project.links.repo) ? 'noreferrer' : undefined}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-400/30 text-gray-300 font-poppins font-semibold hover:border-green-400/60 hover:text-white transition-all text-sm"
                    >
                      <Github size={16} /> {projectsSection.secondaryActionLabel}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}
