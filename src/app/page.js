import {
	Hero,
	About,
	Services,
	Experience,
	Stats,
	Skills,
	Projects,
	FAQ,
	Contact,
	Header,
	Footer,
	ScrollToTopButton,
	ScrollProgressBar,
	ThemeToggle,
} from '@/components';
import { getLatestCv } from '@/lib/cv';
import { getPublicPortfolioWorkspace } from '@/lib/portfolioProjects';

export const dynamic = 'force-dynamic';

export default async function Home() {
	const [latestCv, projectWorkspace] = await Promise.all([getLatestCv(), getPublicPortfolioWorkspace()]);

	return (
		<>
			<ScrollProgressBar />
			<ScrollToTopButton />
			<ThemeToggle />
			<div className="site-shell">
				<Header />
				<main id="main-content" className="page-container">
					<Hero latestCv={latestCv} />
					<Stats />
					<Projects workspace={projectWorkspace} />
					<About />
					<Services />
					<Skills />
					<Experience />
					<FAQ />
					<Contact />
				</main>
				<Footer />
			</div>
		</>
	);
}
