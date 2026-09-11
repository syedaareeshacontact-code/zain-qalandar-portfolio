'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { profile } from '@/data/profile';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 900);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  if (!visible) return null;
  return <a href="#hero" className="scroll-top" aria-label={profile.ui.scrollToTopLabel}><ArrowUp size={18} /></a>;
}
