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

  // Ensure that the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { keyCode } = req.body;

  // Validate the keyCode
  if (!keyCode || typeof keyCode !== 'string') {
    return res.status(400).json({ message: 'Invalid keyCode' });
  }

  console.log("keyCode:", keyCode);

  // Delete key from key collection in database
  try {
    const client = await clientPromise;
    const db = client.db("jimple");

    const result = await db.collection("keys").deleteOne({ keyCode: keyCode, userId: user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Key not found' });
    } else {
      return res.status(200).json({ message: 'Key deleted' });
    }
  } catch (e) {
    console.error("keyboard/delete_key_error:", e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default handler;
