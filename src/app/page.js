import {
	Hero,
	About,
	Services,
	Experience,
	Stats,
	Skills,
	Projects,
	FAQ,
	CTA,
	Contact,
	Header,
	Footer,
	ScrollToTopButton,
	ScrollProgressBar,
	ActiveSectionHighlight,
} from '@/components';

export default function Home() {
	return (
		<>
			<ScrollProgressBar />
			<ActiveSectionHighlight />
			<ScrollToTopButton />
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="max-w-6xl mx-auto px-3 py-0 w-full">
					<Hero />
					<Stats />
					<About />
					<Services />
					<Experience />
					<Skills />
					<Projects />
					<FAQ />
					<CTA />
					<Contact />
				</main>
				<Footer />
			</div>
		</>
	);
}
