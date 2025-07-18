import { Router } from 'express';
import {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getAccountsSummary
} from '../controllers/accountController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD de cuentas
router.post('/', createAccount);
router.get('/', getAccounts);
router.get('/summary', getAccountsSummary);
router.get('/:id', getAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
