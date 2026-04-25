import { MongoClient, type Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (process.env.NODE_ENV === "development") {
    // In dev, use a global so the client is reused across HMR reloads.
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

/** Return the MongoDB database handle. */
export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB ?? "toatre_prod";
  const client = await getClientPromise();
  return client.db(dbName);
}

// Export a getter so the connection is established lazily at request time,
// not during Next.js build-time module evaluation.
export default {
  then: <T>(
    onfulfilled?: ((value: MongoClient) => T | PromiseLike<T>) | null,
    onrejected?: ((reason: unknown) => T | PromiseLike<T>) | null
  ): Promise<T> => getClientPromise().then(onfulfilled, onrejected),
} as Promise<MongoClient>;
