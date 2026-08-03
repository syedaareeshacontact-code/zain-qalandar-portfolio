'use client';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, ExternalLink } from 'lucide-react';
import { profile } from '@/data/profile';

export default function Experience() {
	const { experience, experienceSection } = profile;

	return (
		<section id="experience" className="mt-20">
			<motion.h2
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className="section-title mb-12"
			>
				{experienceSection.title}
			</motion.h2>

			<div className="space-y-8 mt-12">
				{experience.map((exp, idx) => {
					const duration = exp.end
						? `${exp.start}${experienceSection.rangeSeparator}${exp.end}`
						: exp.start;
					const durationLabel = exp.location
						? `${duration}${experienceSection.locationSeparator}${exp.location}`
						: duration;
					return (
						<motion.div
							key={idx}
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							viewport={{ once: true }}
							className="relative pl-8 pb-8"
						>
							{/* Timeline dot */}
							<div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 ring-4 ring-slate-900 shadow-lg" />
							{/* Timeline line */}
							{idx !== experience.length - 1 && (
								<div className="absolute left-[7px] top-8 w-[2px] h-20 bg-gradient-to-b from-green-500 to-transparent" />
							)}

							<div className="glass-effect rounded-2xl p-6 md:p-8">
								<div className="flex items-start justify-between flex-wrap gap-3 mb-3">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
											<Briefcase className="text-green-400" size={20} />
										</div>
										<div>
											<h3 className="text-xl font-bold text-white">{exp.role}</h3>
											<p className="text-green-400 font-medium">{exp.company}</p>
										</div>
									</div>
									<div className="flex items-center gap-2 text-gray-400 text-sm">
										<Calendar size={16} />
										{durationLabel}
									</div>
								</div>

								<ul className="mb-5 space-y-2 text-gray-300">
									{exp.bullets.map((bullet) => (
										<li key={bullet} className="flex gap-3 leading-relaxed">
											<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
											<span>{bullet}</span>
										</li>
									))}
								</ul>

								{exp.links?.length > 0 && (
									<div className="mb-4 flex flex-wrap gap-3">
										{exp.links.map((link) => (
											<a
												key={link.href}
												href={link.href}
												target="_blank"
												rel="noreferrer"
											className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400 hover:text-green-300"
											>
												{link.label} <ExternalLink size={14} />
											</a>
										))}
									</div>
								)}

								<div className="flex flex-wrap gap-2">
									{exp.tech?.map((skill) => (
										<span
											style={{
												color: 'green',
											}}
											key={skill}
											className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}
