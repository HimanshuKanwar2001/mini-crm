
import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import type { Lead, Activity } from '@/types';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'leadpilot_ai';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env file');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}

export async function getLeadsCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('leads');
}

export async function getActivitiesCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('activities');
}

export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    // It's possible the ID is already an ObjectId string representation from another source
    // or a new ID that hasn't been through Mongo yet. For queries, it MUST be valid.
    // console.warn(`Attempting to convert potentially invalid ID to ObjectId: ${id}`);
    // For safety, if it's not a valid 24-char hex, it might be an error or a different ID scheme.
    // However, our system consistently uses string IDs that should be convertible if they came from Mongo.
    // If this throws, it often indicates an issue with ID management upstream.
    return new ObjectId(id); 
  }
  return new ObjectId(id);
}

export function mapMongoDocument<T extends { _id?: ObjectId; id?: string }>(doc: Document | T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc as T & { _id?: ObjectId };
  const idString = _id ? _id.toHexString() : (rest.id || new ObjectId().toHexString());
  return { ...rest, id: idString } as Omit<T, '_id'> & { id: string };
}
