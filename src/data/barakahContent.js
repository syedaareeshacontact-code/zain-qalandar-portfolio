// Short Quranic passages with Urdu meanings and links to their full verse on Quran.com.
export const AYAT = {
  prayer: { arabic: 'وَأَقِمِ الصَّلَاةَ لِذِكْرِي', text: 'اور میری یاد کے لیے نماز قائم کرو۔', reference: '20:14' },
  patience: { arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', text: 'بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔', reference: '2:153' },
  peace: { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', text: 'سن لو! اللہ کے ذکر سے دلوں کو اطمینان ملتا ہے۔', reference: '13:28' },
  gratitude: { arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', text: 'اگر تم شکر کرو گے تو میں تمہیں اور زیادہ دوں گا۔', reference: '14:7' },
  rest: { arabic: 'وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', text: 'اور ہم نے تمہاری نیند کو آرام کا ذریعہ بنایا۔', reference: '78:9' },
  knowledge: { arabic: 'رَّبِّ زِدْنِي عِلْمًا', text: 'اے میرے رب! میرے علم میں اضافہ فرما۔', reference: '20:114' },
  effort: { arabic: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ', text: 'اور یہ کہ انسان کے لیے وہی ہے جس کی اس نے کوشش کی۔', reference: '53:39' },
  ease: { arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', text: 'پس بے شک مشکل کے ساتھ آسانی ہے۔', reference: '94:5' },
  promise: { arabic: 'وَأَوْفُوا بِالْعَهْدِ', text: 'اور عہد کو پورا کرو۔', reference: '17:34' },
  remembrance: { arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ', text: 'تم مجھے یاد کرو، میں تمہیں یاد کروں گا۔', reference: '2:152' },
};

export const PRAYER_MOMENTS = [
  { label: 'Fajr → Dhuhr', title: 'Make room for your best work.', description: 'A fresh start. Choose one meaningful priority and give it your full attention.', action: 'Choose a task', href: '/dashboard/tasks', ayah: 'prayer' },
  { label: 'Dhuhr → Asr', title: 'Small steps. Steady progress.', description: 'Take care of lighter tasks, conversations, and the details that keep life moving.', action: 'Open your tasks', href: '/dashboard/tasks', ayah: 'patience' },
  { label: 'Asr → Maghrib', title: 'Pause with purpose.', description: 'Step away from work. Make space for worship, a walk, or time with family.', action: 'Read a note', href: '/dashboard/notes', ayah: 'peace' },
  { label: 'Maghrib → Isha', title: 'Reflect on what went well.', description: 'Notice your progress, be grateful, and gently close the loops from today.', action: 'Review your goals', href: '/dashboard/goals', ayah: 'gratitude' },
  { label: 'Isha → Fajr', title: 'End gently. Begin with intention.', description: 'Set one priority for tomorrow, then give yourself permission to rest.', action: 'Plan tomorrow', href: '/dashboard/tasks', ayah: 'rest' },
];

export const HERO_CONTENT = {
  'Your Workspace': { kicker: 'A DAY WITH PURPOSE', ayat: ['effort', 'gratitude', 'peace'], messages: ['A little focus. A little consistency. A meaningful day.', 'Begin gently, keep showing up, and notice your progress.', 'Bring your next step into focus, with a clear intention.'] },
  Tasks: { kicker: 'INTENTION INTO ACTION', ayat: ['effort', 'patience', 'ease'], messages: ['One meaningful task is a good beginning.', 'Take the next small step, with a clear intention.', 'Progress grows from the things you finish.'] },
  Notes: { kicker: 'A SPACE TO LEARN', ayat: ['knowledge', 'remembrance', 'peace'], messages: ['Keep what you learn close. Return to it often.', 'A useful note today can bring clarity tomorrow.', 'Make room for ideas worth remembering.'] },
  Goals: { kicker: 'PURPOSE OVER PACE', ayat: ['ease', 'effort', 'gratitude'], messages: ['Choose a direction that matters, then take one step.', 'Build a life of meaningful, consistent progress.', 'Notice how far you have come. Keep going gently.'] },
  'Ahd Nama': { kicker: 'A PROMISE TO RETURN TO', ayat: ['promise', 'remembrance', 'prayer'], messages: ['Let your commitments guide the choices you make today.', 'Return to your promise with a renewed intention.', 'Keep faith, character, and action moving together.'] },
};

export function getDailySeed(dateKey) {
  return dateKey ? Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000) : 0;
}
