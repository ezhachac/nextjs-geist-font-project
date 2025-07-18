import { Router } from 'express';
import {
  getMonthlyAnalysis,
  getProjections,
  getDashboardSummary
} from '../controllers/analyticsController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de análisis
router.get('/monthly', getMonthlyAnalysis);
router.get('/projections', getProjections);
router.get('/dashboard', getDashboardSummary);

export default router;
