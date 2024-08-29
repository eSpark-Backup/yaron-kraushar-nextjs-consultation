import crypto from 'crypto';
import { getCookie } from 'cookies-next';
import { ObjectId } from 'mongodb';
import clientPromise from '../mongodb';
import { User } from '../user_entity';

const SESSION_ID_BYTES = 32;
export const SESSION_TTL_MS = 364 * 24 * 60 * 60 * 1000; // 364 days

export interface SessionData {
  userId: ObjectId;
  timeStamp: number;
}

class SessionManager {
  private dbName: string = 'jimple';
  private collectionName: string = 'sessions';

  private constructor() {}

  static getInstance(): SessionManager {
    if (!global.jimple_sessionManager) {
      global.jimple_sessionManager = new SessionManager();
    }
    return global.jimple_sessionManager;
  }

  private async getCollection() {
    const client = await clientPromise;
    const db = client.db(this.dbName);
    return db.collection(this.collectionName);
  }

  public GenerateSessionID(): string {
    return crypto.randomBytes(SESSION_ID_BYTES).toString('base64');
  }

  public async AddSessionUser(sessionId: string, user: User): Promise<void> {
    if (!sessionId || !user) {
      throw new Error('Invalid sessionId or user');
    }
    const sessionData: SessionData = {
      userId: new ObjectId(user._id as string),
      timeStamp: Math.floor(Date.now() / 1000),
    }; // Timestamp in seconds
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: sessionId },
      { $set: sessionData },
      { upsert: true },
    );
  }

  public async GetSessionUser(context: any): Promise<User | null> {
    try {
      const sessionId = this.GetSessionIDFromClientCookie(context);
      if (!sessionId) return null;
      const collection = await this.getCollection();
      const sessionData = await collection.findOne({ _id: sessionId });
      if (!sessionData) return null;
      // Fetch the user details using the userId from the sessionData
      const userCollection = (await clientPromise)
        .db(this.dbName)
        .collection('users');
      const user = await userCollection.findOne({ _id: sessionData.userId });
      return user ? user : null;
    } catch (e) {
      console.error('Error getting session data: ', e);
      return null;
    }
  }

  public async DeleteSessionData(context: any): Promise<void> {
    try {
      const sessionId = this.GetSessionIDFromClientCookie(context);
      if (sessionId) {
        const collection = await this.getCollection();

        // Find the session to get the userId
        const session = await collection.findOne({ _id: sessionId });
        if (session && session.userId) {
          // Delete all sessions for the found userId
          await collection.deleteMany({ userId: session.userId });
        } else {
          console.warn(
            `Session with ID ${sessionId} not found or has no userId.`,
          );
        }
      } else {
        console.warn('Session ID not found in client cookie.');
      }
    } catch (e) {
      console.error('Error deleting session data: ', e);
    }
  }

  public async DeleteSessionDataByUserAppId(
    app_user_id: string,
  ): Promise<void> {
    console.log('DeleteSessionDataByUserAppId');
    try {
      const userCollection = (await clientPromise)
        .db(this.dbName)
        .collection('users');
      const user = await userCollection.findOne({
        'revenuecat.app_user_id': app_user_id,
      });
      if (user) {
        const collection = await this.getCollection();
        await collection.deleteMany({ userId: user._id });
      }
    } catch (e) {
      console.error('Error deleting session data by user app ID: ', e);
    }
  }

  private GetSessionIDFromClientCookie(context: any): string | null {
    const sessionCookie = getCookie('sessionId', context);
    return sessionCookie ? String(sessionCookie) : null;
  }
}

export const sessionManager = SessionManager.getInstance();
