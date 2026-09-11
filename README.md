<p align="center">
  <img src="./public/icon.svg" alt="ZQ monogram" width="56" height="56" />
</p>

<h1 align="center">Syed Zain Qalandar — Portfolio</h1>

<p align="center"><strong>Good interfaces. Better foundations.</strong></p>

<p align="center">
  <a href="https://www.zainqalandar.online/">Visit portfolio ↗</a>
  &nbsp; / &nbsp;
  <a href="https://github.com/Zainqalandar">GitHub</a>
  &nbsp; / &nbsp;
  <a href="https://www.linkedin.com/in/zainqalandar-online/">LinkedIn</a>
  &nbsp; / &nbsp;
  <a href="mailto:zainqlandar@gmail.com">Email</a>
</p>

A personal portfolio presenting my work as a frontend-focused full-stack developer: independent products, team contributions, technical skills, and professional experience.

The design carries the visual identity of my GitHub profile into the web: a dark forest-green background, pale lime accents, off-white serif headlines, and architectural illustrations, matching the dark GitHub profile header. One consistent dark green appearance is used across devices, independent of system color preferences, with no theme switcher or saved color modes.

## Inside the portfolio

- **Introduction:** an animated illustration of interface, application, and data layers, with links to selected work and my CV.
- **Selected work:** project illustrations, technology stacks, and descriptions of my contributions.
- **About and expertise:** background, development services, and an everyday toolkit.
- **Experience:** roles, responsibilities, and technologies used in professional and independent work.
- **FAQ:** native, keyboard-accessible accordions.
- **Contact:** social links, an email-copy button, and a form that prepares an email draft.

Responsive navigation tracks the active section. Subtle section reveals, scroll progress, and a return-to-top link support browsing. Animations respect reduced-motion preferences; the page content and FAQ remain accessible without JavaScript.

## Selected work

| Project | My involvement | Focus |
| --- | --- | --- |
| [Read Al Quran](https://www.readalquran.online/) | Independent full-stack product | Quran reading, translations, Tafseer, audio, saved progress, and an administration dashboard. |
| [ERPfy](https://admin.erpfy.app/sign-in) | Team contribution | Restaurant operations, KPI dashboards, reporting, analytics, and filters. |
| [Propteq](https://app.propteq.ai/auth/sign-in) | Team contribution | Real estate listings, search, agent assignments, and API integrations. |

ERPfy and Propteq links open their product sign-in pages.

## Built with

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 with the App Router and static export |
| Interface | React 19, JavaScript/JSX |
| Profile data | TypeScript types and required-field validation |
| Styling | CSS custom properties, responsive CSS, Tailwind CSS 4 |
| Animation | Framer Motion and CSS keyframes |
| Icons and artwork | Lucide React and local SVG illustrations |
| Code checks | ESLint with Next.js rules |

## Run locally

Use **Node.js 20.9 or newer** and npm. From the portfolio directory:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No backend, API keys, or environment variables are needed for the current site.

## Customize

The main content source is [`src/data/profile.ts`](./src/data/profile.ts). Update the relevant fields there before changing components.

| What to change | Profile fields |
| --- | --- |
| Name, role, introduction, and location | `basic`, `hero`, `about` |
| Contact details and social links | `contact`, `socials`, `contactSection` |
| Navigation and calls to action | `sections`, `primaryCta`, `secondaryCta` |
| CV link and download | `resume`, `primaryCta` |
| Projects and their illustrations | `projects`, `projectsSection` |
| Services, skills, and experience | `services`, `skills`, `experience` |
| Questions and answers | `faq`, `faqSection` |
| Headlines, labels, and footer text | `design`, section settings, `footer`, `ui` |
| Page metadata and social previews | `seo`, `contact.website` |

Some links and labels appear in multiple groups; keep related entries consistent. Adding a navigation entry does not create a new section: compose sections in [`src/app/page.js`](./src/app/page.js).

[`src/data/profile.example.ts`](./src/data/profile.example.ts) demonstrates overriding the profile shape. It inherits the existing profile, so replace inherited projects, social links, images, and personal details when adapting the portfolio for someone else. Keep the example separate from the live profile to avoid circular imports.

The palette, typography, spacing, breakpoints, and CSS animations live in [`src/app/globals.css`](./src/app/globals.css). Shared motion preferences live in [`MotionProvider.jsx`](./src/components/layout/MotionProvider.jsx).

### Assets

| Asset | Location |
| --- | --- |
| Portrait | [`public/images/profile.png`](./public/images/profile.png) |
| Project illustrations | [`public/images/projects/`](./public/images/projects/) |
| Current CV | [`public/pro/Zain_Qalandar_CV.pdf`](./public/pro/Zain_Qalandar_CV.pdf) |
| Favicon and monogram | [`public/icon.svg`](./public/icon.svg) |

Files inside `public/` are served from the site root. For example, `public/images/profile.png` is referenced as `/images/profile.png` in profile data.

## Project structure

```text
public/                  Portrait, project artwork, favicon, and CV files
src/
├── app/
│   ├── globals.css      Single design system and responsive styles
│   ├── layout.js        Metadata, skip link, and motion provider
│   └── page.js          Visible sections and page order
├── components/
│   ├── layout/          Header, footer, and shared motion preferences
│   ├── sections/        Hero, projects, about, expertise, FAQ, and contact
│   └── ui/              Section headings, reveals, and scroll controls
├── data/
│   ├── profile.ts       Live portfolio content
│   └── profile.example.ts
├── lib/                 Profile validation
└── types/               Profile TypeScript definitions
```

## Contact form behavior

The form validates the visitor’s name, email, subject, and message, then opens a `mailto:` draft in their email application. The visitor sends the message from that application. The portfolio itself does not send email or store submissions.

The status explains the draft action and keeps entered text in the form. A direct email link remains available if an email application is not configured. Sending messages directly from the site would require a separate email service or backend integration.

## Build and deployment

Run the code checks and create the production export:

```bash
npm run lint
npm run build
```

[`next.config.mjs`](./next.config.mjs) sets `output: "export"`. The generated **`out/`** directory contains the deployable site.

To preview that export locally:

```bash
npx serve out --listen 3000
```

For static hosting, use `npm ci` to install dependencies, `npm run build` as the build command, and `out` as the publish directory. Assets are configured for deployment at the domain root.

The existing `npm start` script runs `next start`, which is incompatible with this static-export configuration. The existing Docker files also use that command; serve the contents of `out/` when deploying this version.

---

Built by **Syed Zain Qalandar** in Sheikhupura, Pakistan.

[Start a conversation ↗](mailto:zainqlandar@gmail.com) · [Explore my repositories](https://github.com/Zainqalandar?tab=repositories)
