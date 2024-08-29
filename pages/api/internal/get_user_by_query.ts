import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../services/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { query } = req.body;

  if (!query || typeof query !== 'object') {
    return res.status(400).json({ message: 'Invalid query' });
  }

  try {
    if (query['stripe_link.expires'].$gt) {
      query['stripe_link.expires'].$gt = new Date(
        query['stripe_link.expires'].$gt,
      );
    } else if (query['resetPassword.expires'].$gt) {
      query['resetPassword.expires'].$gt = new Date(
        query['resetPassword.expires'].$gt,
      );
    }
    const client = await clientPromise;
    const db = client.db('jimple');
    const user = await db.collection('users').findOne(query);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}
