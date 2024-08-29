import * as util from 'util' // has no default export
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import clientPromise from '../../services/mongodb';
import { sha256 } from '../../services/cryptography';
import { sessionManager } from '../../services/sessions/sessions';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

// Cancels all active subscriptions for a customer
const cancelSubscriptions = async (customerId) => {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });
  
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.del(subscription.id);
    }
  };
  
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    console.log("Server: user_delete_user_safe");

    var user = await sessionManager.GetSessionUser({ req, res });
    if (!user) { res.status(401).json("NOT AUTHORIZED, PLEASE LOG IN"); return; }

    const password = sha256(req.body.password);  // Hash password

    try {
        const client = await clientPromise;
        const db = client.db("jimple");

        const userDB = await db.collection("users").findOne({ _id: new ObjectId(user._id!) });
        if (!userDB) return res.status(403).json({ data: 'Can\'t find user in database' });

        if (password != userDB.password) return res.status(403).json({ error: 'Password is not correct', type: "password" });

        // Remove the _id field from the userDB object to avoid duplicate key error
        const { _id, ...archivableUserData } = userDB;

        // Insert the user into 'archived_users' collection. MongoDB will assign a new _id automatically, this 
        // keeps track of each time a user deletes their account
        const archivedResult = await db.collection("archived_users").insertOne(archivableUserData);

        // If insertion was successful, delete the user from 'users' collection
        if (archivedResult.acknowledged) {
            const deleteResult = await db.collection("users").deleteOne({ _id: new ObjectId(user._id!) });

            // Check if the deletion was successful
            if (deleteResult.deletedCount === 1) {
                //Cancel all active subscriptions for the user
                await cancelSubscriptions(user.stripe_customer_id);

                return res.status(200).json("User successfully archived and deleted from users collection");
            } else {
                // Handle the case where deletion was not successful
                return res.status(500).json("Failed to delete user from users collection");
            }
        } else {
            // Handle the case where insertion into 'archived_users' was not successful
            return res.status(500).json("Failed to archive user");
        }
    } catch (e) {
        res.status(400).json({ error: `${util.inspect(e)}` });
        console.error(e);
    }
};


export default handler;