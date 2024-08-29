// pages/api/retell-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Retell } from "retell-sdk";
import { CallStatus, callStatusManager } from '../../../services/retell/call_status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  if (
    !Retell.verify(
      JSON.stringify(req.body),
      process.env.RETELL_API_KEY!,
      req.headers["x-retell-signature"] as string,
    )
  ) {
    console.error("Invalid signature");
    res.status(401).send("Retell Unauthorized API Key");
    return;
  }

  const content = req.body;

  switch (content.event) {
    case "call_started":
      console.log("Call started event received", content.data.call_id);
      callStatusManager.setCallStatus(content.data.call_id, CallStatus.Started, content.data);
      break;
    case "call_ended":
      console.log("Call ended event received", content.data.call_id);
      callStatusManager.setCallStatus(content.data.call_id, CallStatus.Ended,content.data);
      break;
    case "call_analyzed":
      console.log("Call analyzed event received", content.data.call_id);
      callStatusManager.setCallStatus(content.data.call_id, CallStatus.Analyzed,content.data);
      break;
    default:
      console.log("Received an unknown event:", content.data);
      callStatusManager.setCallStatus(content.data.call_id, CallStatus.Unknown,content.data);
  }

  // Acknowledge the receipt of the event
  res.status(204).end();
}
