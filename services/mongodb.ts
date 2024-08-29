import { ConnectOptions, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  console.log('lib/mongodb.js: development mode');
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri!);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  console.log('lib/mongodb.js: release mode');
  client = new MongoClient(uri || '');
  clientPromise = client.connect();
}

export default clientPromise;
