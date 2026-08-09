import {
	Award,
	Activity,
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
	Smartphone,
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
		headline: 'Full Stack Developer',
		shortBio:
			'Frontend-focused Full Stack Developer building scalable, SEO-optimized products with Next.js, React, Node.js, and MongoDB.',
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
		label: 'See my work',
		href: '#projects',
	},
	sections: [
		{ id: 'hero', label: 'Hero', href: '#hero', showInNav: false, showInHighlight: true },
		{ id: 'about', label: 'About', href: '#about', showInNav: true, showInHighlight: true },
		{ id: 'services', label: 'Services', href: '#services', showInNav: true, showInHighlight: true },
		{ id: 'experience', label: 'Experience', href: '#experience', showInNav: true, showInHighlight: true },
		{ id: 'skills', label: 'Skills', href: '#skills', showInNav: true, showInHighlight: true },
		{ id: 'projects', label: 'Projects', href: '#projects', showInNav: true, showInHighlight: true },
		{ id: 'faq', label: 'FAQ', href: '#faq', showInNav: false, showInHighlight: true },
		{ id: 'contact', label: 'Contact', href: '#contact', showInNav: true, showInHighlight: true },
	],
	hero: {
		welcome: 'Next.js • React.js • Node.js • MongoDB',
		greetingPrefix: "Hello, my name's",
		subheading:
			'I build scalable, high-performance web applications with modern rendering, reusable architecture, secure APIs, and user-focused interfaces.',
		scrollHint: 'Scroll down',
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
			icon: Code2,
			label: 'Projects Contributed To',
			value: 50,
			suffix: '+',
			colorClass: 'from-blue-500 to-cyan-500',
		},
		{
			icon: Activity,
			label: 'ReadAlQuran Daily Users',
			value: 60,
			suffix: '–70',
			colorClass: 'from-purple-500 to-pink-500',
		},
		{
			icon: Trophy,
			label: 'Years in Web Development',
			value: 4,
			suffix: '+',
			colorClass: 'from-yellow-500 to-orange-500',
		},
		{
			icon: BookOpen,
			label: 'Quran Surahs Available',
			value: 114,
			suffix: '',
			colorClass: 'from-green-500 to-emerald-500',
		},
	],
	about: {
		title: 'About Me',
		longBio:
			'I am a frontend-focused Full Stack Developer experienced in building scalable web applications with Next.js, React.js, and the MERN stack.',
		intro: {
			prefix: "I'm a passionate ",
			highlight: 'frontend-focused Full Stack Developer',
			suffix:
				' experienced in building scalable applications with Next.js, React.js, and MERN technologies. I create responsive, SEO-optimized interfaces using SSR, SSG, and ISR while integrating secure APIs and maintainable backend architecture.',
		},
		paragraphs: [
			'I enjoy turning Figma designs into pixel-perfect products, optimizing performance with code splitting and image optimization, and delivering clean, reusable component systems backed by reliable data flows.',
		],
		highlights: [
			'Advanced Next.js rendering with SSR, SSG, and ISR.',
			'Reusable React architecture and REST API integration.',
			'JWT authentication and role-based authorization.',
			'Performance, technical SEO, and responsive UX.',
		],
		summaryCards: [
			{ title: 'Education', value: 'BS Information Technology', icon: Award },
			{ title: 'Location', value: 'Sheikhupura, Pakistan', icon: MapPin },
			{ title: 'Availability', value: 'Remote / Hybrid', icon: Briefcase },
		],
	},
	services: {
		title: 'Services & Expertise',
		items: [
			{
				icon: Code,
				title: 'Full-Stack Development',
				description:
					'End-to-end web application development using MERN stack with scalable architecture and best practices.',
			},
			{
				icon: Palette,
				title: 'UI/UX Implementation',
				description:
					'Converting Figma designs into responsive, pixel-perfect React and Next.js components with smooth animations.',
			},
			{
				icon: Smartphone,
				title: 'Responsive Design',
				description:
					'Mobile-first approach ensuring your application looks and functions beautifully on all devices and screen sizes.',
			},
			{
				icon: Zap,
				title: 'Performance Optimization',
				description:
					'Optimizing applications for speed and efficiency through code splitting, lazy loading, and caching strategies.',
			},
		],
	},
	experienceSection: {
		title: 'Professional Experience',
		rangeSeparator: ' - ',
		locationSeparator: ' · ',
	},
	experience: [
		{
			role: 'Next.js Developer',
			company: 'StepSharp Digital Pty Ltd',
			start: 'Jun 2025',
			end: 'May 2026',
			location: 'South Australia · Remote',
			bullets: [
				'Developed scalable admin dashboards with the Next.js App Router, reusable components, REST API integrations, and resilient loading and error states.',
				'Applied SSR, SSG, and ISR for performance and SEO, then improved stability through code splitting, lazy loading, efficient state management, and Next/Image optimization.',
			],
			links: [{ label: 'Company', href: 'https://stepsharp.com/about-us/' }],
			tech: ['Next.js', 'React.js', 'REST APIs', 'SSR', 'SSG', 'ISR', 'Next/Image'],
		},
		{
			role: 'Frontend Engineer',
			company: 'Kodestudio Company',
			start: 'Mar 2022',
			end: 'Feb 2024',
			location: 'Sheikhupura, Pakistan · On-site',
			bullets: [
				'Developed responsive, pixel-perfect React interfaces with Tailwind CSS and Material UI, converting Figma designs into cross-browser compatible products.',
				'Integrated REST APIs and managed application state with efficient, reusable data-handling patterns.',
			],
			links: [{ label: 'Company', href: 'https://kodestudio.net/' }],
			tech: ['React.js', 'Tailwind CSS', 'Material UI', 'Figma to Code', 'REST APIs'],
		},
		{
			role: 'Backend Development (MERN)',
			company: 'Self-Driven Projects',
			start: 'Jan 2026',
			end: 'Present',
			location: 'Remote',
			bullets: [
				'Built RESTful APIs with Node.js, Express.js, and MongoDB, including JWT authentication, role-based authorization, middleware, validation, and robust error handling.',
			],
			tech: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'REST APIs'],
		}
	],
	skills: {
		title: 'Technical Skills',
		categories: [
			{
				title: 'Frontend',
				items: ['JavaScript (ES6+)', 'TypeScript', 'React.js', 'Next.js (App & Pages Router)', 'SSR / SSG / ISR'],
			},
			{
				title: 'UI, State & Data',
				items: ['Tailwind CSS', 'Chakra UI', 'Material UI', 'Framer Motion', 'Redux Toolkit', 'REST APIs', 'Axios', 'Zod'],
			},
			{
				title: 'Backend & Tools',
				items: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Appwrite', 'Git & GitHub', 'Docker', 'Postman', 'Vercel', 'Render'],
			},
		],
		itemPrefix: '✓',
		proficiency: {
			title: 'Proficiency Level',
			items: [
				{ name: 'React & Next.js', level: 95 },
				{ name: 'Tailwind CSS', level: 95 },
				{ name: 'JavaScript & TypeScript', level: 88 },
				{ name: 'REST APIs & State Management', level: 85 },
				{ name: 'Node.js, Express & MongoDB', level: 72 },
			],
		},
	},
	projectsSection: {
		title: 'Selected Projects',
		cardSymbol: '#',
		primaryActionLabel: 'Visit Live Project',
		secondaryActionLabel: 'Code',
		fallbackLink: '#',
	},
	projects: [
		{
			title: 'Read Al Quran',
			eyebrow: 'Flagship Full-Stack Project',
			featured: true,
			description:
				'A full-stack Islamic learning platform for reading all 114 Surahs with Urdu and English translations, Tafseer, audio recitations, Hadith, bookmarks, favourites, and reading progress.',
			image: '/images/projects/read-al-quran-preview.png',
			logo: '/images/projects/read-al-quran-logo.png',
			tech: ['Next.js', 'React.js', 'TypeScript', 'MongoDB', 'Redux Toolkit', 'PWA'],
			highlights: [
				'Secure admin dashboard for users, analytics, feedback, reader activity, and broadcast notifications',
				'Technical SEO, structured data, optimized metadata, and XML sitemaps',
				'Responsive PWA experience generating consistent traffic of 60–70 daily users',
			],
			links: {
				live: 'https://www.readalquran.online/',
			},
		},
		{
			title: 'ERPfy',
			eyebrow: 'Restaurant Management & Analytics SaaS',
			description:
				'Contributed to a large-scale platform managing restaurant sales, orders, reservations, inventory, transactions, and staff operations. Built KPI dashboards, reports, analytics, and location/date filters with server-side data fetching.',
			tech: ['Next.js', 'TypeScript', 'Redux Toolkit', 'Server-side Data', 'Dynamic Imports'],
			links: {
				live: 'https://admin.erpfy.app/sign-in',
			},
		},
		{
			title: 'Propteq',
			eyebrow: 'Real Estate CRM & Property Management SaaS',
			description:
				'Contributed to a real estate platform spanning listings, leads, enquiries, sales, marketing, contacts, and agency management. Built reusable listings, advanced search, filters, pagination, assignments, and API-integrated workflows.',
			tech: ['Next.js', 'TypeScript', 'SSR', 'Caching', 'REST APIs', 'Dynamic Imports'],
			links: {
				live: 'https://app.propteq.ai/auth/sign-in',
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
		title: 'Frequently Asked Questions',
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
		title: 'Get In Touch',
		description:
			"Have a question or proposal? I'd love to hear from you. Send me a message and I'll get back to you as soon as possible.",
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
				title: 'Response Time',
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
			submitLabel: 'Send Message',
			successMessage: "Message sent successfully! I'll get back to you soon.",
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
		madeWithPrefix: 'Made with',
		madeWithSuffix: 'using Next.js & Framer Motion',
		backToTopLabel: 'Back to top',
	},
	ui: {
		scrollToTopLabel: 'Scroll to top',
		menuAriaLabel: 'menu',
		closeMenuLabel: 'Close menu',
		resumeAriaLabel: 'Open resume in a new tab',
		resumeIndicator: '→',
		themeWidget: {
			label: 'Theme',
			toggleAriaLabel: 'Open theme switcher',
			options: [
				{
					id: 'dark',
					title: 'Dark',
					colors: ['#0f172a', '#064e3b', '#0d3d2c'],
				},
				{
					id: 'midnight',
					title: 'Midnight',
					colors: ['#0b1020', '#071229', '#00121a'],
				},
			],
		},
		themeSwitcher: {
			label: 'Theme',
			titleSeparator: ' — ',
			options: [
				{ id: 'dark', title: 'Dark', hint: 'Default', colors: ['#0f172a', '#064e3b', '#0d3d2c'] },
				{ id: 'light', title: 'Light', hint: 'Bright', colors: ['#f8fafc', '#eef2ff', '#f0f9ff'] },
				{ id: 'solar', title: 'Solar', hint: 'Warm', colors: ['#fff7ed', '#ffedd5', '#fff1e0'] },
				{ id: 'midnight', title: 'Midnight', hint: 'Violet', colors: ['#0b1020', '#071229', '#00121a'] },
			],
		},
	},
	seo: {
		siteTitle: 'Syed Zain Qalandar — Full Stack Developer | React & Next.js',
		siteDescription:
			'Frontend-focused Full Stack Developer building scalable, SEO-optimized web applications with Next.js, React.js, Node.js, Express.js, and MongoDB.',
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
			institute: 'Punjab University (Aff.)',
			degree: 'BS Information Technology',
			start: '2021',
			end: 'Present',
		},
	],
} as const satisfies Profile;
