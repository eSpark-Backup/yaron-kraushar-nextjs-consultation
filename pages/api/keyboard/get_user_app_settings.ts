// Get all keys from the database
import { NextApiRequest, NextApiResponse } from "next";
import { sessionManager } from "../../../services/sessions/sessions";
import clientPromise from "../../../services/mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // Fetch session data from cookies using your session manager
  const user = await sessionManager.GetSessionUser({ req, res });

  // If no session data or user is not authorized, return 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get keys from the database for the current user
  try {
    const client = await clientPromise;
    const db = client.db("jimple");

    // Fetch keys for the current user
    const settings = await db.collection("app_user_settings").find({ userId: user._id }).toArray();

    return res.status(200).json(settings);
  } catch (e) {
    console.error("keyboard/app_user_settings error:", e);
    return res.status(400).json({ error: e.message });
  }
}

export default handler;
