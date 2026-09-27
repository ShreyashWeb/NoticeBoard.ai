import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST_PATH = path.resolve(__dirname, '../client/dist');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// Serve static frontend assets if client build exists
if (fs.existsSync(CLIENT_DIST_PATH)) {
  console.log(`[NoticeBoard.ai Backend] Serving static frontend from ${CLIENT_DIST_PATH}`);
  app.use(express.static(CLIENT_DIST_PATH));

  // SPA client-side fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(CLIENT_DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
} else {
  // Fallback root greeting when running in API-only / dev mode without client/dist
  app.get('/', (req, res) => {
    res.json({
      name: 'NoticeBoard.ai API Server',
      description: 'Smart Campus Notice Search Tool Backend (Run "npm run build" to generate frontend)',
      endpoints: {
        health: 'GET /api/health',
        categories: 'GET /api/categories',
        notices: 'GET /api/notices',
        noticeById: 'GET /api/notices/:id',
        search: 'GET or POST /api/search?q=...'
      }
    });
  });
}

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`[NoticeBoard.ai Backend] Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[NoticeBoard.ai Backend] Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[NoticeBoard.ai Backend] Server error:', err);
    }
  });
}

// Only start direct listener when not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer(DEFAULT_PORT);
}

export default app;


