import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check API service availability
 * @access  Public
 */
router.get('/', healthController.getHealth);

export default router;
