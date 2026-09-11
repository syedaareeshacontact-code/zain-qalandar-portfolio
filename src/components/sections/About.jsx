import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';

export default function About() {
  return (
    <section id="about" className="section about-section">
      <Reveal className="about-portrait">
        <div className="portrait-frame"><Image src={profile.images.avatar} alt={profile.images.avatarAlt} width={899} height={948} sizes="(max-width: 640px) 85vw, 340px" /></div>
        <div className="portrait-caption"><span>{profile.basic.fullName}</span><span>{profile.design.monogram} / 01</span></div>
        <p className="portrait-note">{profile.design.aboutNote}</p>
      </Reveal>
      <Reveal className="about-copy" delay={0.1}>
        <p className="eyebrow">02 / {profile.design.aboutLabel}</p>
        <h2>{profile.about.title}</h2>
        <p className="about-lead">{profile.about.longBio}</p>
        {profile.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <ul className="about-highlights">{profile.about.highlights.map((highlight) => <li key={highlight}><span className="small-cross" aria-hidden="true">+</span>{highlight}</li>)}</ul>
        <div className="about-facts">{profile.about.summaryCards.map((card) => <div key={card.title}><span className="eyebrow">{card.title}</span><span>{card.value}</span></div>)}</div>
        {profile.resume?.resumeUrl && <a className="text-link" href={profile.resume.resumeUrl} target="_blank" rel="noopener noreferrer">{profile.design.resumeLabel}<ArrowUpRight size={17} /></a>}
      </Reveal>
    </section>
  );
}
