import AhdNamaUpload from '@/components/dashboard/AhdNamaUpload';
import DashboardHero from '@/components/dashboard/DashboardHero';

export const metadata = {
  title: 'Ahd Nama | Barakah',
};

export default function AhdNamaPage() {
  return (
    <section className="bk-ahd-nama" aria-labelledby="ahd-nama-title">
      <DashboardHero
        title="Ahd Nama"
        subtitle="A quiet promise to keep faith, character, and work in the right order."
        image="/images/barakah/hero/ahd-nama-hero.webp"
      />
      <AhdNamaUpload />
    </section>
  );
}
