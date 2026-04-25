/** Typed shape of a user document as stored in MongoDB and returned by the API. */
export type DbUser = {
  _id: string;            // MongoDB ObjectId as string
  firebase_uid: string;
  email: string;
  display_name: string | null;
  handle: string | null;  // @handle
  photo_url: string | null;
  providers: string[];    // e.g. ['google.com', 'password', 'phone']
  fcm_tokens: string[];
  timezone: string;       // default 'UTC'
  created_at: Date;
  updated_at: Date;
};
