'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 35 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
