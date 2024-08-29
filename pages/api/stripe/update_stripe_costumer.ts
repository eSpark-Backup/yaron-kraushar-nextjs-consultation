// pages/api/stripe/verify-customer-subscription.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../services/sessions/sessions';
import { updateUserWithStripeDetails } from './update_stripe_details';
import clientPromise from '../../../services/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Server: Stripe Verify Customer Subscription API");

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Grab session data from server global memory and return it using the context req cookie value
  const user = await sessionManager.GetSessionUser({ req, res });
  if (!user) {
    return res.status(401).json("NOT AUTHORIZED, PLEASE LOG IN");
  }


  const client = await clientPromise;
  const db = client.db("jimple");
  console.log("stripe_customer_id:", user.stripe_customer_id);

  try {
    if (!user._id || !ObjectId.isValid(user._id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
  
    // Update user with Stripe details
    const subscriptionData = await updateUserWithStripeDetails(user._id);
    if (!user._id || !ObjectId.isValid(user._id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
  

    const userId = new ObjectId(user._id);
    const userDB = await db.collection("users").findOne({ _id: userId });

    if (!userDB) {
      console.log("Can't find user in database");
      return res.status(200).json(user); // Return current user details if database update fails
    }

    const { password, passwordIV, ...safeUser } = userDB;
    return res.status(200).json(safeUser);

  } catch (error) {
    console.error('Error verifying Stripe customer subscription:', error);
    return res.status(200).json(user); // Always return updated user details in case of error
  }
}
