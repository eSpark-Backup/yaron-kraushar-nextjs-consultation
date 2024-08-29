import axios from 'axios';
import { sessionManager } from '../../../services/sessions/sessions';

export default async function handler(req, res) {
  
  // Fetch session data from cookies using your session manager
  const user = await sessionManager.GetSessionUser({ req, res });

  // If no session data or user is not authorized, return 401 Unauthorized
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Make a GET request to the 11labs API to get the voices
    const response = await axios.get('https://api.elevenlabs.io/v1/voices');

    // Extract the voices from the response data
    const voices = response.data.voices;

    // Return the voices as the response
    res.status(200).json(voices);
  } catch (error) {
    // Handle any errors that occur during the request
    console.error('Error getting voices from 11labs:', error);
    res.status(500).json({ error: 'Failed to get voices from 11labs' });
  }
}