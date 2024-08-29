import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import clientPromise from '../../services/mongodb';
import { sha256 } from '../../services/cryptography';

const username = 'admin';
const password = "hello";  // Some random UUID

async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Server: Generate Tokens API");

    // Get username and password from the request's body
    const user = req.body.username;
    const pass = req.body.password;
    const numTokens = req.body.numTokens;
    console.log(`Username: ${user}, Password: ${pass}, Number of tokens: ${numTokens}`)

    // Check the username and password
    if (user !== username) {
        return res.status(401).json({ field: "username", error: 'Invalid username' });
    }

    if (pass !== password) {
        return res.status(401).json({ field: "password", error: 'Invalid password' });
    }

    if (numTokens < 1 || numTokens > 100) {
        return res.status(400).json({ field: "numTokens", error: 'Invalid number of tokens' });
    }

    try {
        // Access MongoDB database
        const client = await clientPromise;
        const db = client.db("jimple");

        // Generate tokens and store them in MongoDB
        const tokens = Array.from({ length: numTokens }, () => sha256(uuidv4()).toString());
        const records = tokens.map(token => ({ token, createdAt: new Date() }));

        await db.collection("access_tokens").insertMany(records);

        // Respond with the generated tokens
        res.status(200).json({ tokens: tokens });
    } catch (e) {
        // Return Internal Server Error
        res.status(500).json({ error: `Server error: ${e}` })
        console.error(e);
    }
};

export default handler;
