import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";

export interface TokenPair {
  precedingToken: string;
  nextToken: string;
}

const autocompleteServiceSymbol = Symbol('autocompleteServiceSymbol');

declare global {
  namespace NodeJS {
    interface Global {
      [autocompleteServiceSymbol]: AutocompleteService;
    }
  }
}

export class AutocompleteService {
  private dbName: string = "jimple";
  private globalCollectionName: string = "token_pairs";
  private userCollectionName: string = "user_token_pairs";

  private constructor() {}

  public static getInstance(): AutocompleteService {
    const sym = autocompleteServiceSymbol;
    
    if (!global[sym]) {
      global[sym] = new AutocompleteService();
    }

    return global[sym];
  }

  private async getCollection(isUserSpecific: boolean) {
    const client = await clientPromise;
    const db = client.db(this.dbName);
    return db.collection(isUserSpecific ? this.userCollectionName : this.globalCollectionName);
  }

  async addTokenPair(tokenPair: TokenPair, userId: string): Promise<void> {
    const { precedingToken, nextToken } = tokenPair;

    if (!precedingToken || !nextToken || !userId) {
      throw new Error('Missing tokens or userId');
    }

    const userObjectId = new ObjectId(userId);

    const globalCollection = await this.getCollection(false);
    const userCollection = await this.getCollection(true);

    // Add to global collection
    await globalCollection.updateOne(
      { precedingToken },
      { 
        $inc: { [`nextTokens.${nextToken}`]: 1 },
        $setOnInsert: { precedingToken }
      },
      { upsert: true }
    );

    // Add to user-specific collection
    await userCollection.updateOne(
      { userId: userObjectId, precedingToken },
      { 
        $inc: { [`nextTokens.${nextToken}`]: 1 },
        $setOnInsert: { userId: userObjectId, precedingToken }
      },
      { upsert: true }
    );
  }

  async removeTokenPair(tokenPair: TokenPair, userId: string, forceRemove: boolean = false): Promise<void> {
    const { precedingToken, nextToken } = tokenPair;

    if (!precedingToken || !nextToken || !userId) {
      throw new Error('Missing tokens or userId');
    }

    const userObjectId = new ObjectId(userId);

    const globalCollection = await this.getCollection(false);
    const userCollection = await this.getCollection(true);

    const collections = [globalCollection, userCollection];
    const queries = [{ precedingToken }, { userId: userObjectId, precedingToken }];

    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const query = queries[i];

      if (forceRemove) {
        await collection.updateOne(
          query,
          { $unset: { [`nextTokens.${nextToken}`]: "" } }
        );
      } else {
        await collection.updateOne(
          { ...query, [`nextTokens.${nextToken}`]: { $gt: 0 } },
          { $inc: { [`nextTokens.${nextToken}`]: -1 } }
        );
      }

      const updatedDoc = await collection.findOne(query);
      if (updatedDoc) {
        const hasPositiveCounts = Object.values(updatedDoc.nextTokens).some(count => (count as number) > 0);
        if (!hasPositiveCounts) {
          await collection.deleteOne(query);
        }
      }
    }
  }

  async getNextTokens(precedingToken: string, userId: string): Promise<Array<{ token: string, count: number }>> {
    if (!precedingToken || !userId) {
      throw new Error('Missing preceding token or userId');
    }

    const userObjectId = new ObjectId(userId);

    const userCollection = await this.getCollection(true);
    const globalCollection = await this.getCollection(false);

    const userResult = await userCollection.findOne({ userId: userObjectId, precedingToken });
    const globalResult = await globalCollection.findOne({ precedingToken });

    const userTokens = userResult 
      ? Object.entries(userResult.nextTokens)
          .map(([token, count]) => ({ token, count: count as number }))
          .sort((a, b) => b.count - a.count)
      : [];

    const globalTokens = globalResult 
      ? Object.entries(globalResult.nextTokens)
          .map(([token, count]) => ({ token, count: count as number }))
          .sort((a, b) => b.count - a.count)
      : [];

    // Create a set of user tokens for quick lookup
    const userTokenSet = new Set(userTokens.map(t => t.token));

    // Filter out global tokens that already appear in user tokens
    const filteredGlobalTokens = globalTokens.filter(t => !userTokenSet.has(t.token));

    // Combine user tokens and filtered global tokens
    return [...userTokens, ...filteredGlobalTokens];
  }
}

// Export methods instead of the instance
export const addTokenPair = AutocompleteService.getInstance().addTokenPair.bind(AutocompleteService.getInstance());
export const removeTokenPair = AutocompleteService.getInstance().removeTokenPair.bind(AutocompleteService.getInstance());
export const getNextTokens = AutocompleteService.getInstance().getNextTokens.bind(AutocompleteService.getInstance());