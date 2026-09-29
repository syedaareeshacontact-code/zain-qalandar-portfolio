import BarakahPage from '@/components/dashboard/BarakahPage';

export const metadata = { title: 'Calendar | Barakah' };

export default function CalendarPage() {
  return (
    <BarakahPage
      title="Calendar"
      subtitle="Plan the day around salah, then place work in the remaining windows."
      items={[
        { kicker: 'Rhythm', title: 'Five anchors', body: 'Fajr, Dhuhr, Asr, Maghrib, and Isha set the shape of the calendar.' },
        { kicker: 'Work', title: 'Protected mornings', body: 'Keep 5:00 AM to 12:00 PM clear for deep, high-energy work.' },
        { kicker: 'Evening', title: 'Review and decide', body: 'Use Maghrib to Isha for review, then Isha to 10 PM for tomorrow’s plan.' },
      ]}
    />
  );
}
