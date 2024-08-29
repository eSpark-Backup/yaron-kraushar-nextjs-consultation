// services/updateUserWithStripeDetails.ts

import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import clientPromise from '../../../services/mongodb';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

interface SubscriptionData {
  stripe_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  trial_end: Date | null;
}

export async function updateUserWithStripeDetails(userId: string) {
  const client = await clientPromise;
  const db = client.db("jimple");

  // Default subscription data
  let subscriptionData: SubscriptionData = {
    stripe_customer_id: null,
    subscription_id: null,
    subscription_status: 'none',
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    trial_end: null,
  };

  try {
    // Find the user in MongoDB
    const mongoUserId = new ObjectId(userId);
    const user = await db.collection("users").findOne({ _id: mongoUserId });

    if (!user || !user.stripe_customer_id) {
      // If no Stripe customer ID, update MongoDB with default subscription data
      await db.collection("users").updateOne(
        { _id: mongoUserId },
        { $set: subscriptionData }
      );
      return subscriptionData; // Return updated subscription data
    }

    // Retrieve the Stripe customer
    const customer = await stripe.customers.retrieve(user.stripe_customer_id, {
      expand: ['subscriptions']
    });

    if (typeof customer === 'string' || customer.deleted) {
      // Reset subscription details if customer is not found or deleted
      subscriptionData = {
        stripe_customer_id: null,
        subscription_id: null,
        subscription_status: 'none',
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        trial_end: null,
      };
    } else {
      // Update subscription details
      if (customer.subscriptions && customer.subscriptions.data.length > 0) {
        const latestSubscription = customer.subscriptions.data[0];
        subscriptionData = {
          stripe_customer_id: user.stripe_customer_id,
          subscription_id: latestSubscription.id,
          subscription_status: latestSubscription.status,
          current_period_start: new Date(latestSubscription.current_period_start * 1000),
          current_period_end: new Date(latestSubscription.current_period_end * 1000),
          cancel_at_period_end: latestSubscription.cancel_at_period_end,
          trial_end: latestSubscription.trial_end ? new Date(latestSubscription.trial_end * 1000) : null,
        };
      }
    }

    // Update MongoDB with subscription details
    await db.collection("users").updateOne(
      { _id: mongoUserId },
      { $set: subscriptionData }
    );

    return subscriptionData;

  } catch (error) {
    console.error('Error updating user with Stripe details:', error);
    return subscriptionData; // Return default subscription data in case of error
  }
}
