import { type Db, type Filter, type Document } from "mongodb";

/**
 * Returns a thin wrapper around the `toats` collection that automatically
 * appends `{ owner_id: ownerId }` to every find/findOne query — preventing
 * accidental cross-user data leaks.
 */
export function getScopedToats(db: Db, ownerId: string) {
  const col = db.collection("toats");
  return {
    find(filter: Filter<Document> = {}) {
      return col.find({ ...filter, owner_id: ownerId });
    },
    findOne(filter: Filter<Document> = {}) {
      return col.findOne({ ...filter, owner_id: ownerId });
    },
    insertOne(doc: Document) {
      return col.insertOne({ ...doc, owner_id: ownerId });
    },
    updateOne(filter: Filter<Document>, update: Document, options?: { upsert?: boolean }) {
      return col.updateOne({ ...filter, owner_id: ownerId }, update, options);
    },
    deleteOne(filter: Filter<Document>) {
      return col.deleteOne({ ...filter, owner_id: ownerId });
    },
    countDocuments(filter: Filter<Document> = {}) {
      return col.countDocuments({ ...filter, owner_id: ownerId });
    },
  };
}

/** Returns the raw `users` collection (no owner-scoping — queried by uid). */
export function usersCollection(db: Db) {
  return db.collection("users");
}
