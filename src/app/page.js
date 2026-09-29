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

export default function Home() {
	return (
		<>
			<ScrollProgressBar />
			<ScrollToTopButton />
			<ThemeToggle />
			<div className="site-shell">
				<Header />
				<main id="main-content" className="page-container">
					<Hero />
					<Stats />
					<Projects />
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
