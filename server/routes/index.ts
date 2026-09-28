import { Router } from 'express';
import healthRoutes from './health.routes.js';
import uploadRoutes from './upload.routes.js';

const apiRouter = Router();

// Mount health routes at /api/health
apiRouter.use('/health', healthRoutes);

// Mount upload routes at /api/upload
apiRouter.use('/upload', uploadRoutes);

export default apiRouter;

