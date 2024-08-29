// pages/api/getRemoteConfig.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRemoteConfigParameter } from '../../../services/firebase/firebaseAdmin.js';

interface Data {
  myVariable?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const { config_name } = req.body;
    const myVariable = await getRemoteConfigParameter(config_name);

    if (myVariable) {
      res.status(200).json({ myVariable });
    } else {
      res.status(404).json({ error: config_name +  ' not found' });
    }
  } catch (error) {
    console.error('Error fetching remote config:', error);
    res.status(500).json({ error: 'Failed to fetch remote config' });
  }
}
