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
- **Selected work:** projects managed from the dashboard, with stack/category filters, cover images, skills, dates, and live/source links.
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
| Framework | Next.js 16 with the App Router and Route Handlers |
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

Open [localhost:3000](http://localhost:3000). The Ahd Nama upload feature uses the server-side environment variables below:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Uploads are sent to `POST /api/uploads` as `multipart/form-data` using the `file` field. The API validates file type and size, stores the asset in Cloudinary, and records its metadata in MongoDB.

## Customize

The main content source is [`src/data/profile.ts`](./src/data/profile.ts). Update the relevant fields there before changing components.

| What to change | Profile fields |
| --- | --- |
| Name, role, introduction, and location | `basic`, `hero`, `about` |
| Contact details and social links | `contact`, `socials`, `contactSection` |
| Navigation and calls to action | `sections`, `primaryCta`, `secondaryCta` |
| CV link and download | `resume`, `primaryCta` |
| Project headings and initial seed content | `projectsSection`, `projects` (manage saved projects at `/dashboard/manage`) |
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

## Dynamic Barakah dashboard

### Personal workspace

The dashboard now includes a personal workspace alongside the prayer routine. Open `/dashboard/overview` from the **Workspace** navigation item for the same widgets in a dedicated view:

- **Focus timer:** 25-minute focus, 50-minute deep work, or a 5-minute break, with start, pause, resume, reset, an optional task, and a distraction-free focus view. The timer uses its scheduled finish time, so it survives refreshes and background tabs. Completed work sessions appear in the weekly chart; breaks are excluded.
- **Priority tasks:** switch between today (including overdue), starred, or all pending tasks, and complete a task directly from the dashboard. Completion uses the existing task API, including its recurring-task behavior.
- **Weekly momentum:** browse the last year of weeks, compare completed focus minutes and tasks, and select a day for details. Charts use real task completions and recorded focus sessions, with explicit loading and failure states.
- **Daily habits:** add up to 12 personal habits, check them off, and see consecutive-day streaks and the last seven days of activity. Today's unchecked habit preserves yesterday's streak until the day is over.
- **Quick capture:** create a task in an existing list with priority and an optional today deadline. Successful saves appear immediately in the shared task board; failed saves keep the draft.
- **Daily reflection:** record your mood and a short reflection, with a fresh entry each day. **Daily review** downloads a text summary of your focus, completed tasks, habits, and saved reflection.
- **Customize:** show or hide individual widgets; hidden timers continue running. Preferences persist when switching between the dashboard and workspace view.

Habits, focus sessions, reflections, and widget preferences are stored locally under `barakah.workspace.v1`, with bounded history and a warning when storage is unavailable. These records are not synced to MongoDB. Tasks continue to use the existing database. Workspace dates consistently use `Asia/Karachi`, independent of the selected prayer city. The timer's completed session is attributed to its scheduled completion date, even if you return on a later day.

Run the timer persistence, duplicate completion, midnight, streak, chart, and storage-recovery checks:

```bash
npm run test:dashboard
```

### Portfolio project manager

Open `/dashboard/manage` to add, edit, and delete projects and create, rename, or delete categories for any stack. Each project supports a title, description, category, comma-separated skills, project date, live link, source code link, optional cover image, and a featured toggle. Featured projects appear first with a larger card. Category filters on the homepage show all projects in the selected stack.

MongoDB stores projects in `portfolioProjects`, categories in `portfolioProjectCategories`, and a one-time initialization marker in `portfolioProjectConfig`. The first load imports the five existing profile projects and adds five clearly labeled demo projects across MERN, Next.js, React, and Python. Deleting demo projects does not seed them again. After initialization, edit projects through Manage; changes to `profile.projects` only affect the fallback content.

JPG, PNG, and WEBP covers up to 10 MB are uploaded to Cloudinary under `portfolio/projects` when a project is saved. Image replacement/removal and project deletion clean up managed cover assets. A local SVG cover is used when no image is provided or an image fails to load. Deleting a category preserves its projects under Uncategorized. Project/category counts have no application-level limit.

`GET /api/projects` returns the portfolio workspace; `POST`, `PATCH ?id=…`, and `DELETE ?id=…` manage projects. Save using JSON, or multipart form data with a JSON `project` field and optional `image` file. `POST`, `PATCH ?id=…`, and `DELETE ?id=…` on `/api/project-categories` manage category names. Saves invalidate the homepage, so new requests show the latest work. MongoDB and the existing Cloudinary environment variables above are required for management and image uploads.

Run project input, URL, date, category, and image validation checks:

```bash
npm run test:projects
```

### Prayer routine

`/dashboard` follows the current prayer routine with changing hero scenery, contextual reminders, and a live next-prayer countdown. Header search opens workspace pages (`Ctrl` / `⌘ K`); the bell shows prayer and task reminders. The profile menu lists navigation shortcuts. Each hero has page-specific Arabic ayah excerpts with links to the full verse on Quran.com; reminders change with the day or prayer block, and the refresh button shows another ayah.

Prayer times come from AlAdhan through `/api/prayer-times?city=lahore`. Lahore is the default; the city selector supports Pakistan and international cities and remembers the selection in this browser. Pakistan cities use Karachi calculation / Hanafi Asr. Each location uses its own timezone and calculation method. The schedule is checked every five minutes, the clock and active block update every 15 seconds and on returning to the tab, and dates refresh at midnight. Fetches have a 12-second timeout and failures expose a Retry button. The Fajr prayer indicator ends at sunrise; the Fajr → Dhuhr **work routine** continues until Dhuhr.

Daily intentions and the light/dark preference are saved in browser storage. The intention starts fresh each day; it is not synced to the database. Existing task due dates and attendance remain based on the Pakistan workspace calendar. Prayer times are calculated start times, rather than local mosque congregation times.

Run the prayer boundary, sunrise, overnight, timezone, and invalid-data checks:

```bash
npm run test:prayer
```

### Goals workspace

`/dashboard/goals` saves goals, pins, descriptions, priorities, target dates, and milestones in MongoDB. Pins stay first in every live view. Priority changes the card accent, title, badge, and progress color in both themes. Search includes descriptions and milestone titles; category, priority, sorting, grid/list, completed, pinned, and overdue views help organize the workspace.

The description editor supports bold, italic, strikethrough, headings, bullet/numbered lists, quotes, inline code, and links, with Write/Preview modes and Ctrl/⌘ B and I shortcuts. Descriptions allow up to 12,000 characters. Existing descriptions remain plain text until formatting is deliberately applied. HTML and images are not rendered, and links accept only HTTP, HTTPS, and mailto destinations.

Optional milestones calculate progress from checked steps. Completing all steps completes the goal; Reopen unchecks the last completed step. Goals without milestones retain manual progress. Removing the final milestone keeps the current progress available for manual adjustment.

Delete now moves the complete document to Trash using `deletedAt`; Restore returns its description, milestones, progress, pin, and priority. There is no automatic purge. This protects future removals; it does not recreate documents permanently deleted before this update. Editing and deleting also check `updatedAt` to prevent stale tabs from overwriting newer changes. If an edit conflicts, its draft can be saved as a new goal to keep both versions.

Unsaved forms, including a pending milestone, are stored on the current device under `barakah.goals.drafts.v1` (up to 20 drafts). Close keeps the draft; Discard draft removes it. Drafts are not synced to MongoDB until Save. Grid/list preference uses `barakah.goals.view.v1`. Export downloads the loaded workspace as JSON, including Trash. The workspace loads up to 500 live and 500 trashed goals. Dates use `Asia/Karachi`.

`GET /api/goals` returns live goals; `?view=trash` returns removed goals and `?view=workspace` returns both. `PATCH` accepts `pinned`, `descriptionFormat`, `milestones`, and optional `expectedUpdatedAt`, alongside the existing fields. `PATCH { id, action: 'restore' }` restores a goal; `DELETE ?id=…` preserves it in Trash. Old records need no migration.

Run the validation and API preservation checks (using an in-memory database, without accessing the live database):

```bash
npm run test:goals
```

## Build and deployment

Run the code checks and create the production build:

```bash
npm run lint
npm run build
```

The application runs as a Next.js server because the upload Route Handler needs a Node.js runtime. Configure the four environment variables above in your deployment platform before running `npm start`.

For Google Calendar in production, also configure `JWT_SECRET` with the same long random value across deployments and set `GOOGLE_REDIRECT_URI` to `https://zainqalandar.online/api/auth/google/callback`. Add that exact URL under Google Cloud Console → OAuth client → Authorized redirect URIs. Set these variables for Vercel's **Production** environment, then redeploy.

---

Built by **Syed Zain Qalandar** in Sheikhupura, Pakistan.

[Start a conversation ↗](mailto:zainqlandar@gmail.com) · [Explore my repositories](https://github.com/Zainqalandar?tab=repositories)
