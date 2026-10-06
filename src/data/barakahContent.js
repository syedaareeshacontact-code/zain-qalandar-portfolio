// Short excerpts from The Clear Quran, with links to the full verse on Quran.com.
export const AYAT = {
  prayer: { arabic: 'وَأَقِمِ الصَّلَاةَ لِذِكْرِي', text: 'and establish prayer for My remembrance.', reference: '20:14', excerpt: true },
  patience: { arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', text: 'Allah is truly with those who are patient.', reference: '2:153', excerpt: true },
  peace: { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', text: 'Surely in the remembrance of Allah do hearts find comfort.', reference: '13:28', excerpt: true },
  gratitude: { arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', text: 'If you are grateful, I will certainly give you more.', reference: '14:7', excerpt: true },
  rest: { arabic: 'وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', text: 'and made your sleep for rest,', reference: '78:9' },
  knowledge: { arabic: 'رَّبِّ زِدْنِي عِلْمًا', text: 'My Lord! Increase me in knowledge.', reference: '20:114', excerpt: true },
  effort: { arabic: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ', text: 'and that each person will only have what they endeavoured towards,', reference: '53:39' },
  ease: { arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', text: 'So, surely with hardship comes ease.', reference: '94:5' },
  promise: { arabic: 'وَأَوْفُوا بِالْعَهْدِ', text: 'Honour ˹your˺ pledges, for you will surely be accountable for them.', reference: '17:34', excerpt: true },
  remembrance: { arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ', text: 'remember Me; I will remember you.', reference: '2:152', excerpt: true },
};

export const PRAYER_MOMENTS = [
  { label: 'Fajr → Dhuhr', title: 'Make room for your best work.', description: 'A fresh start. Choose one meaningful priority and give it your full attention.', action: 'Choose a task', href: '/dashboard/tasks', ayah: 'prayer' },
  { label: 'Dhuhr → Asr', title: 'Small steps. Steady progress.', description: 'Take care of lighter tasks, conversations, and the details that keep life moving.', action: 'Open your tasks', href: '/dashboard/tasks', ayah: 'patience' },
  { label: 'Asr → Maghrib', title: 'Pause with purpose.', description: 'Step away from work. Make space for worship, a walk, or time with family.', action: 'Read a note', href: '/dashboard/notes', ayah: 'peace' },
  { label: 'Maghrib → Isha', title: 'Reflect on what went well.', description: 'Notice your progress, be grateful, and gently close the loops from today.', action: 'Review your goals', href: '/dashboard/goals', ayah: 'gratitude' },
  { label: 'Isha → Fajr', title: 'End gently. Begin with intention.', description: 'Set one priority for tomorrow, then give yourself permission to rest.', action: 'Plan tomorrow', href: '/dashboard/tasks', ayah: 'rest' },
];

export const HERO_CONTENT = {
  Tasks: { kicker: 'INTENTION INTO ACTION', ayat: ['effort', 'patience', 'ease'], messages: ['One meaningful task is a good beginning.', 'Take the next small step, with a clear intention.', 'Progress grows from the things you finish.'] },
  Notes: { kicker: 'A SPACE TO LEARN', ayat: ['knowledge', 'remembrance', 'peace'], messages: ['Keep what you learn close. Return to it often.', 'A useful note today can bring clarity tomorrow.', 'Make room for ideas worth remembering.'] },
  Goals: { kicker: 'PURPOSE OVER PACE', ayat: ['ease', 'effort', 'gratitude'], messages: ['Choose a direction that matters, then take one step.', 'Build a life of meaningful, consistent progress.', 'Notice how far you have come. Keep going gently.'] },
  'Ahd Nama': { kicker: 'A PROMISE TO RETURN TO', ayat: ['promise', 'remembrance', 'prayer'], messages: ['Let your commitments guide the choices you make today.', 'Return to your promise with a renewed intention.', 'Keep faith, character, and action moving together.'] },
};

export function getDailySeed(dateKey) {
  return dateKey ? Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000) : 0;
}
