import { NextApiRequest, NextApiResponse } from "next";
import { sessionManager } from "../../../services/sessions/sessions";
import OpenAI from "openai";

declare global {
  var jimple_openai: OpenAI;
}

if (!global.jimple_openai) {
  global.jimple_openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  console.log("Server: chatGPTrouter");

  // Check user session
  const user = await sessionManager.GetSessionUser({ req, res });
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Ensure this is a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages, model, frequency_penalty = 0, presence_penalty = 0, temperature = 0.1, top_p = 1 } = req.body;

    console.log("messages:", messages);
    console.log("model:", model);
    console.log("frequency_penalty:", frequency_penalty);
    console.log("presence_penalty:", presence_penalty);
    console.log("temperature:", temperature);
    console.log("top_p:", top_p);

    // Basic input validation
    if (!messages || !model) {
      return res.status(400).json({ message: "Messages and model are required" });
    }

    // Chat-specific API call
    const response = await global.jimple_openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature,
      top_p: top_p,
      frequency_penalty: frequency_penalty,
      presence_penalty: presence_penalty
    });

    // Return the chat response
    res.status(200).json(response.choices[0].message.content);
  } catch (error) {
    console.error('Error with OpenAI chat API:', error);
    res.status(500).json({ message: `Error processing chat request ${error}` });
  }
}