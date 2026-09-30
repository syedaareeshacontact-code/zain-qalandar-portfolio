import DashboardHero from '@/components/dashboard/DashboardHero';
import NotesLibrary from '@/components/dashboard/NotesLibrary';

export const metadata = { title: 'Notes | Barakah' };

export default function NotesPage() {
  return (
    <section className="bk-notes-page" aria-labelledby="notes-title">
      <DashboardHero title="Notes" subtitle="Organize every useful PDF into a library that stays simple to browse." image="/images/barakah/hero/notes-hero.webp" />
      <NotesLibrary />
    </section>
  );
}
