import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import { profile } from '@/data/profile';

function Architecture() {
  const { design } = profile;
  return (
    <div className="architecture" aria-hidden="true">
      <div className="architecture-topline"><span>01 — 03</span><span>{profile.basic.headline}</span></div>
      <svg viewBox="0 0 460 410" fill="none" className="architecture-drawing">
        <defs>
          <pattern id="architecture-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" stroke="var(--accent)" strokeOpacity=".055" /></pattern>
          <linearGradient id="interface-plane" x1="70" y1="70" x2="370" y2="230" gradientUnits="userSpaceOnUse"><stop stopColor="#3c5b57" /><stop offset="1" stopColor="#263d41" /></linearGradient>
        </defs>
        <rect x="16" y="16" width="428" height="365" fill="url(#architecture-grid)" />
        <ellipse cx="230" cy="345" rx="154" ry="27" fill="#000000" opacity=".16" />
        <path d="M230 30V360" stroke="#77969a" strokeDasharray="3 5" />
        <g className="architecture-layer layer-data" strokeLinejoin="round">
          <path d="M230 204L395 280L230 356L65 280Z" fill="#2b2b28" stroke="#776654" />
          <path d="M65 280V291L230 367L395 291V280M230 356V367" stroke="#776654" />
          <path d="M230 226L351 281L230 336L109 281Z" stroke="#ae9075" strokeDasharray="3 5" />
          <text x="230" y="330" textAnchor="middle" fill="var(--accent-warm)">{design.architectureLayers[2]}</text>
        </g>
        <g className="architecture-layer layer-application" strokeLinejoin="round">
          <path d="M230 128L395 204L230 280L65 204Z" fill="#21383d" stroke="#9dcbd4" />
          <path d="M65 204V216L230 292L395 216V204M230 280V292" stroke="#729ca4" />
          <path d="M230 155L337 204L230 253L123 204Z" stroke="#9dcbd4" strokeOpacity=".45" />
          <text x="230" y="254" textAnchor="middle" fill="var(--accent-cool)">{design.architectureLayers[1]}</text>
        </g>
        <g className="architecture-layer layer-interface" strokeLinejoin="round">
          <path d="M230 52L395 128L230 204L65 128Z" fill="url(#interface-plane)" stroke="var(--accent)" strokeWidth="1.3" />
          <path d="M65 128V140L230 216L395 140V128M230 204V216" stroke="#9cc7b1" />
          <path d="M230 71L354 128L230 185L106 128Z" stroke="var(--accent)" strokeOpacity=".35" />
          <path d="M148 109L272 166M190 90L313 147M148 147L272 90M189 166L313 109" stroke="var(--accent)" strokeOpacity=".2" />
          <rect x="181" y="113" width="98" height="30" rx="3" fill="var(--accent)" />
          <text x="230" y="132" textAnchor="middle" fill="var(--on-accent)">{design.architectureLayers[0]}</text>
          <circle cx="65" cy="128" r="4" fill="var(--accent)" /><circle cx="395" cy="128" r="4" fill="var(--accent)" />
          <path d="M230 30V52" stroke="var(--accent)" strokeDasharray="3 4" /><circle cx="230" cy="30" r="4" fill="var(--accent)" />
        </g>
        <path d="M31 41V25H47M413 25H429V41M31 355V371H47M413 371H429V355" stroke="#53666a" />
      </svg>
      <div className="architecture-caption"><span className="small-cross">+</span>{design.architectureCaption}<span className="small-cross">+</span></div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="status-dot" />{profile.basic.headline}</p>
          <h1>{profile.design.heroTitle}<em>{profile.design.heroAccent}</em></h1>
          <div className="hero-intro">
            <Image src={profile.images.avatar} alt={profile.images.avatarAlt} width={42} height={42} className="hero-avatar" priority />
            <span>{profile.hero.greetingPrefix} <strong>{profile.basic.fullName}.</strong></span>
          </div>
          <p className="hero-description">{profile.hero.subheading}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={profile.secondaryCta.href}>{profile.secondaryCta.label}<ArrowUpRight size={18} /></a>
            <a className="button button-text" href={profile.primaryCta.href} download={profile.primaryCta.download}>{profile.primaryCta.label}<Download size={16} /></a>
          </div>
          <p className="availability"><span className="status-dot" />{profile.design.availability}<span className="availability-separator">/</span>{profile.basic.location}</p>
        </div>
        <Architecture />
      </div>
      <div className="hero-bottom">
        <span>{profile.design.heroFootnote}</span>
        <span className="hero-focus">{profile.design.heroFocus}</span>
        <a href="#projects">{profile.hero.scrollHint}<ArrowDown size={14} /></a>
      </div>
    </section>
  );
}
