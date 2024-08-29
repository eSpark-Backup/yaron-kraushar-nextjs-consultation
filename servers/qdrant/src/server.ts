import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { vectorDb } from './vector_database'; // Make sure this path is correct

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to ensure vector size is correct
const validateVectorSize = (req: Request, res: Response, next: NextFunction) => {
  const vector = req.body.vector;
  if (!Array.isArray(vector) || vector.length !== 512) { // Adjust 512 if your vector size is different
    return res.status(400).json({ error: 'Invalid vector size. Expected 512 elements.' });
  }
  next();
};

// Add a new vector
app.post('/add-vector', validateVectorSize, async (req, res) => {
  try {
    const { vector, originalPerson, originalBlock, content } = req.body;
    const cacheDocument = {
      embedding: vector,
      originalPerson,
      originalBlock,
      content,
      timestamp: new Date()
    };
    const insertedId = await vectorDb.addVector(vector, cacheDocument);
    res.json({ success: true, insertedId });
  } catch (error) {
    console.error('Error adding vector:', error);
    res.status(500).json({ error: 'Failed to add vector' });
  }
});

// Search for similar vectors
app.post('/search-vector', validateVectorSize, async (req, res) => {
  try {
    const { vector, limit = 1 } = req.body;
    const results = await vectorDb.searchVector(vector, limit);
    res.json(results);
  } catch (error) {
    console.error('Error searching vector:', error);
    res.status(500).json({ error: 'Failed to search vector' });
  }
});

// Get a specific cache document
app.get('/cache-document/:id', async (req, res) => {
  try {
    const document = await vectorDb.getCacheDocument(req.params.id);
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error fetching cache document:', error);
    res.status(500).json({ error: 'Failed to fetch cache document' });
  }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await vectorDb.connect();
    console.log('Connected to databases');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully');
  await vectorDb.disconnect();
  process.exit(0);
});