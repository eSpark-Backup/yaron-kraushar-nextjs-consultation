import { v4 } from "uuid";
import * as util from 'util' // has no default export
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../services/mongodb";
import sendEmail from "../../services/sendgrid/send_email";
import { ObjectId } from "mongodb";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>) {

  //Get data submitted in request's body.
  const email = req.body.email
  console.log("Server: Password Recovery: " + email);

  try {
    //Access MongoDB database
    const client = await clientPromise;
    const db = client.db("jimple");

    console.log("db connected");
    //Test if User already exists
    const user = await db.collection("users").findOne({ email: email });
    console.log("user found: " + user);
    if (!user) return res.status(403).json('No such email account');

    const UUID = v4();

    //Update the user's record by adding a UID to their record SESSION_TTL_MS is 2 days
    const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000; //2 days

    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set:  //Set UID and expiration date
        {
          resetPassword: {
            UUID: UUID,
            expires: new Date(Date.now() + SESSION_TTL_MS)
          }
        }
      });

    console.log("result: " + result);
    console.log("Sending email")

    //setup email 
    const emailParams = {
      to: email,
      from: "noreply@jimple.io",
      subject: "Reset Password",
      text: "Click on the link to reset your Jimple password: " +
        `${process.env.NEXT_PUBLIC_BASE_URL}/reset_password/${UUID}`,
      html: "<p>Click on the link to reset your Jimple password: " +
        `<a href='${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${UUID}'>Reset Password</a></p>`
    };

    //Send email to user with link to reset password
    sendEmail(emailParams);

    //Respond to client that the registration was successful
    res.status(200).json("Password email sent");

  } catch (e) {
    //return Bad Request
    console.log("error: " + e);
    res.status(400).json({ error: `${util.inspect(e)}` })
    console.error(e);
  }

};

export default handler;