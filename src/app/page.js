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
} from '@/components';

export default function Home() {
	return (
		<>
			<ScrollProgressBar />
			<ScrollToTopButton />
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
