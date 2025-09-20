import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
// Remove unused import

import { convertRouter } from './routes/convert';
import { downloadRouter } from './routes/download';
import { cleanupService } from './services/cleanup';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');
const TMP_DIR = process.env.TMP_DIR || path.join(process.cwd(), 'tmp');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/convert', convertRouter);
app.use('/api/download', downloadRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    maxFileSize: `${MAX_FILE_SIZE_MB}MB`,
    tmpDir: TMP_DIR
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start cleanup service
cleanupService.start();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SnapConvert backend running on port ${PORT}`);
  console.log(`📁 Temp directory: ${TMP_DIR}`);
  console.log(`📏 Max file size: ${MAX_FILE_SIZE_MB}MB`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  cleanupService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  cleanupService.stop();
  process.exit(0);
});
