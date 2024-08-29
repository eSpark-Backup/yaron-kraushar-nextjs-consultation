import * as util from 'util' // has no default export
import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import { SESSION_TTL_MS, sessionManager,  } from '../../services/sessions/sessions';
import { sha256 } from '../../services/cryptography';
import clientPromise from '../../services/mongodb';
import { ObjectId } from 'mongodb';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>) {
  console.log("Server: Reset User Password");

  //Get data submitted in request's body.
  const password = sha256(req.body.password);  //Hash password
  const UUID = req.body.UUID;
  const userId = req.body.userID;

  try {
    //Access MongoDB database
    const client = await clientPromise;
    const db = client.db("jimple");

    //Test if User already exists
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(403).json({ data: 'No such user' });

     //Update user password
     const result = await db.collection("users").updateOne({ _id: user._id },
      {
          $set:
          {
              password: password,
              resetPassword:null
          }
      });

    //session id generated on server
    const sessionId = sessionManager.GenerateSessionID();

    //Get the users IP address to store in a session for security purposes
    const userIP = req.headers["x-real-ip"] || req.connection.remoteAddress;
    user.IP = userIP;
    user.authorized = true;

    //For each new user id, keep record of sessionId only on the server
    await sessionManager.AddSessionUser(sessionId, user);

    //Set the sessionId cookie in the server's response to update on the client
    setCookie('sessionId', sessionId, { req, res, maxAge: SESSION_TTL_MS, sameSite: true });

    //Respond to client that the registration was successful
    res.status(200).json("Password change was successful");

  } catch (e) {
    //return Bad Request
    res.status(400).json({ error: `${util.inspect(e)}` })
    console.error(e);
  }

};

export default handler;