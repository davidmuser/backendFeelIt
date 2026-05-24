import { MongoClient } from "mongodb";

const DEFAULT_DB_NAME = process.env.DB_NAME || "feelit";

const COLLECTION_DEFINITIONS = [
  {
    name: "users",
    indexes: [
      {
        key: { email: 1 },
        options: { unique: true, name: "users_unique_email" },
      },
    ],
  },
  {
    name: "user_health",
    indexes: [
      { key: { userId: 1 }, options: { name: "user_health_user" } },
      {
        key: { userId: 1, createdAt: -1 },
        options: { name: "user_health_user_created" },
      },
    ],
  },
];

let client = null;
let db = null;
let collections = {};

async function ensureCollections(database) {
  const existing = await database
    .listCollections({}, { nameOnly: true })
    .toArray();
  const existingNames = new Set(existing.map((item) => item.name));

  for (const definition of COLLECTION_DEFINITIONS) {
    if (!existingNames.has(definition.name)) {
      await database.createCollection(definition.name);
      console.log(`Created collection: ${definition.name}`);
    }

    const collection = database.collection(definition.name);
    for (const indexDefinition of definition.indexes) {
      await collection.createIndex(
        indexDefinition.key,
        indexDefinition.options,
      );
    }

    collections[definition.name] = collection;
  }
}

export async function connectToDatabase() {
  if (db) {
    return { client, db, collections };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set.");
  }

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db(DEFAULT_DB_NAME);
  await ensureCollections(db);

  console.log(`MongoDB connected: ${db.databaseName}`);
  return { client, db, collections };
}

export function getDb() {
  if (!db) {
    throw new Error("Database is not connected. Call connectToDatabase first.");
  }
  return db;
}

export function getCollections() {
  if (!db) {
    throw new Error("Database is not connected. Call connectToDatabase first.");
  }
  return collections;
}

export function getUsersCollection() {
  if (!collections.users) {
    throw new Error(
      "users collection is not initialized. Call connectToDatabase first.",
    );
  }
  return collections.users;
}

export function getUserHealthCollection() {
  if (!collections.user_health) {
    throw new Error(
      "user_health collection is not initialized. Call connectToDatabase first.",
    );
  }
  return collections.user_health;
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    collections = {};
  }
}
