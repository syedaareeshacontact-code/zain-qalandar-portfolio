import { profile } from './profile';
import type { Profile } from '@/types/profile';

// Start with the complete portfolio shape, then replace your content and links.
// The single visual design is defined in src/app/globals.css.
export const profileExample = {
  ...profile,
  basic: {
    ...profile.basic,
    fullName: 'Your Name',
    displayName: 'Your Name',
    brandName: 'Your Name',
    headline: 'Full-Stack Developer',
    shortBio: 'A short introduction to your work and the products you build.',
    location: 'Your city, country',
  },
  contact: { email: 'hello@example.com', website: 'https://example.com' },
  design: { ...profile.design, monogram: 'YN' },
  seo: {
    ...profile.seo,
    siteTitle: 'Your Name — Full-Stack Developer',
    siteDescription: 'Your portfolio description.',
    openGraphTitle: 'Your Name — Full-Stack Developer',
    openGraphDescription: 'Your portfolio description.',
  },
} satisfies Profile;
