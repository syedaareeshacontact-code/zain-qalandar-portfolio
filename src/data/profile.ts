import {
	Award,
	BookOpen,
	Briefcase,
	Code,
	Code2,
	Github,
	Instagram,
	Linkedin,
	Mail,
	MapPin,
	Palette,
	Phone,
	ShieldCheck,
	Trophy,
	Twitter,
	Zap,
} from 'lucide-react';
import type { Profile } from '@/types/profile';

export const profile = {
	basic: {
		fullName: 'Syed Zain Qalandar',
		displayName: 'Syed Zain',
		brandName: 'Zain Qalandar',
		headline: 'Full-Stack Developer',
		shortBio:
			'Full-stack developer with 3 years of experience building web applications, SaaS dashboards, and secure APIs with React, Next.js, and the MERN stack.',
		location: 'Sheikhupura, Pakistan',
	},
	images: {
		avatar: '/images/profile.png',
		avatarAlt: 'Syed Zain Qalandar',
	},
	contact: {
		email: 'zainqlandar@gmail.com',
		phone: '0336-4157981',
		website: 'https://www.zainqalandar.online',
	},
	socials: {
		github: 'https://github.com/Zainqalandar',
		linkedin: 'https://www.linkedin.com/in/zainqalandar-online',
		twitter: 'https://twitter.com/zainqalandar',
		instagram: 'https://instagram.com/zainqalandar',
		facebook: '#',
	},
	resume: {
		resumeUrl: '/pro/Zain_Qalandar_CV.pdf',
		label: 'View CV',
		ariaLabel: 'Open resume in a new tab',
	},
	primaryCta: {
		label: 'Download CV',
		href: '/pro/Zain_Qalandar_CV.pdf',
		download: 'Zain_Qalandar_CV.pdf',
	},
	secondaryCta: {
		label: 'View projects',
		href: '#projects',
	},
	sections: [
		{ id: 'hero', label: 'Home', href: '#hero', showInNav: false },
		{ id: 'projects', label: 'Work', href: '#projects', showInNav: true },
		{ id: 'about', label: 'About', href: '#about', showInNav: true },
		{ id: 'services', label: 'Expertise', href: '#services', showInNav: true },
		{ id: 'skills', label: 'Skills', href: '#skills', showInNav: true },
		{ id: 'experience', label: 'Experience', href: '#experience', showInNav: true },
		{ id: 'faq', label: 'FAQ', href: '#faq', showInNav: false },
		{ id: 'contact', label: 'Contact', href: '#contact', showInNav: false },
	],
	hero: {
		welcome: 'Full-stack web development',
		greetingPrefix: "Hi, I’m",
		subheading:
			'I develop responsive web applications, SaaS dashboards, and secure APIs with React, Next.js, and Node.js. Three years of experience connecting polished interfaces with reliable backend systems.',
		scrollHint: 'Explore projects',
		stack: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
		socialLinks: [
			{
				label: 'GitHub',
				href: 'https://github.com/Zainqalandar',
				icon: Github,
				className:
					'w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/30 border border-green-500/20 text-green-300 hover:bg-green-600/10 transition',
			},
			{
				label: 'LinkedIn',
				href: 'https://www.linkedin.com/in/zainqalandar-online',
				icon: Linkedin,
				className:
					'w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/30 border border-blue-500/10 text-blue-300 hover:bg-blue-600/10 transition',
			},
			{
				label: 'Email',
				href: 'mailto:zainqlandar@gmail.com',
				icon: Mail,
				className:
					'w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/30 border border-emerald-500/10 text-emerald-300 hover:bg-emerald-600/10 transition',
			},
		],
	},
	stats: [
		{
			icon: Trophy,
			label: 'Years of Development Experience',
			value: 3,
			suffix: '',
			colorClass: 'from-yellow-500 to-orange-500',
		},
		{
			icon: Code2,
			label: 'Projects Contributed To',
			value: 50,
			suffix: '+',
			colorClass: 'from-blue-500 to-cyan-500',
		},
		{
			icon: BookOpen,
			label: 'Surahs on Read Al Quran',
			value: 114,
			suffix: '',
			colorClass: 'from-green-500 to-emerald-500',
		},
	],
	about: {
		title: 'Full-stack development, from UI to API.',
		longBio:
			'I’m Syed Zain Qalandar, a full-stack developer based in Sheikhupura, Pakistan. I build web products that bring together responsive interfaces, secure backend services, and practical business workflows.',
		intro: {
			prefix: "I'm a ",
			highlight: 'Full Stack Developer',
			suffix:
				' experienced in building scalable applications with Next.js, React.js, and MERN technologies. I create responsive, SEO-optimized interfaces using SSR, SSG, and ISR while integrating secure APIs and maintainable backend architecture.',
		},
		paragraphs: [
			'My work includes restaurant analytics, real estate CRM workflows, and Read Al Quran, an independent platform with a secure admin dashboard. Across these projects, I focus on reusable components, reliable data flows, and application performance.',
		],
		highlights: [
			'Advanced Next.js rendering with SSR, SSG, and ISR.',
			'Reusable React architecture and REST API integration.',
			'JWT authentication and role-based authorization.',
			'Performance, technical SEO, and responsive UX.',
		],
		summaryCards: [
			{ title: 'Education', value: 'BS Information Technology', detail: 'Punjab University · 2021–2025', icon: Award },
			{ title: 'Location', value: 'Sheikhupura, Pakistan', detail: 'Experience with remote teams', icon: MapPin },
			{ title: 'Experience', value: '3 years', detail: '50+ project contributions', icon: Briefcase },
		],
	},
	services: {
		title: 'Web development expertise.',
		items: [
			{
				icon: Code,
				title: 'Full-Stack Development',
				description:
					'Web applications built with React, Next.js, Node.js, and MongoDB, connecting reusable interfaces with database-driven functionality.',
			},
			{
				icon: Palette,
				title: 'Frontend Engineering',
				description:
					'Responsive interfaces translated from Figma into reusable components, with consistent styling and cross-browser support.',
			},
			{
				icon: ShieldCheck,
				title: 'APIs & Authentication',
				description:
					'REST APIs with JWT authentication, role-based permissions, input validation, and structured error handling.',
			},
			{
				icon: Zap,
				title: 'Performance Optimization',
				description:
					'Next.js rendering, code splitting, lazy loading, and image optimization for faster pages and stronger technical SEO.',
			},
		],
	},
	experienceSection: {
		title: 'Professional experience.',
		rangeSeparator: ' - ',
		locationSeparator: ' · ',
	},
	experience: [
		{
			role: 'Independent MERN Development',
			company: 'Independent Projects',
			start: 'Jan 2026',
			end: 'Present',
			location: 'Remote',
			bullets: [
				'Building full-stack applications that connect React and Next.js interfaces with Node.js, Express, and MongoDB services.',
				'Implementing secure REST APIs with JWT authentication, role-based access, validation, and structured error handling.',
			],
			tech: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT'],
		},
		{
			role: 'MERN Stack Developer',
			company: 'StepSharp Digital Pty Ltd',
			start: 'Jun 2025',
			end: 'May 2026',
			location: 'South Australia · Remote',
			bullets: [
				'Developed full-stack SaaS and business applications, including reusable dashboards, analytics, reports, and filtering workflows.',
				'Built and integrated REST APIs for authentication, authorization, CRUD operations, and MongoDB data management with Mongoose.',
				'Improved performance and SEO with Next.js rendering, dynamic imports, image optimization, and efficient state management.',
			],
			links: [{ label: 'Company', href: 'https://stepsharp.com/about-us/' }],
			tech: ['Next.js', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose'],
		},
		{
			role: 'Frontend Engineer',
			company: 'Kodestudio Company',
			start: 'Mar 2022',
			end: 'Feb 2024',
			location: 'Sheikhupura, Pakistan · On-site',
			bullets: [
				'Built responsive business websites and dashboard interfaces with React, Tailwind CSS, and Material UI, translating Figma designs into reusable components.',
				'Connected interfaces to REST APIs and managed application state, dynamic data, and cross-browser behavior.',
			],
			links: [{ label: 'Company', href: 'https://kodestudio.net/' }],
			tech: ['React.js', 'Tailwind CSS', 'Material UI', 'Figma to Code', 'REST APIs'],
		},
	],
	skills: {
		title: 'Technical skills.',
		description: 'The technologies I use to build interfaces, backend services, and complete web applications.',
		categories: [
			{
				title: 'Frontend',
				items: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React.js', 'Next.js'],
				notes: ['ES6+', 'SSR / SSG / ISR'],
			},
			{
				title: 'Backend & Databases',
				items: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'PostgreSQL'],
				notes: ['REST APIs', 'JWT authentication', 'Role-based access'],
			},
			{
				title: 'UI & Styling',
				items: ['Tailwind CSS', 'Chakra UI', 'Material UI', 'Framer Motion', 'Rizz UI', 'Figma'],
				notes: ['Figma to code', 'Responsive interfaces'],
			},
			{
				title: 'State & Data',
				items: ['Redux Toolkit', 'Context API', 'Axios', 'Zod', 'Forms'],
				notes: ['API integration', 'Form validation'],
			},
			{
				title: 'Tools & Deployment',
				items: ['Git', 'GitHub', 'Docker', 'Postman', 'Vercel', 'Render'],
			},
			{
				title: 'Code Quality & AI Tools',
				items: ['ESLint', 'Prettier', 'Stylelint', 'Cursor', 'OpenAI Codex'],
			},
		],
		itemPrefix: '✓',
		proficiency: {
			title: 'Proficiency Level',
			items: [],
		},
	},
	projectsSection: {
		title: 'Selected projects.',
		cardSymbol: '#',
		primaryActionLabel: 'Visit Live Project',
		secondaryActionLabel: 'Code',
		fallbackLink: '#',
	},
	projects: [
		{
			title: 'Read Al Quran',
			eyebrow: 'Independent product · Full-stack development',
			featured: true,
			description:
				'A full-stack Islamic learning platform for reading all 114 Surahs with Urdu and English translations, Tafseer, audio recitations, Hadith, bookmarks, favourites, and reading progress.',
			image: '/images/projects/read-al-quran.svg',
			logo: '/images/projects/read-al-quran-logo.png',
			tech: ['Next.js', 'React.js', 'TypeScript', 'MongoDB', 'Redux Toolkit', 'PWA'],
			highlights: [
				'Secure admin dashboard for users, analytics, feedback, reader activity, and broadcast notifications',
				'Technical SEO, structured data, optimized metadata, and XML sitemaps',
				'Responsive PWA with translations, Tafseer, audio recitations, and bookmarks',
			],
			links: {
				live: 'https://www.readalquran.online/',
			},
		},
		{
			title: 'ERPfy',
			eyebrow: 'Team contribution · Restaurant operations',
			image: '/images/projects/erpfy.svg',
			description:
				'Contributed to a large-scale platform managing restaurant sales, orders, reservations, inventory, transactions, and staff operations. Built KPI dashboards, reports, analytics, and location/date filters with server-side data fetching.',
			tech: ['Next.js', 'TypeScript', 'Redux Toolkit', 'Server-side Data', 'Dynamic Imports'],
			links: {
				live: 'https://admin.erpfy.app/sign-in',
			},
		},
		{
			title: 'Propteq',
			eyebrow: 'Team contribution · Real estate CRM',
			image: '/images/projects/propteq.svg',
			description:
				'Contributed to a real estate platform spanning listings, leads, enquiries, sales, marketing, contacts, and agency management. Built reusable listings, advanced search, filters, pagination, assignments, and API-integrated workflows.',
			tech: ['Next.js', 'TypeScript', 'SSR', 'Caching', 'REST APIs', 'Dynamic Imports'],
			links: {
				live: 'https://app.propteq.ai/auth/sign-in',
			},
		},
		{
			title: 'NeighborLend',
			eyebrow: 'Independent product · Community marketplace',
			image: '/images/projects/neighborlend.svg',
			description:
				'A full-stack community lending marketplace where neighbors can list useful items, discover nearby listings, and manage every stage of a borrowing request.',
			tech: ['Next.js 16', 'React 19', 'Express', 'MongoDB', 'TypeScript', 'Gemini AI'],
			highlights: [
				'JWT authentication with protected item management and owner workflows',
				'Search, category filters, pagination, and a full request lifecycle from pending to returned',
				'Gemini-powered item description enhancement for clearer listings',
			],
			links: {
				repo: 'https://github.com/Zainqalandar/NeighborLend',
			},
		},
		{
			title: 'ProofFolio',
			eyebrow: 'Independent product · Social proof platform',
			image: '/images/projects/prooffolio.svg',
			description:
				'A full-stack platform that helps freelancers turn completed work into case studies, collect client testimonials, and publish a credible public profile.',
			tech: ['Next.js 16', 'React 19', 'Express', 'MongoDB', 'Cloudinary', 'Gemini AI'],
			highlights: [
				'Case study management with screenshot uploads and Cloudinary image storage',
				'Shareable client links with testimonial approval and moderation workflows',
				'AI-assisted project stories and concise testimonial highlights for public profiles',
			],
			links: {
				repo: 'https://github.com/Zainqalandar/ProofFolio',
			},
		},
	],
	testimonialsSection: {
		title: 'What People Say',
		roleConnector: 'at',
	},
	testimonials: [
		{
			name: 'Ahmed Hassan',
			role: 'Project Manager',
			company: 'KodeStudio',
			quote:
				'Zain is an excellent developer with strong attention to detail. He consistently delivers high-quality code and is a pleasure to work with. His ability to convert designs into responsive interfaces is remarkable.',
			rating: 5,
		},
		{
			name: 'Fatima Khan',
			role: 'UI/UX Designer',
			company: 'Tech Innovations',
			quote:
				'Working with Zain was amazing. He understood the design vision perfectly and implemented it flawlessly. Very professional and communicative throughout the project.',
			rating: 5,
		},
		{
			name: 'Mustafa Ali',
			role: 'CTO',
			company: 'StartUp Pro',
			quote:
				'Zain demonstrates strong technical skills and problem-solving abilities. His experience with MERN stack is evident, and he brings fresh perspectives to development challenges.',
			rating: 5,
		},
	],
	articlesSection: {
		title: 'Latest Articles',
		readLabel: 'Read Article',
		ctaLabel: 'View All Articles',
		ctaHref: '#',
	},
	articles: [
		{
			title: 'Building Scalable React Applications',
			excerpt:
				'Learn how to structure your React projects for scalability, manage state effectively, and implement best practices for large-scale applications.',
			author: 'Zain Qalandar',
			date: 'Nov 28, 2024',
			readTime: '8 min read',
			category: 'React',
			href: '#',
		},
		{
			title: 'Next.js 15 Performance Optimization Tips',
			excerpt:
				'Discover the latest Next.js features and techniques to optimize your application for faster load times and better user experience.',
			author: 'Zain Qalandar',
			date: 'Nov 20, 2024',
			readTime: '12 min read',
			category: 'Next.js',
			href: '#',
		},
		{
			title: 'Tailwind CSS Best Practices',
			excerpt:
				'Master advanced Tailwind CSS techniques, utility-first workflow, and create consistent design systems using Tailwind components.',
			author: 'Zain Qalandar',
			date: 'Nov 10, 2024',
			readTime: '10 min read',
			category: 'Tailwind',
			href: '#',
		},
	],
	faqSection: {
		title: 'Frequently asked questions.',
		intro: 'Find answers to common questions about my services, process, and expertise.',
		ctaLabel: 'Get In Touch',
		ctaHref: '#contact',
		ctaHelper: 'Still have questions? Feel free to reach out!',
	},
	faq: [
		{
			question: 'What is your typical project timeline?',
			answer:
				'Project timelines vary depending on complexity and scope. A simple landing page might take 1-2 weeks, while a full-featured web application can take 2-3 months. I provide realistic estimates after understanding your requirements.',
		},
		{
			question: 'Do you offer maintenance and support?',
			answer:
				'Yes! I offer post-launch support and maintenance packages. This includes bug fixes, updates, performance optimization, and feature enhancements to keep your application running smoothly.',
		},
		{
			question: 'What technologies do you specialize in?',
			answer:
				"I specialize in the MERN stack (MongoDB, Express, React, Node.js) and modern tools like Next.js, Tailwind CSS, and Framer Motion. I'm always learning new technologies to provide the best solutions.",
		},
		{
			question: 'Can you work with existing codebases?',
			answer:
				"Absolutely! I can integrate with existing projects, refactor code, improve performance, or add new features to existing applications. I'm comfortable working with legacy code and modernizing it.",
		},
		{
			question: 'Do you sign NDAs?',
			answer:
				"Yes, I'm happy to sign NDAs and confidentiality agreements to protect your project information and intellectual property.",
		},
		{
			question: "What's your communication style?",
			answer:
				'I believe in clear and transparent communication. I provide regular updates, welcome feedback, and am available for meetings via video call, email, or messaging platforms as needed.',
		},
	],
	ctaSection: {
		badge: 'Ready to work together?',
		title: "Let's Build Something",
		highlightWord: 'Awesome',
		description:
			"Transform your ideas into extraordinary digital experiences. Let's collaborate and create solutions that stand out.",
		primaryAction: {
			label: 'Start a Conversation',
			href: 'mailto:zainqlandar@gmail.com',
		},
		secondaryAction: {
			label: 'View My Work',
			href: 'https://github.com/Zainqalandar',
		},
		note: '💡 Available for freelance & full-time opportunities',
	},
	contactSection: {
		title: 'Let’s discuss your project.',
		description:
			'For web development projects, product collaborations, or full-stack opportunities, get in touch with your requirements.',
		infoCards: [
			{
				title: 'Email',
				value: 'zainqlandar@gmail.com',
				href: 'mailto:zainqlandar@gmail.com',
				icon: Mail,
			},
			{
				title: 'Location',
				value: 'Sheikhupura, Pakistan',
				icon: MapPin,
			},
			{
				title: 'Phone',
				value: '0336-4157981',
				href: 'tel:+923364157981',
				icon: Phone,
			},
		],
		form: {
			title: 'Send me a message',
			description:
				"I'd love to hear about your project. Feel free to reach out and let's discuss how I can help.",
			labels: {
				name: 'Full Name',
				email: 'Email Address',
				subject: 'Subject',
				message: 'Message',
			},
			emailBody: {
				nameLabel: 'Name',
				emailLabel: 'Email',
				subjectLabel: 'Subject',
				messageLabel: 'Message',
			},
			placeholders: {
				name: 'John Doe',
				email: 'john@example.com',
				subject: 'What is this about?',
				message: 'Tell me more about your project or inquiry...',
			},
			requiredIndicator: '*',
			submitLabel: 'Create email draft',
			successMessage: "Your email app has been requested. Send the draft there to complete your message, or email me directly. Your details are kept here.",
			validation: {
				required: 'Please fill in all fields',
				invalidEmail: 'Please enter a valid email address',
			},
			defaultSubject: 'Portfolio Contact',
		},
		socialTitle: 'Connect With Me',
		socialLinks: [
			{
				label: 'GitHub',
				href: 'https://github.com/Zainqalandar',
				icon: Github,
				className: 'hover:text-white hover:bg-black/50',
			},
			{
				label: 'LinkedIn',
				href: 'https://www.linkedin.com/in/zainqalandar-online/',
				icon: Linkedin,
				className: 'hover:text-blue-400 hover:bg-blue-500/10',
			},
			{
				label: 'Twitter',
				href: 'https://twitter.com/zainqalandar',
				icon: Twitter,
				className: 'hover:text-blue-300 hover:bg-blue-500/10',
			},
		],
	},
	footer: {
		brandName: 'Syed Zain Qalandar',
		tagline: 'Full Stack Developer · React.js · Next.js · Node.js',
		quickLinksTitle: 'Quick Links',
		quickLinks: [
			{ label: 'About', href: '#about' },
			{ label: 'Projects', href: '#projects' },
			{ label: 'Contact', href: '#contact' },
		],
		socialTitle: 'Follow',
		socialLinks: [
			{
				label: 'Email',
				href: 'mailto:zainqlandar@gmail.com',
				icon: Mail,
				className:
					'p-3 rounded-lg border border-white/20 text-gray-400 hover:text-green-400 hover:border-green-500/50 transition-all duration-300',
			},
			{
				label: 'Instagram',
				href: 'https://instagram.com/zainqalandar',
				icon: Instagram,
				className:
					'p-3 rounded-lg border border-white/20 text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-all duration-300',
			},
			{
				label: 'GitHub',
				href: 'https://github.com/Zainqalandar',
				icon: Github,
				className:
					'p-3 rounded-lg border border-white/20 text-gray-400 hover:text-white hover:border-white/50 transition-all duration-300',
			},
		],
		copyrightTemplate:
			'© {year} Syed Zain Qalandar. All rights reserved.',
		madeWithPrefix: 'Thoughtfully built in' ,
		madeWithSuffix: 'Pakistan.',
		backToTopLabel: 'Back to top',
	},
	ui: {
		scrollToTopLabel: 'Scroll to top',
		menuAriaLabel: 'Open navigation',
		closeMenuLabel: 'Close menu',
		resumeAriaLabel: 'Open resume in a new tab',
		resumeIndicator: '→',
	},
	design: {
		monogram: 'ZQ',
		skipLink: 'Skip to content',
		navigationLabel: 'Main navigation',
		contactCta: 'Let’s talk',
		availability: 'Open to opportunities',
		heroTitle: 'Modern web apps.',
		heroAccent: 'Built end to end.',
		heroFootnote: 'React / Next.js / MERN',
		heroFocus: 'Web applications · APIs · Dashboards',
		architectureCaption: 'Frontend. Backend. Connected.',
		architectureLayers: ['Interface', 'Application', 'Data'],
		architectureTech: ['React / Next.js', 'Node.js / Express', 'MongoDB / PostgreSQL'],
		workLabel: 'Portfolio',
		workDescription: 'Independent products and contributions to SaaS platforms, with a focus on usable interfaces and reliable application workflows.',
		repositoriesLabel: 'More on GitHub',
		projectContribution: 'Key features & contributions',
		productSignIn: 'Open product sign-in',
		aboutLabel: 'About me',
		aboutNote: 'React · Next.js · MERN',
		resumeLabel: 'View full CV',
		expertiseLabel: 'Expertise',
		expertiseDescription: 'From frontend implementation to backend integration, I build the systems that support a complete web product.',
		toolkitLabel: 'Technology stack',
		experienceLabel: 'Career',
		faqLabel: 'Working together',
		contactLabel: 'Contact',
		contactAccent: 'Let’s work together.',
		contactNote: 'Available for full-stack roles, web development projects, and product collaborations.',
		formNote: 'This opens a draft in your email app. Nothing is sent automatically.',
		copyEmail: 'Copy email address',
		copiedEmail: 'Email copied',
		copyFailed: 'Couldn’t copy. You can select the email address above.',
	},
	seo: {
		siteTitle: 'Syed Zain Qalandar — Full Stack Developer | React & Next.js',
		siteDescription:
			'Syed Zain Qalandar is a full-stack developer with 3 years of experience in React, Next.js, Node.js, Express, and MongoDB. Explore SaaS dashboards, web applications, and secure API development.',
		openGraphTitle: 'Syed Zain Qalandar — Full-Stack Developer',
		openGraphDescription:
			'Building scalable, high-performance web products with React, Next.js, and the MERN stack.',
		ogImage: '/images/profile.png',
		keywords: [
			'MERN stack',
			'React developer',
			'Next.js',
			'Full-stack',
			'Web developer',
			'Tailwind CSS',
		],
	},
	education: [
		{
			institute: 'Punjab University',
			degree: 'BS Information Technology',
			start: '2021',
			end: '2025',
		},
		{
			institute: 'Hajvery University, Sheikhupura',
			degree: 'Intermediate in Computer Science (ICS)',
			start: '2018',
			end: '2020',
		},
	],
} as const satisfies Profile;
