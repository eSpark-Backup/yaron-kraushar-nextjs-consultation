"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorDb = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
const mongodb_2 = __importDefault(require("../../../services/mongodb"));
dotenv.config();
class VectorDatabase {
    constructor(config) {
        this.qdrantClient = new js_client_rest_1.QdrantClient({ url: config.qdrantUrl });
        this.collectionName = config.collectionName || 'vector_cache';
        this.vectorSize = config.vectorSize;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield mongodb_2.default;
            this.mongoDb = client.db("jimple");
            console.log("MongoDB connected");
            try {
                yield this.qdrantClient.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine'
                    }
                });
                console.log("Qdrant collection created or already exists");
            }
            catch (error) {
                console.log('Error creating Qdrant collection:', error);
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Close the Qdrant client connection - Feature doesn't exist on Qdrant
                console.log('Disconnected from Qdrant');
                // We don't need to close the MongoDB connection as it's managed by clientPromise
            }
            catch (error) {
                console.error('Error during disconnect:', error);
            }
        });
    }
    addVector(vector, cacheDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vector.length !== this.vectorSize) {
                throw new Error(`Vector size mismatch. Expected ${this.vectorSize}, got ${vector.length}`);
            }
            const id = new mongodb_1.ObjectId();
            yield this.qdrantClient.upsert(this.collectionName, {
                wait: true,
                points: [
                    {
                        id: id.toString(),
                        vector: vector,
                        payload: { mongoId: id.toString() }
                    }
                ]
            });
            const result = yield this.mongoDb.collection('chat_vector_cache').insertOne(Object.assign(Object.assign({}, cacheDocument), { _id: id }));
            return result.insertedId;
        });
    }
    searchVector(queryVector, limit = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryVector.length !== this.vectorSize) {
                throw new Error(`Vector size mismatch. Expected ${this.vectorSize}, got ${queryVector.length}`);
            }
            const searchResult = yield this.qdrantClient.search(this.collectionName, {
                vector: queryVector,
                limit: limit,
            });
            const documentPromises = searchResult.map((result) => __awaiter(this, void 0, void 0, function* () {
                const doc = yield this.getCacheDocument(result.payload.mongoId);
                return Object.assign(Object.assign({}, result), { document: doc });
            }));
            return Promise.all(documentPromises);
        });
    }
    getCacheDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongoDb.collection('chat_vector_cache').findOne({ _id: new mongodb_1.ObjectId(id) });
        });
    }
}
// Example usage:
const config = {
    qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
    vectorSize: 512, // This should match the size of your embedding vectors
};
exports.vectorDb = new VectorDatabase(config);
