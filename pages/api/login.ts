import * as util from 'util'; // has no default export
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import { sha256 } from '../../services/cryptography';
import clientPromise from '../../services/mongodb';
import {
  SESSION_TTL_MS,
  sessionManager,
} from '../../services/sessions/sessions';
import { DefaultUserSettings } from '../../services/user_entity';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  console.log('Server: Login API');

  //Get data submitted in request's body.
  const email = req.body.email;
  const password = sha256(req.body.password); //Hash password

  try {
    const client = await clientPromise;
    const db = client.db('jimple');

    let user = await db.collection('users').findOne({ email: email });
    //If User doesn't exists
    if (!user)
      return res
        .status(403)
        .json({ error: 'Username or password is inccorect', type: 'email' });

    //If password is incorrectsåß
    if (password != user.password)
      return res
        .status(403)
        .json({ error: 'Password is not corect', type: 'password' });

    // Let's migrate the user settings, check if DefaultUserSettings has changed
    user = await migrateUserSettings(db, user, DefaultUserSettings);
    user.authorized = true;

    //session id recieved from client
    const sessionId = sessionManager.GenerateSessionID();

    //For each new user id, keep record of sessionId only on the server
    await sessionManager.AddSessionUser(sessionId, user);

    //Set the sessionId cookie in the server's response (res) to update on the client on return data
    setCookie('sessionId', sessionId, {
      req,
      res,
      maxAge: SESSION_TTL_MS,
      sameSite: true,
    });

    //if everything goes fine, return the sessionId and user settings
    res.status(200).json({ sessionId: sessionId, user: user });
  } catch (e) {
    //return Bad Request
    res.status(400).json({ error: `${util.inspect(e)}` });
    console.error(e);
  }
}

export default handler;

// Migration function
async function migrateUserSettings(db, user, DefaultUserSettings) {
  let shouldUpdateSettings = false;
  let migratedSettings = { ...user.settings };

  // Add new fields
  for (const [key, value] of Object.entries(DefaultUserSettings)) {
    if (!(key in migratedSettings)) {
      migratedSettings[key] = value;
      shouldUpdateSettings = true;
    }
  }

  // Delete old fields
  for (const key of Object.keys(migratedSettings)) {
    if (!(key in DefaultUserSettings)) {
      delete migratedSettings[key];
      shouldUpdateSettings = true;
    }
  }

  // If settings are updated, then save it in the database
  if (shouldUpdateSettings) {
    console.log('Migrating user settings');
    await db
      .collection('users')
      .updateOne({ _id: user._id }, { $set: { settings: migratedSettings } });
    user.settings = migratedSettings; // update user object as well
  } else {
    console.log("User settings are up to date and don't require migration");
  }

  return user;
}
