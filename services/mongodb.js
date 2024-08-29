"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
const mongodb_1 = require("mongodb");
const uri = process.env.MONGODB_URI;
let client;
let clientPromise;
if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
}
//console.log("process.env.MONGODB_URI = " + process.env.MONGODB_URI);
if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    console.log("lib/mongodb.js: development mode");
    if (!global._mongoClientPromise) {
        client = new mongodb_1.MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
    // console.log("lib/mongodb.js: client: "+client)
    // console.log("lib/mongodb.js: clientPromise: "+clientPromise)
}
else {
    // In production mode, it's best to not use a global variable.
    // console.log("lib/mongodb.js: production mode");
    console.log("lib/mongodb.js: release mode");
    client = new mongodb_1.MongoClient(uri || "");
    clientPromise = client.connect();
}
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
exports.default = clientPromise;
