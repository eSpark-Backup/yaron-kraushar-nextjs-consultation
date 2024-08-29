// pages/api/get-call-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { callStatusManager } from '../../../services/retell/call_status';

const { Configuration, OpenAIApi } = require("openai");
import OpenAI from "openai";

if (!global.jimple_openai) {
  global.jimple_openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Get Call Status API called");

  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { callId } = req.body;

  if (!callId || typeof callId !== 'string') {
    res.status(400).json({ error: "Missing or invalid callId" });
    return;
  }

  const callStatusData = await callStatusManager.getCallStatus(callId);
  console.log("Call status data: ", callStatusData);
  console.log("callId: ", callId);

  if (!callStatusData) {
    console.log("Call ID not found");
    res.status(404).json({ error: "Call ID not found" });
    return;
  }

  let jimple_status: string | null;
  jimple_status = "Not yet available";

  if (callStatusData.status === "analyzed") {
    console.log("Calling GPT-4o to summarize the call");

    if (callStatusData.data.call_analysis.agent_task_completion_rating === 'Incomplete' || callStatusData.data.call_status === 'user_hangup' || callStatusData.data.call_status === 'error'){
      jimple_status = 'Sorry, could not complete the call, please try again later';
    } else {

    try {
      const response = await global.jimple_openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
            You will act as a phone call summarizer.
            You will recieve a transcript of a call and you will provide a short sentence describing the outcomes of the call. 
            Keep the summary to around 120 words or less. 
            Refer to the Agent as JBot in the summary.
            use the user's name when referring to the user in the summary.  Never use "user" in the summary always the name`
          },
          {
            role: "user",
            content: callStatusData.data.transcript
          }
        ]
      });

      console.log("response: ", response.choices[0].message.content);
      // Store the summary from response in the callStatusData.jimple_status as a string
      jimple_status = response.choices[0].message.content;
    
    } catch (error) {
      console.error("Error calling OpenAI API: ", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Error generating summary with OpenAI API" });
      return;
    }
  }
  }

  console.log("Call status ended with: ", callStatusData.status);
  res.status(200).json({
    status: callStatusData.status,
    data: callStatusData.data,
    jimple_status: jimple_status
  });
}