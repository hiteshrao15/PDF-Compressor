import { MongoClient, ObjectId } from "mongodb";

type MongoGlobal = typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

function createClient() {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error("DATABASE_URL is not set");
  }

  return new MongoClient(uri);
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = createClient().connect();
  }

  return globalForMongo.mongoClientPromise;
}

export async function getPdfHistoryCollection() {
  const client = await getMongoClient();
  return client.db().collection("pdf_history");
}

export { ObjectId };