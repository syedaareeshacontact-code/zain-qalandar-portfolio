import DashboardHero from '@/components/dashboard/DashboardHero';
import NotesLibrary from '@/components/dashboard/NotesLibrary';

export const metadata = { title: 'Notes | Barakah' };

export default function NotesPage() {
  return (
    <section className="bk-notes-page" aria-labelledby="notes-title">
      <DashboardHero title="Notes" subtitle="Keep your PDFs organized in folders and subfolders, however deep you need." image="/images/barakah/hero/notes-hero.webp" />
      <NotesLibrary />
    </section>
  );
}
