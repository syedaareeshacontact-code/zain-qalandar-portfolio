import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function Services() {
  return (
    <section id="services" className="section services-section">
      <Reveal><SectionHeading number="03" label={profile.design.expertiseLabel} title={profile.services.title} description={profile.design.expertiseDescription} /></Reveal>
      <div className="services-grid">
        {profile.services.items.map((service, index) => {
          const Icon = service.icon;
          return (
            <Reveal key={service.title} delay={index * 0.05} className="service-card">
              <div className="service-top"><Icon size={24} strokeWidth={1.4} /><span className="eyebrow">0{index + 1}</span></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
