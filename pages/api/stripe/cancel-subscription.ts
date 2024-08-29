import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../services/mongodb';
import { ObjectId } from 'mongodb';
import { sessionManager } from '../../../services/sessions/sessions';
import { updateUserWithStripeDetails } from './update_stripe_details';

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

// Cancels all active subscriptions for a customer end-point
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log("Server: cancel-subscription called");

  // Your session manager logic
  const sessionData = await sessionManager.GetSessionUser({ req, res });
  if (!sessionData) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("jimple");
    const user = await db.collection("users").findOne({ _id: new ObjectId(sessionData._id!) });
    
    if (!user || !user.stripe_customer_id) {
      return res.status(404).json({ error: 'User or Stripe customer not found' });
    }

    await cancelSubscriptions(user.stripe_customer_id);

    const subscriptionData = await updateUserWithStripeDetails(user._id);

 

    console.log("Server: cancel-subscription success")
    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error in cancel-subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
