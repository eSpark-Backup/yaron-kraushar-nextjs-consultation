import { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../services/sessions/sessions';

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io';

// In-memory cache for voices
let voicesCache: { voices: any[], timestamp: number } = { voices: [], timestamp: 0 };
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getVoices() {
  const now = Date.now();
  if (voicesCache.voices.length > 0 && (now - voicesCache.timestamp) < CACHE_DURATION) {
    return voicesCache.voices;
  }

  try {
    const response = await fetch(`${BASE_URL}/v1/voices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices from Eleven Labs API');
    }

    const data = await response.json();
    voicesCache.voices = data.voices;
    voicesCache.timestamp = now;
    return data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Fetch session data from cookies using your session manager
  const user = await sessionManager.GetSessionUser({ req, res });

  // If no session data or user is not authorized, return 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract text and voice parameters from the request body
  const { text, voiceName } = req.body;

  // Check if text and voice name are provided
  if (!text || !voiceName) {
    return res.status(400).json({ message: 'Text and voiceName parameters are required' });
  }

  try {
    // Get the list of voices
    const voices = await getVoices();

    // Find the voice by name
    const voice = voices.find(v => v.name.toLowerCase() === voiceName.toLowerCase());
    if (!voice) {
      return res.status(400).json({ message: 'Voice not found' });
    }

    const voiceId = voice.voice_id;



    // Call the Eleven Labs API to generate the speech audio
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

export default handler;



// English v1

// eleven_monolingual_v1
// Multilingual v1

// eleven_multilingual_v1
// Multilingual v2

// eleven_multilingual_v2
// Turbo v2

// eleven_turbo_v2