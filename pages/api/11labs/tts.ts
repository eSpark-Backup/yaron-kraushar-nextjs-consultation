import { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../services/sessions/sessions';

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Fetch session data from cookies using your session manager
  const user = await sessionManager.GetSessionUser({ req, res });

  // If no session data or user is not authorized, return 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract text and voice parameters from the request body
  const { text, voiceId } = req.body;

  // Check if text and voice name are provided
  if (!text || !voiceId) {
    return res.status(400).json({ message: 'Text and voiceName parameters are required' });
  }

  try {

    const response = await fetch(`${BASE_URL}/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY!,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 1,
          similarity: 1,
          similarity_boost: 0,
          
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audio from Eleven Labs API');
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Set the response headers for audio content
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');

    // Send the audio buffer as the response
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('Error generating speech audio:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}





// English v1

// eleven_monolingual_v1
// Multilingual v1

// eleven_multilingual_v1
// Multilingual v2

// eleven_multilingual_v2
// Turbo v2

// eleven_turbo_v2