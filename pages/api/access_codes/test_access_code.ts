// Description: API to test if an access code is valid
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../services/mongodb';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Server: test_access_code API");

    // Ensure this is a POST request
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Validate input
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'code is required' });
    }

    try {
        // Connect to the database
        const client = await clientPromise;
        const db = client.db("jimple");

        // Check if the code is valid
        const accessCode = await db.collection("access_codes").findOne({ code: code });

        if (!accessCode) {
            // Code not found
            return res.status(404).json({ error: 'Code not found' });
        }    

        return res.status(200).json(accessCode);
    } catch (error) {
        console.error("Failed to connect to DB or update data", error);
        return res.status(500).json({ error: 'Internal server error ' + error });
    }
}