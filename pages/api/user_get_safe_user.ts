import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "bson";
import { sessionManager } from '../../services/sessions/sessions';
import clientPromise from '../../services/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Server: Get Safe User Data");

    const user = await sessionManager.GetSessionUser({ req, res });

    if (!user) {
        console.log("User not logged in");
        return res.status(401).json({ data: "User not logged in" });
    }

    console.log("User logged in");
    try {
        const client = await clientPromise;
        const db = client.db("jimple");

        if (!user._id || !ObjectId.isValid(user._id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const userId = new ObjectId(user._id);
        const userDB = await db.collection("users").findOne({ _id: userId });

        if (!userDB) {
            console.log("Can't find user in database");
            return res.status(403).json({ data: "Can't find user in database" });
        }

        const { password, passwordIV, ...safeUser } = userDB;
        return res.status(200).json(safeUser);
    } catch (e) {
        console.error("user_get_safe_user error:", e);
        return res.status(400).json({ error: e.message });
    }
}
