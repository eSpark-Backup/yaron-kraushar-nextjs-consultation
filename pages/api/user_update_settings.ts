import * as util from 'util'; // has no default export
import { NextApiRequest, NextApiResponse } from 'next';
import { inspect } from 'util';
import { ObjectId } from 'mongodb';
import clientPromise from '../../services/mongodb';
import { sessionManager } from '../../services/sessions/sessions';
import { UserSettings } from '../../services/user_entity';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  console.log('Server: user_update_settings');

  //Grab session data from server global memory and return it using the context req cookie value
  var user = await sessionManager.GetSessionUser({ req, res });
  if (!user) {
    res.status(401).json('NOT AUTHORIZED, PLEASE LOG IN');
    return;
  }

  //Get data submitted in request's body.
  const settings = req.body as UserSettings;
  console.log('settings: ' + inspect(settings));

  try {
    //Access MongoDB database
    const client = await clientPromise;
    const db = client.db('jimple');

    //Test if User already exists
    const userDB = await db
      .collection('users')
      .findOne({ _id: new ObjectId(user._id!) });
    if (!userDB)
      return res.status(403).json({ data: "Can't find user in database" });

    console.log('userId: ' + user._id);
    //Updtae new User record in the database
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user._id!) },
      {
        $set: {
          settings: {
            keySize: settings.keySize,
            textSize: settings.textSize,
          },
        },
      },
    );

    //Respond to client that the registration was successful
    if (result)
      return res.status(200).json('User setting successfully updated');
  } catch (e) {
    //return Bad Request
    res.status(400).json({ error: `${util.inspect(e)}` });
    console.error(e);
  }
}

export default handler;
