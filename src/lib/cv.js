import { getDatabase } from '@/lib/mongodb';

export async function getLatestCv() {
  try {
    const database = await getDatabase();
    const latestCv = await database.collection('uploads').findOne(
      { category: 'cv', kind: 'pdf' },
      { sort: { createdAt: -1, _id: -1 } },
    );

    if (!latestCv?.secureUrl) return null;

    return {
      url: latestCv.secureUrl,
      fileName: latestCv.originalName || 'Zain_Qalandar_CV.pdf',
    };
  } catch (error) {
    console.error('Latest CV lookup error:', error);
    return null;
  }
}

