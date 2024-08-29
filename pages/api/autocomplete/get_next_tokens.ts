import type { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../services/sessions/sessions';
import { getNextTokens } from '../../../services/autocomplete/autocomplete';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const user = await sessionManager.GetSessionUser({ req, res });
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    console.log('token:', token);
    return res.status(400).json({ message: 'Bad Request: Missing token' });
  }

  try {
    const nextTokens = await getNextTokens(token, user._id);
    res.status(200).json(nextTokens);
  } catch (error) {
    console.error('Error handling the request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
