import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchNotices, SIMILARITY_THRESHOLD, generateQueryExpansions } from '../search.js';
import { searchEngine } from '../services/searchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.resolve(__dirname, '../../data/notices.json');

const router = express.Router();

function getRawNotices() {
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// GET /api/health - Engine status and healthcheck
router.get('/health', (req, res) => {
  res.json({
    ...searchEngine.getStatus(),
    similarityThreshold: SIMILARITY_THRESHOLD,
    hybridRetrieval: {
      enabled: true,
      semanticWeight: 0.65,
      keywordWeight: 0.35
    },
    queryExpansion: {
      enabled: true,
      variantsCount: 2
    }
  });
});

// GET /api/categories - List available notice categories with counts
router.get('/categories', (req, res) => {
  res.json({
    categories: searchEngine.getCategories()
  });
});

// GET /api/notices - Get all notices with optional category filter
router.get('/notices', (req, res) => {
  const { category } = req.query;
  const notices = searchEngine.getAllNotices(category);
  res.json({
    total: notices.length,
    notices
  });
});

// GET /api/notices/:id - Get a single notice by ID
router.get('/notices/:id', (req, res) => {
  const notice = searchEngine.getNoticeById(req.params.id);
  if (!notice) {
    return res.status(404).json({ error: 'Notice not found', id: req.params.id });
  }
  res.json({ notice });
});

// POST /api/search or GET /api/search
router.all('/search', async (req, res) => {
  try {
    const q = req.method === 'POST' ? req.body.q || req.body.query : req.query.q || req.query.query;
    const category = req.method === 'POST' ? req.body.category : req.query.category;
    const threshold = parseFloat(req.method === 'POST' ? req.body.threshold : req.query.threshold);

    if (!q || !q.trim()) {
      return res.json({
        query: '',
        count: 0,
        results: [],
        message: 'No query provided.'
      });
    }

    let allNotices = getRawNotices();
    if (category && category !== 'All') {
      allNotices = allNotices.filter(n => n.category.toLowerCase() === category.toLowerCase());
    }

    const audience = (req.method === 'POST' ? req.body.audience : req.query.audience) || 'students';

    const [results, expansions] = await Promise.all([
      searchNotices(q, allNotices, {
        threshold: isNaN(threshold) ? undefined : threshold,
        audience
      }),
      generateQueryExpansions(q)
    ]);

    if (results.length === 0) {
      return res.json({
        query: q,
        count: 0,
        results: [],
        queryExpansion: {
          originalQuery: q,
          expandedQueries: expansions
        },
        message: 'No matching information found.'
      });
    }

    res.json({
      query: q,
      count: results.length,
      queryExpansion: {
        originalQuery: q,
        expandedQueries: expansions
      },
      results
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to execute search',
      details: err.message
    });
  }
});

export default router;
