//end point to create a retell agent
import Retell from 'retell-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../services/sessions/sessions';
import { inspect } from 'util';
import { CallStatus, callStatusManager } from '../../../services/retell/call_status';


global.jimple_retellClient = global.jimple_retellClient || new Retell({
  // Find the key in dashboard
  apiKey: process.env.RETELL_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Agent API called");

  console.log("Headers received:", req.headers); // Log headers
    console.log("Cookies received:", req.headers.cookie); // Log cookies

  //check authroization for user
  const user = await sessionManager.GetSessionUser({ req, res });
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const retell = global.jimple_retellClient;

  console.log("process.env.RETELL_API_KEY: " + process.env.RETELL_API_KEY!);

  //Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { to_number, assistant_goal, user_name, your_name, location } = req.body;

  var actualLocation = location;

  //check for to_number
  if (!to_number) {
    res.status(400).json({ error: 'to_number is required.  E.g. +6145866886' });
    return;
  }

  //check for assistant_goal
  if (!assistant_goal) {
    res.status(400).json({ error: 'assistant_goal is required.  E.g. the instructions to the agent/bot to do something' });
    return;
  }

  //check for users_name
  if (!user_name) {
    res.status(400).json({ error: 'user_name is required.  E.g. the person making the call' });
    return;
  }

  //check for your_name
  if (!your_name) {
    res.status(400).json({ error: 'your_name is required.  E.g. the person you want to call' });
    return;
  }

  //check for location
  if (!location) {
    //res.status(400).json({ error: 'location is required.  E.g. Melbourne, Australia' });
    actualLocation = "Melbourne, Australia";
  }

  try {

    // const phoneNumberResponse = await retell.phoneNumber.create({
    //   agent_id: "3055d4cb343139bde3a73b8345ca7066", // replace with the agent id you want to assign
    // });

    // console.log(phoneNumberResponse);

    const registerCallResponse = await retell.call.create({
      from_number: '+16282884494', // replace with the number you purchased
      to_number: to_number,  // replace with the number you want to call
      retell_llm_dynamic_variables: {
        assistant_goal: assistant_goal,
        user_name: user_name,
        your_name: your_name,
        location: actualLocation
      },
    });
    console.log("registerCallResponse" + inspect(registerCallResponse));

    // Update the call status when the call is registered
    const call_id = registerCallResponse.call_id; // Adjust according to the actual response structure
    callStatusManager.setCallStatus(call_id, CallStatus.Started,registerCallResponse.data);
    
    res.status(200).json(registerCallResponse);

  } catch (error) {
    console.error("Failed to create agent", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}