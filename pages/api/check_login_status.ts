import { NextApiRequest, NextApiResponse } from "next";
import { sessionManager } from "../../services/sessions/sessions";


async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // Fetch session data from cookies using your session manager
  const user = await sessionManager.GetSessionUser({ req, res });

  // If no session data or user is not authorized, return 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // If authorized, return 200 OK
  return res.status(200).json({ message: 'Authorized' });
}

export default handler;
