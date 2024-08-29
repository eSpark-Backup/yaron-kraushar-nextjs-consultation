import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../services/mongodb';
import { updateUserWithStripeDetails } from '../stripe/update_stripe_details';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Server: Stripe Create Checkout Session API');

  if (req.method !== 'POST') {
    console.log(`Server: Method ${req.method} not allowed`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId, email, fullName, isFlutterClient } = req.body;
  console.log(
    `Server: Received request with userId=${userId}, email=${email}, fullName=${fullName}, isFlutterClient=${isFlutterClient}`,
  );

  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('jimple');
    console.log('Server: Connected to MongoDB');

    // Fetch user from MongoDB
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });
    await updateUserWithStripeDetails(userId);
    console.log('Server: Fetched user from MongoDB:', user);

    if (!user) {
      console.log('Server: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    let customer: Stripe.Customer;
    let subscription: Stripe.Subscription | null = null;

    if (!user.stripe_customer_id) {
      // New user: Create a new Stripe customer
      console.log('Server: Creating a new Stripe customer for userId:', userId);
      customer = await stripe.customers.create({
        email: email,
        name: fullName,
        metadata: { userId },
      });

      // Update user in MongoDB with new Stripe customer ID
      await db
        .collection('users')
        .updateOne(
          { _id: new ObjectId(userId) },
          { $set: { stripe_customer_id: customer.id } },
        );
      console.log(
        'Server: Updated MongoDB user with new Stripe customer ID:',
        customer.id,
      );

      // Create a new subscription with 60-day trial
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: 'price_1Pq1qmAUvpM7YoWdQf7JtdoQ' }],
        trial_period_days: 60,
      });
      const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/subscription_success?userId=${userId}&isFlutterClient=${isFlutterClient}`;
      console.log(
        'Server: Created a new Stripe subscription with trial period for userId:',
        userId,
      );

      res.status(200).json({ status: 'new_subscription', returnUrl });
    } else {
      // Existing user: Retrieve Stripe customer
      console.log(
        'Server: Retrieving existing Stripe customer for userId:',
        userId,
      );
      customer = await stripe.customers.retrieve(user.stripe_customer_id, {
        expand: ['subscriptions'],
      });

      if (customer.subscriptions && customer.subscriptions.data.length > 0) {
        subscription = customer.subscriptions.data[0];
        console.log(
          'Server: Retrieved existing subscription for customer:',
          subscription,
        );
      }
    }

    if (subscription && ['active', 'trialing'].includes(subscription.status)) {
      // User has an active subscription
      console.log('Server: User has an active subscription');
      return res.status(200).json({ status: 'existing_subscription' });
    } else if (
      subscription &&
      subscription.status !== 'active' &&
      subscription.status !== 'trialing'
    ) {
      // User has an expired subscription, create a checkout session for renewal
      console.log(
        'Server: User has an expired subscription, creating checkout session for renewal',
      );
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{ price: 'price_1Pq1qmAUvpM7YoWdQf7JtdoQ', quantity: 1 }],
        mode: 'subscription',
        // subscription_data: {
        //   items: [{ plan: 'price_1Pq1qmAUvpM7YoWdQf7JtdoQ' }],
        // },
        allow_promotion_codes: true,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription_success?userId=${userId}&isFlutterClient=${isFlutterClient}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription_cancelled?userId=${userId}&isFlutterClient=${isFlutterClient}`,
      });
      console.log(
        'Server: Created checkout session for subscription renewal, session ID:',
        session.id,
      );

      return res
        .status(200)
        .json({ status: 'renew_subscription', checkoutUrl: session.url });
    } else {
      // Handle unexpected cases, if needed
      console.log('Server: Unexpected user subscription status');
      return res.status(400).json({ error: 'Unexpected user status.' });
    }
  } catch (error) {
    console.error('Error in Stripe checkout session:', error);
    if (error instanceof Stripe.errors.StripeError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default handler;
