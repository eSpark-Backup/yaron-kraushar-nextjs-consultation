import { NextApiRequest, NextApiResponse } from "next";
import { sessionManager } from "../../../services/sessions/sessions";
import clientPromise from "../../../services/mongodb";
import { inspect } from "util";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // Fetch session data from cookies using your session manager
  const user = await sessionManager.GetSessionUser({ req, res });

  // If no session data or user is not authorized, return 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const key = req.body;

  console.log('key:', inspect(key));

  // Ensure the key object includes the user's ID
  key.userId = user._id;

  // Save key to key collection in the database
  try {
    const client = await clientPromise;
    const db = client.db("jimple");

    // Create a compound index on keyCode and userId if it doesn't exist
    await db.collection("keys").createIndex({ keyCode: 1, userId: 1 }, { unique: true });

    // Check if the keyCode exists for the current user
    const userKey = await db.collection("keys").findOne({ keyCode: key.keyCode, userId: key.userId });

    if (!userKey) {
      // Add new key
      const result = await db.collection("keys").insertOne(key);
      console.log('New key inserted with id:', result.insertedId);
    } else {
      // Update key
      const result = await db.collection("keys").updateOne({ keyCode: key.keyCode, userId: key.userId }, { $set: key });
      console.log('Key updated:', result.modifiedCount);
    }

    return res.status(200).json({ message: 'Key saved' });

  } catch (e) {
    console.error("keyboard/save_keys error:", e);
    return res.status(400).json({ error: e.message });
  }
}

export default handler;
