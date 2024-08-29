import * as util from 'util'; // has no default export
import { setCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  SESSION_TTL_MS,
  sessionManager,
} from '../../services/sessions/sessions';
import { sha256 } from '../../services/cryptography';
import clientPromise from '../../services/mongodb';
import { DefaultUserSettings, User } from '../../services/user_entity';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  console.log('Server: Register New Account API');

  // Get data submitted in request's body.
  const email = req.body.email;
  const password = sha256(req.body.password); // Hash password
  const fullName = req.body.fullName;
  const token = req.body.token;
  const userVoice = req.body.userVoice;
  const userAddress = req.body.userAddress;
  const userLanguageCode = req.body.userLanguageCode;

  try {
    // Access MongoDB database
    const client = await clientPromise;
    const db = client.db('jimple');

    // Test if the token exists
    // const tokenRecord = await db.collection("access_tokens").findOne({ token: token });
    // if (!tokenRecord) {
    //   return res.status(400).json({ error: 'Invalid Token.  Access Denied' });
    // }

    // Test if User already exists
    const user = await db.collection('users').findOne({ email: email });
    if (user) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const ip = Array.isArray(req.headers['x-real-ip'])
      ? req.headers['x-real-ip'][0]
      : req.headers['x-real-ip'];
    const newUser: User = {
      _id: null,
      authorized: true,
      fullName: fullName,
      IP: ip || (req.connection.remoteAddress ?? ''),
      email: email,
      password: password,
      settings: DefaultUserSettings,
      registeredAt: new Date(), // This captures the current date and time
      stripe_customer_id: '',
      userVoice: userVoice,
      userAddress: userAddress,
      userLanguageCode: userLanguageCode,
      userId: null,
      isEmulator: null,
      stripe_link: null,
      cancel_at_period_end: null,
      current_period_end: null,
      current_period_start: null,
      subscription_id: null,
      subscription_status: null,
      trial_end: null,
    };

    // Create new User record in the database
    const newRecord = await db.collection('users').insertOne(newUser);

    // Session id generated on server
    const sessionId = sessionManager.GenerateSessionID();
    const userId = newRecord.insertedId.toString();
    newUser._id = userId;

    // For each new user id, keep record of sessionId only on the server
    await sessionManager.AddSessionUser(sessionId, newUser as User);

    // Set the sessionId cookie in the server's response to update on the client
    setCookie('sessionId', sessionId, {
      req,
      res,
      maxAge: SESSION_TTL_MS,
      sameSite: true,
    });

    // Delete the token from the access_tokens collection
    await db.collection('access_tokens').deleteOne({ token: token });

    console.log('user: ' + util.inspect(newUser));
    // Respond to client that the registration was successful
    res.status(200).json({
      sessionId: sessionId,
      user: {
        ...newUser,
        userId: userId,
        authorized: true,
        password: 'redacted',
      },
    });
  } catch (e) {
    // Return Bad Request
    res.status(400).json({ error: `${util.inspect(e)}` });
    console.error(e);
  }
}

export default handler;
