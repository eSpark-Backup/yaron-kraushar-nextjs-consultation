import { QdrantClient } from '@qdrant/js-client-rest';
import { ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import clientPromise from '../../../services/mongodb';

dotenv.config();

interface CacheDocument {
  _id: ObjectId;
  embedding: number[];
  originalPerson: string;
  originalBlock: string;
  content: string;
  timestamp: Date;
}

interface VectorDatabaseConfig {
  qdrantUrl: string;
  vectorSize: number;
  collectionName?: string;
}

class VectorDatabase {
  private qdrantClient: QdrantClient;
  private mongoDb: any;
  private collectionName: string;
  private vectorSize: number;

  constructor(config: VectorDatabaseConfig) {
    this.qdrantClient = new QdrantClient({ url: config.qdrantUrl });
    this.collectionName = config.collectionName || 'vector_cache';
    this.vectorSize = config.vectorSize;
  }

  async connect() {
    const client = await clientPromise;
    this.mongoDb = client.db("jimple");
    console.log("MongoDB connected");

    try {
      await this.qdrantClient.createCollection(this.collectionName, {
        vectors: {
          size: this.vectorSize,
          distance: 'Cosine'
        }
      });
      console.log("Qdrant collection created or already exists");
    } catch (error) {
      console.log('Error creating Qdrant collection:', error);
    }
  }

  async disconnect() {
    try {
      // Close the Qdrant client connection - Feature doesn't exist on Qdrant
      console.log('Disconnected from Qdrant');
      
      // We don't need to close the MongoDB connection as it's managed by clientPromise
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  async addVector(vector: number[], cacheDocument: Omit<CacheDocument, '_id'>) {
    if (vector.length !== this.vectorSize) {
      throw new Error(`Vector size mismatch. Expected ${this.vectorSize}, got ${vector.length}`);
    }
    const id = new ObjectId();
    await this.qdrantClient.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: id.toString(),
          vector: vector,
          payload: { mongoId: id.toString() }
        }
      ]
    });
    const result = await this.mongoDb.collection('chat_vector_cache').insertOne({
      ...cacheDocument,
      _id: id,
    });
    return result.insertedId;
  }

  async searchVector(queryVector: number[], limit: number = 1) {
    if (queryVector.length !== this.vectorSize) {
      throw new Error(`Vector size mismatch. Expected ${this.vectorSize}, got ${queryVector.length}`);
    }
    const searchResult = await this.qdrantClient.search(this.collectionName, {
      vector: queryVector,
      limit: limit,
    });
    
    const documentPromises = searchResult.map(async (result: any) => {
      const doc = await this.getCacheDocument(result.payload.mongoId);
      return { ...result, document: doc };
    });

    return Promise.all(documentPromises);
  }

  async getCacheDocument(id: string): Promise<CacheDocument | null> {
    return await this.mongoDb.collection('chat_vector_cache').findOne({ _id: new ObjectId(id) });
  }
}

// Example usage:
const config: VectorDatabaseConfig = {
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  vectorSize: 512, // This should match the size of your embedding vectors
};

export const vectorDb = new VectorDatabase(config);