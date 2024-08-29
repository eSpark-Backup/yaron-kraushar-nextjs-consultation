
import * as util from 'util' // has no default export
import { NextApiRequest, NextApiResponse } from "next";
import { sessionManager } from '../../services/sessions/sessions';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  console.log("Server: Logout API");

  // Check the HTTP Method
  if (req.method !== 'POST') {
    return res.status(405).json({ data: 'Method Not Allowed' }); // 405 Method Not Allowed
  }

  //Check if user already logged out
  const user = await sessionManager.GetSessionUser({ req, res });

  if (!(user)) {
    console.log("User already logged out");
    return res.status(401).json({ data: "User already logged out" });
  }

  let context = { req, res };
    
  await sessionManager.DeleteSessionData(context);

  console.log("user logged out");
  return res.status(200).json({ data: "User logged out correctly" });
};

export default handler;