import clientPromise from '../mongodb';

export enum CallStatus {
  Started = 'started',
  Ended = 'ended',
  Analyzed = 'analyzed',
  Unknown = 'unknown',
}

export interface CallStatusData {
  jimple_status: any;
  status: CallStatus;
  data: Record<string, any>; // Arbitrary data object
}

class CallStatusManager {
  private static instance: CallStatusManager;
  private dbName: string = 'jimple';
  private collectionName: string = 'jimple_calls';

  private constructor() {}

  public static getInstance(): CallStatusManager {
    if (!CallStatusManager.instance) {
      CallStatusManager.instance = new CallStatusManager();
    }
    return CallStatusManager.instance;
  }

  private async getCollection() {
    const client = await clientPromise;
    const db = client.db(this.dbName);
    return db.collection(this.collectionName);
  }

  public async setCallStatus(
    callId: string,
    status: CallStatus,
    data: Record<string, any> = {},
  ): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne(
        { call_id: callId },
        { $set: { status, data } },
        { upsert: true },
      );
    } catch (error) {
      console.error(`Failed to set call status for callId: ${callId}`, error);
      throw new Error('Failed to set call status');
    }
  }

  public async getCallStatus(callId: string): Promise<CallStatusData | null> {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne({ call_id: callId });

      if (result) {
        return {
          jimple_status: result.jimple_status, // Ensure `jimple_status` exists in `result`
          status: result.status,
          data: result.data,
        };
      }

      return null; // If no result is found, return null
    } catch (error) {
      console.error(`Failed to get call status for callId: ${callId}`, error);
      throw new Error('Failed to get call status');
    }
  }

  public async getAllCallStatuses(): Promise<CallStatusData[]> {
    try {
      const collection = await this.getCollection();
      const results = await collection.find().toArray();
      return results.map((result) => ({
        status: result.status,
        data: result.data,
      }));
    } catch (error) {
      console.error('Failed to get all call statuses', error);
      throw new Error('Failed to get all call statuses');
    }
  }
}

export const callStatusManager = CallStatusManager.getInstance();
