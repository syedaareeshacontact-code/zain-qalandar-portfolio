import type { LucideIcon } from 'lucide-react';

export type CtaLink = {
	label: string;
	href: string;
	download?: string | boolean;
};

export type NavItem = {
	id: string;
	label: string;
	href: string;
	showInNav?: boolean;
	showInHighlight?: boolean;
};

export type AboutCard = {
	title: string;
	value: string;
	icon?: LucideIcon;
};

export type SkillCategory = {
	title: string;
	items: string[];
};

export type SkillProficiency = {
	name: string;
	level: number;
};

export type StatItem = {
	label: string;
	value: number;
	suffix?: string;
	icon: LucideIcon;
	colorClass: string;
};

export type ServiceItem = {
	title: string;
	description: string;
	icon: LucideIcon;
};

export type ExperienceLink = {
	label: string;
	href: string;
};

export type ExperienceItem = {
	company: string;
	role: string;
	start: string;
	end: string;
	location?: string;
	bullets: string[];
	links?: ExperienceLink[];
	tech?: string[];
};

export type ProjectLinks = {
	live?: string;
	repo?: string;
	caseStudy?: string;
};

export type ProjectItem = {
	title: string;
	eyebrow?: string;
	description: string;
	tech: string[];
	image?: string;
	logo?: string;
	featured?: boolean;
	links: ProjectLinks;
	highlights?: string[];
};

export type EducationItem = {
	institute: string;
	degree: string;
	start: string;
	end: string;
	details?: string[];
};

export type AchievementItem = {
	title: string;
	issuer?: string;
	year?: string;
	link?: string;
};

export type TestimonialItem = {
	name: string;
	role?: string;
	company?: string;
	quote: string;
	rating?: number;
};

export type ArticleItem = {
	title: string;
	excerpt: string;
	author: string;
	date: string;
	readTime: string;
	category: string;
	href: string;
};

export type FaqItem = {
	question: string;
	answer: string;
};

export type SocialLink = {
	label: string;
	href: string;
	icon: LucideIcon;
	className?: string;
};

export type ContactInfoItem = {
	title: string;
	value: string;
	href?: string;
	icon: LucideIcon;
};

export type ThemeOption = {
	id: string;
	title: string;
	colors: string[];
};

export type ThemeSwitcherOption = {
	id: string;
	title: string;
	hint: string;
	colors: string[];
};

export type SeoData = {
	siteTitle: string;
	siteDescription: string;
	openGraphTitle?: string;
	openGraphDescription?: string;
	ogImage?: string;
	keywords: string[];
};

export type Profile = {
	basic: {
		fullName: string;
		displayName?: string;
		brandName?: string;
		headline: string;
		shortBio: string;
		location: string;
	};
	images: {
		avatar: string;
		avatarAlt: string;
		cover?: string;
	};
	contact: {
		email: string;
		phone?: string;
		whatsapp?: string;
		website?: string;
	};
	socials: {
		github: string;
		linkedin: string;
		twitter: string;
		instagram: string;
		facebook: string;
		youtube?: string;
	};
	resume?: {
		resumeUrl?: string;
		label?: string;
		ariaLabel?: string;
	};
	primaryCta: CtaLink;
	secondaryCta?: CtaLink;
	sections: NavItem[];
	hero: {
		welcome: string;
		greetingPrefix: string;
		subheading: string;
		scrollHint: string;
		socialLinks: SocialLink[];
	};
	stats: StatItem[];
	about: {
		title: string;
		longBio: string;
		intro?: {
			prefix: string;
			highlight: string;
			suffix: string;
		};
		paragraphs: string[];
		highlights: string[];
		summaryCards: AboutCard[];
	};
	services: {
		title: string;
		items: ServiceItem[];
	};
	experienceSection: {
		title: string;
		rangeSeparator: string;
		locationSeparator: string;
	};
	experience: ExperienceItem[];
	skills: {
		title: string;
		categories: SkillCategory[];
		itemPrefix?: string;
		proficiency: {
			title: string;
			items: SkillProficiency[];
		};
	};
	projectsSection: {
		title: string;
		cardSymbol: string;
		primaryActionLabel: string;
		secondaryActionLabel: string;
		fallbackLink: string;
	};
	projects: ProjectItem[];
	testimonialsSection?: {
		title: string;
		roleConnector?: string;
	};
	testimonials?: TestimonialItem[];
	articlesSection?: {
		title: string;
		readLabel: string;
		ctaLabel: string;
		ctaHref: string;
	};
	articles?: ArticleItem[];
	faqSection?: {
		title: string;
		intro: string;
		ctaLabel: string;
		ctaHref: string;
		ctaHelper: string;
	};
	faq?: FaqItem[];
	ctaSection: {
		badge: string;
		title: string;
		highlightWord: string;
		description: string;
		primaryAction: CtaLink;
		secondaryAction?: CtaLink;
		note?: string;
	};
	contactSection: {
		title: string;
		description: string;
		infoCards: ContactInfoItem[];
		form: {
			title: string;
			description: string;
			labels: {
				name: string;
				email: string;
				subject: string;
				message: string;
			};
			emailBody: {
				nameLabel: string;
				emailLabel: string;
				subjectLabel: string;
				messageLabel: string;
			};
			placeholders: {
				name: string;
				email: string;
				subject: string;
				message: string;
			};
			requiredIndicator: string;
			submitLabel: string;
			successMessage: string;
			validation: {
				required: string;
				invalidEmail: string;
			};
			defaultSubject: string;
		};
		socialTitle: string;
		socialLinks: SocialLink[];
	};
	footer: {
		brandName: string;
		tagline: string;
		quickLinksTitle: string;
		quickLinks: Array<{ label: string; href: string }>;
		socialTitle: string;
		socialLinks: SocialLink[];
		copyrightTemplate: string;
		madeWithPrefix: string;
		madeWithSuffix: string;
		backToTopLabel: string;
	};
	ui: {
		scrollToTopLabel: string;
		menuAriaLabel: string;
		closeMenuLabel: string;
		resumeAriaLabel: string;
		resumeIndicator: string;
		themeWidget: {
			label: string;
			toggleAriaLabel: string;
			options: ThemeOption[];
		};
		themeSwitcher: {
			label: string;
			titleSeparator: string;
			options: ThemeSwitcherOption[];
		};
	};
	seo: SeoData;
	education: EducationItem[];
	achievements?: AchievementItem[];
};
