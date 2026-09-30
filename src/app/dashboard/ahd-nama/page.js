import AhdNamaUpload from '@/components/dashboard/AhdNamaUpload';
import AhdNamaLockScreen from '@/components/dashboard/AhdNamaLockScreen';
import DashboardHero from '@/components/dashboard/DashboardHero';
import { isAhdNamaUnlocked } from '@/lib/ahdNamaLock';

export const metadata = {
  title: 'Ahd Nama | Barakah',
};

export const dynamic = 'force-dynamic';

export default async function AhdNamaPage() {
  const isUnlocked = await isAhdNamaUnlocked();

  return (
    <section className="bk-ahd-nama" aria-labelledby="ahd-nama-title">
      <DashboardHero
        title="Ahd Nama"
        subtitle="A quiet promise to keep faith, character, and work in the right order."
        image="/images/barakah/hero/ahd-nama-hero.webp"
      />
      {isUnlocked ? <AhdNamaUpload /> : <AhdNamaLockScreen />}
    </section>
  );
}
