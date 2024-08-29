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
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const vector_database_1 = require("./vector_database"); // Make sure this path is correct
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Middleware to ensure vector size is correct
const validateVectorSize = (req, res, next) => {
    const vector = req.body.vector;
    if (!Array.isArray(vector) || vector.length !== 512) { // Adjust 512 if your vector size is different
        return res.status(400).json({ error: 'Invalid vector size. Expected 512 elements.' });
    }
    next();
};
// Add a new vector
app.post('/add-vector', validateVectorSize, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vector, originalPerson, originalBlock, content } = req.body;
        const cacheDocument = {
            embedding: vector,
            originalPerson,
            originalBlock,
            content,
            timestamp: new Date()
        };
        const insertedId = yield vector_database_1.vectorDb.addVector(vector, cacheDocument);
        res.json({ success: true, insertedId });
    }
    catch (error) {
        console.error('Error adding vector:', error);
        res.status(500).json({ error: 'Failed to add vector' });
    }
}));
// Search for similar vectors
app.post('/search-vector', validateVectorSize, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vector, limit = 1 } = req.body;
        const results = yield vector_database_1.vectorDb.searchVector(vector, limit);
        res.json(results);
    }
    catch (error) {
        console.error('Error searching vector:', error);
        res.status(500).json({ error: 'Failed to search vector' });
    }
}));
// Get a specific cache document
app.get('/cache-document/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield vector_database_1.vectorDb.getCacheDocument(req.params.id);
        if (document) {
            res.json(document);
        }
        else {
            res.status(404).json({ error: 'Document not found' });
        }
    }
    catch (error) {
        console.error('Error fetching cache document:', error);
        res.status(500).json({ error: 'Failed to fetch cache document' });
    }
}));
const PORT = process.env.PORT || 3000;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield vector_database_1.vectorDb.connect();
            console.log('Connected to databases');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}
startServer();
// Graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down gracefully');
    yield vector_database_1.vectorDb.disconnect();
    process.exit(0);
}));
