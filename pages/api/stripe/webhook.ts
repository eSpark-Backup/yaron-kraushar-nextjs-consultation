// pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import clientPromise from '../../../services/mongodb';

// Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: '2022-11-15',
});

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Server: Stripe Webhook")

  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event;

    // Verify and construct event
    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error(`Error verifying Stripe webhook signature: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    //Access MongoDB database
    const client = await clientPromise;
    const db = client.db("jimple");
    const customerId = event.data.object.customer;
    const response = await stripe.customers.retrieve(customerId);
    let userId: string | null = null

    // Check if the response is indeed a Customer object
    if ("metadata" in response) {
      const customer = response as Stripe.Customer;
      userId = customer.metadata.userId; // Retrieve user_id from metadata
    }

    if (!userId) {
      console.error(`Error retrieving user_id from Stripe Customer object`);
      return res.status(400).send(`Webhook Error: No user_id found in Stripe Customer object`);
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        console.log("Subscription Create")
        // Update MongoDB users collection with subscription status
        //Update user password
        const result = await db.collection("users").updateOne({ userId: userId },
          {
            $set:
            {
              subscription: true,
            }
          });

        break;
      case 'customer.subscription.deleted':
        console.log("Subscription Deleted")
        // Handle subscription deleted
        break;
      // ... other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default handler;
