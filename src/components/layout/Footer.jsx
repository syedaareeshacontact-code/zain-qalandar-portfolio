import { ArrowUp } from 'lucide-react';
import { profile } from '@/data/profile';

export default function Footer() {
  return (
    <footer className="site-footer page-container">
      <div className="footer-top"><a href="#hero" className="brand"><span className="brand-mark">{profile.design.monogram}</span><span className="brand-name">{profile.basic.brandName}<span className="brand-dot">.</span></span></a><p>{profile.design.heroTitle} {profile.design.heroAccent}</p><a href="#hero" className="text-link">{profile.footer.backToTopLabel}<ArrowUp size={15} /></a></div>
      <div className="footer-bottom"><span>{profile.footer.copyrightTemplate.replace('{year}', String(new Date().getFullYear()))}</span><span>{profile.footer.madeWithPrefix} {profile.footer.madeWithSuffix}</span></div>
    </footer>
  );
}
