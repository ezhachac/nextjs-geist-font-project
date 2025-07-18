import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  addToGoal,
  deleteGoal,
  getUpcomingGoals
} from '../controllers/goalController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD de metas
router.post('/', createGoal);
router.get('/', getGoals);
router.get('/upcoming', getUpcomingGoals);
router.get('/:id', getGoal);
router.put('/:id', updateGoal);
router.post('/:id/add', addToGoal);
router.delete('/:id', deleteGoal);

export default router;
