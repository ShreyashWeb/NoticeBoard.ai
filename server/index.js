import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

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

// Root greeting
app.get('/', (req, res) => {
  res.json({
    name: 'NoticeBoard.ai API Server',
    description: 'Smart Campus Notice Search Tool Backend',
    endpoints: {
      health: 'GET /api/health',
      categories: 'GET /api/categories',
      notices: 'GET /api/notices',
      noticeById: 'GET /api/notices/:id',
      search: 'GET or POST /api/search?q=...'
    }
  });
});

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

startServer(DEFAULT_PORT);
