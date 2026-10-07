'use client';

import { useState } from 'react';
import Image from 'next/image';

const PROJECT_PLACEHOLDER = '/images/projects/placeholder.svg';

export default function ProjectImage({ src, alt, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const source = src && failedSource !== src ? src : PROJECT_PLACEHOLDER;
  return <Image {...props} src={source} alt={alt} style={{ objectFit: source.endsWith('.svg') ? 'contain' : 'cover', ...props.style }} onError={() => setFailedSource(src)} />;
}
