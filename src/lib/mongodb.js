import { MongoClient } from 'mongodb';

const globalForMongo = globalThis;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!globalForMongo.__portfolioMongoClientPromise) {
    globalForMongo.__portfolioMongoClientPromise = new MongoClient(uri).connect();
  }

  return globalForMongo.__portfolioMongoClientPromise;
}

export async function getDatabase() {
  const client = await getClientPromise();
  return client.db();
}
