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

  const settings = req.body;

  console.log('app_user_settings:', inspect(settings));

  // Ensure the key object includes the user's ID
  settings.userId = user._id;

  // Save key to key collection in the database
  try {
    const client = await clientPromise;
    const db = client.db("jimple");

    // Create a compound index on keyCode and userId if it doesn't exist
    await db.collection("app_user_settings").createIndex({ userId: 1 }, { unique: true });

    // Check if the keyCode exists for the current user
    const userSettings = await db.collection("app_user_settings").findOne({ userId: settings.userId });

    if (!userSettings) {
      // Add new key
      const result = await db.collection("app_user_settings").insertOne(settings);
      console.log('New app settings inserted with id:', result.insertedId);
    } else {
      // Update key
      const result = await db.collection("app_user_settings").updateOne({ userId: settings.userId }, { $set: settings });
      console.log('settings updated:', result.modifiedCount);
    }

    return res.status(200).json({ message: 'settings saved' });

  } catch (e) {
    console.error("keyboard/set_user_app_cross_count error:", e);
    return res.status(400).json({ error: e.message });
  }
}

export default handler;
