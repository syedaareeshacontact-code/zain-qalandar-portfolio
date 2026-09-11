'use client';

import { motion } from 'framer-motion';

export default function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ y: 0 }}
      onViewportEnter={(entry) => entry?.target.classList.add('is-revealed')}
      viewport={{ once: true, amount: 0.12 }}
      style={{ '--reveal-delay': `${delay}s` }}
      data-reveal=""
    >
      {children}
    </motion.div>
  );
}
