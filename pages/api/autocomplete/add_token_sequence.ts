import type { NextApiRequest, NextApiResponse } from 'next';
import { sessionManager } from '../../../services/sessions/sessions';
import { addTokenPair } from '../../../services/autocomplete/autocomplete';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const user = await sessionManager.GetSessionUser({ req, res });
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { tokens } = req.body;

  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ message: 'Bad Request: Invalid or empty tokens array' });
  }

  try {
    let addedPairsCount = 0;

    for (let i = 0; i < tokens.length - 1; i++) {
      const precedingToken = tokens[i];
      const nextToken = tokens[i + 1];
      
      await addTokenPair({ precedingToken, nextToken },user._id);
      addedPairsCount++;
    }

    if (addedPairsCount === 0) {
      res.status(200).json({ message: 'No token pairs to add' });
    } else {
      res.status(200).json({ 
        message: 'Token pairs added successfully', 
        addedPairsCount 
      });
    }
  } catch (error) {
    console.error('Error handling the request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
