import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../services/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import { updateUserWithStripeDetails } from './update_stripe_details';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Server: Stripe Verify Subscription API");
  
  if (req.method !== 'POST') {
    console.log("Invalid request method:", req.method);
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.body;
  console.log("Received subscription_id:", userId);

  try {
      const client = await clientPromise;
      const db = client.db("jimple");
      const mongoUserId = new ObjectId(userId);
      console.log("MongoDB User ID:", mongoUserId);
      console.log("Customer ID:", userId);
      const subscriptionData = await updateUserWithStripeDetails(userId);
      console.log("MongoDB update result:", subscriptionData);
      res.status(200).json({ userId: userId, subscription_status: subscriptionData.subscription_status });
    
  } catch (error) {
    console.error('Error verifying Stripe subscription:', error);
    if (error instanceof Stripe.errors.StripeError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
