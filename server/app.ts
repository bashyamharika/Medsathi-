import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import config from './config/env.js';
import apiRouter from './routes/index.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Root welcome endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'MedSathi API Foundation — Phase 1',
      health: '/api/health',
      docs: 'Phase 1 Foundation Only',
    });
  });

  // Mount API router under /api
  app.use('/api', apiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
