import './globals.css';
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

export const viewport = { themeColor: '#111916', colorScheme: 'dark' };

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<a className="skip-link" href="#main-content">{profile.design.skipLink}</a>
				<MotionProvider>
					{children}
				</MotionProvider>
			</body>
		</html>
	);
}
