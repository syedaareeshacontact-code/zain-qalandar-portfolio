import './globals.css';
import Script from 'next/script';
import MotionProvider from '@/components/layout/MotionProvider';
import { profile } from '@/data/profile';
import { validateProfile } from '@/lib/validateProfile';

validateProfile(profile);

export const metadata = {
	metadataBase: new URL(profile.contact.website),
	title: profile.seo.siteTitle,
	description: profile.seo.siteDescription,
	keywords: profile.seo.keywords,
	openGraph: {
		title: profile.seo.openGraphTitle ?? profile.seo.siteTitle,
		description: profile.seo.openGraphDescription ?? profile.seo.siteDescription,
		images: [{ url: profile.seo.ogImage ?? profile.images.avatar, alt: profile.basic.fullName }],
	},
	icons: {
		icon: '/icon.svg',
	},
};

export const viewport = { themeColor: '#f2f7f0', colorScheme: 'light dark' };

const themeInitializer = `
  try {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const theme = savedTheme === 'green' || savedTheme === 'dark'
      ? savedTheme
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'green');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  } catch (_) {
    document.documentElement.dataset.theme = 'green';
    document.documentElement.style.colorScheme = 'light';
  }
`;

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Script id="theme-initializer" strategy="beforeInteractive">
					{themeInitializer}
				</Script>
				<a className="skip-link" href="#main-content">{profile.design.skipLink}</a>
				<MotionProvider>
					{children}
				</MotionProvider>
			</body>
		</html>
	);
}
