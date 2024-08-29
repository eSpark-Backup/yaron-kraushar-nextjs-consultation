import { v4 } from "uuid";
import * as util from 'util'
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../services/mongodb";
import { SESSION_TTL_MS, sessionManager } from "../../../services/sessions/sessions";
import sendEmail from "../../../services/sendgrid/send_email";
import { ObjectId } from "mongodb";
import DeepLink from "../../../services/deeplink";
import { updateUserWithStripeDetails } from "./update_stripe_details";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {

  console.log("Server: Send Subscription Link");

  const sessionData = await sessionManager.GetSessionUser({ req, res });
  console.log("Session data retrieved:", sessionData);
  if (!sessionData) {
    console.log("No session data found, returning 401");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log("Base URL:", baseUrl);
    const client = await clientPromise;
    const db = client.db("jimple");
    console.log("Connected to MongoDB");

    const user = await db.collection("users").findOne({ _id: new ObjectId(sessionData._id!) });
    console.log("User retrieved from database:", user);

    if (!user) {
      console.log("No user found with the given ID, returning 403");
      return res.status(403).json('No such email account');
    }
    await updateUserWithStripeDetails(user.id);

    const UUID = v4();
   

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          stripe_link: {
            UUID: UUID,
            expires: new Date(Date.now() + SESSION_TTL_MS)
          }
        }
      });
    console.log("Updated user's stripe_link in the database");

    let emailParams;

    if (!user.stripe_customer_id) {
      console.log("User does not have a Stripe customer ID, creating new user email");
      emailParams = createNewUserEmail(user.email, baseUrl, UUID);
    } else {
     
      const subscription = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 1
      });
      console.log("Retrieved subscription data:");

      if (subscription.data.length > 0) {
        const status = subscription.data[0].status;
        console.log("Subscription status:", status);
        if (status === 'trialing' || status === 'active') {
          console.log("Creating active subscription email");
          emailParams = createActiveSubscriptionEmail(user.email, status);
        } else {
          console.log("Creating renew subscription email");
          emailParams = createRenewSubscriptionEmail(user.email, baseUrl, UUID);
        }
      } else {
        console.log("No active subscriptions found, creating renew subscription email");
        emailParams = createRenewSubscriptionEmail(user.email, baseUrl, UUID);
      }
    }

    console.log("Sending email with the following parameters:");
    await sendEmail(emailParams);

    console.log("Subscription email sent successfully");
    res.status(200).json("Subscription email sent");

  } catch (e) {
    console.log("Error occurred:", e);
    res.status(400).json({ error: `${util.inspect(e)}` })
    console.error(e);
  }
}

function createNewUserEmail(email, baseUrl, UUID) {
  const title = "Welcome to Jimple";
  const content = "Thank you for choosing Jimple. To get started with your 2-month free trial, please click the button below:";
  const buttonText = "Start Free Trial";
  const buttonLink = `${baseUrl}/subscription_link/${UUID}`;

  return {
    to: email,
    from: "noreply@jimple.io",
    subject: "Welcome to Jimple - Start Your Free Trial",
    text: `Welcome to Jimple. Click here to start your 2-month free trial: ${buttonLink}`,
    html: emailTemplate(title, content, buttonText, buttonLink)
  };
}

function createActiveSubscriptionEmail(email, status) {
  const title = "Your Jimple Subscription is Active";
  const content = `Your subscription is currently ${status}. You can continue using the Jimple app without any further action. Thank you for being a valued Jimple customer!`;
  const buttonText = "Open Jimple App";
  const buttonLink = DeepLink.success;

  return {
    to: email,
    from: "noreply@jimple.io",
    subject: "Your Jimple Subscription is Active",
    text: `Your Jimple subscription is currently ${status}. Click here to open the app: ${buttonLink}`,
    html: emailTemplate(title, content, buttonText, buttonLink)
  };
}

function createRenewSubscriptionEmail(email, baseUrl, UUID) {
  const title = "Renew Your Jimple Subscription";
  const content = "Your Jimple subscription needs to be renewed. To continue enjoying our services, please click the button below to enter your card details and purchase a subscription:";
  const buttonText = "Renew Subscription";
  const buttonLink = `${baseUrl}/subscription_link/${UUID}`;

  return {
    to: email,
    from: "noreply@jimple.io",
    subject: "Renew Your Jimple Subscription",
    text: `Your Jimple subscription needs to be renewed. Click here to renew: ${buttonLink}`,
    html: emailTemplate(title, content, buttonText, buttonLink)
  };
}

export default handler;


const emailTemplate = (title, content, buttonText, buttonLink) => `
<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<title></title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"/>
<style>
  /* Paste the styles from the original HTML here */
  body { margin: 0; padding: 0; background-color: #000000; }
  /* ... (include all the styles from the original HTML) ... */
</style>
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #000000;" width="100%">
<tbody>
<tr>
<td>
  <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #000000; background-size: auto;" width="100%">
    <tbody>
      <tr>
        <td>
          <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; background-color: #000000; color: #000000; width: 650px; margin: 0 auto;" width="650">
            <tbody>
              <tr>
                <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
                  <table border="0" cellpadding="0" cellspacing="0" class="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="padding-top:20px;width:100%;padding-right:0px;padding-left:0px;">
                        <div align="center" class="alignment" style="line-height:10px">
                          <div style="max-width: 130px;"><img alt="Jimple logo" src="https://jimple.io/logo-jimple.png" style="display: block; height: auto; border: 0; width: 100%;" title="Jimple logo" width="130"/></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" class="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:5px;text-align:center;width:100%;">
                        <h1 style="margin: 0; color: #ffffff; direction: ltr; font-family: 'Nunito', Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 56px; font-weight: 900; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 67.2px;"><span class="tinyMce-placeholder">${title}</span></h1>
                      </td>
                    </tr>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" class="paragraph_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:20px;">
                        <div style="color:#ffffff;direction:ltr;font-family:'Nunito', Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:center;mso-line-height-alt:24px;">
                          <p style="margin: 0;">${content}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" class="button_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                    <tr>
                      <td class="pad" style="padding-bottom:45px;text-align:center;">
                        <div align="center" class="alignment">
                          <a href="${buttonLink}" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#11b146;border-radius:12px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:20px;padding-bottom:20px;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;" target="_blank"><span style="padding-left:40px;padding-right:40px;font-size:16px;display:inline-block;letter-spacing:normal;"><span style="word-break: break-word; line-height: 32px;">${buttonText}</span></span></a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <!-- Footer content -->
  <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
    <!-- ... (include the footer content from the original HTML) ... -->
  </table>
</td>
</tr>
</tbody>
</table>
</body>
</html>
`;
