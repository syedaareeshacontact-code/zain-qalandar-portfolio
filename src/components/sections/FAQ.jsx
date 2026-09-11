import { Plus } from 'lucide-react';
import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';

export default function FAQ() {
  if (!profile.faq?.length) return null;
  return (
    <section id="faq" className="section faq-section">
      <Reveal className="faq-intro">
        <p className="eyebrow">05 / {profile.design.faqLabel}</p>
        <h2>{profile.faqSection.title}</h2>
        <p>{profile.faqSection.intro}</p>
        <a className="text-link" href={profile.faqSection.ctaHref}>{profile.faqSection.ctaLabel}<span aria-hidden="true">↗</span></a>
      </Reveal>
      <Reveal className="faq-list">
        {profile.faq.map((faq, index) => (
          <details key={faq.question} name="portfolio-faq" className="faq-item">
            <summary><span className="faq-number">0{index + 1}</span><span>{faq.question}</span><Plus size={18} aria-hidden="true" /></summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
