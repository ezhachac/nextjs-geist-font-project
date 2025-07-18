import { Request, Response } from 'express';
import { Account, Transaction } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { AccountType } from '../models/Account';

// Interfaz para crear cuenta
interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance?: number;
  color?: string;
  description?: string;
}

// Crear nueva cuenta
export const createAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { name, type, balance = 0, color = '#3B82F6', description }: CreateAccountRequest = req.body;

  // Validaciones básicas
  if (!name || !type) {
    throw createError('Nombre y tipo de cuenta son requeridos', 400);
  }

  if (!Object.values(AccountType).includes(type)) {
    throw createError('Tipo de cuenta inválido', 400);
  }

  if (balance < 0) {
    throw createError('El balance inicial no puede ser negativo', 400);
  }

  // Crear la cuenta
  const account = await Account.create({
    user_id: req.user.id,
    name: name.trim(),
    type,
    balance: parseFloat(balance.toString()),
    color: color || '#3B82F6',
    description: description?.trim() || null
  });

  res.status(201).json({
    success: true,
    message: 'Cuenta creada exitosamente',
    data: { account }
  });
});

// Obtener todas las cuentas del usuario
export const getAccounts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const accounts = await Account.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']]
  });

  // Calcular balance total
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance.toString());
  }, 0);

  res.json({
    success: true,
    data: {
      accounts,
      total_balance: totalBalance
    }
  });
});

// Obtener una cuenta específica
export const getAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;

  const account = await Account.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!account) {
    throw createError('Cuenta no encontrada', 404);
  }

  res.json({
    success: true,
    data: { account }
  });
});

// Actualizar cuenta
export const updateAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;
  const { name, type, color, description } = req.body;

  const account = await Account.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!account) {
    throw createError('Cuenta no encontrada', 404);
  }

  // Validaciones
  if (type && !Object.values(AccountType).includes(type)) {
    throw createError('Tipo de cuenta inválido', 400);
  }

  // Actualizar la cuenta
  await account.update({
    name: name ? name.trim() : account.name,
    type: type || account.type,
    color: color || account.color,
    description: description !== undefined ? description?.trim() || null : account.description
  });

  res.json({
    success: true,
    message: 'Cuenta actualizada exitosamente',
    data: { account }
  });
});

// Eliminar cuenta
export const deleteAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;

  const account = await Account.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!account) {
    throw createError('Cuenta no encontrada', 404);
  }

  // Verificar si la cuenta tiene transacciones
  const transactionCount = await Transaction.count({
    where: { account_id: account.id }
  });

  if (transactionCount > 0) {
    throw createError('No se puede eliminar una cuenta con transacciones asociadas', 400);
  }

  // Eliminar la cuenta
  await account.destroy();

  res.json({
    success: true,
    message: 'Cuenta eliminada exitosamente'
  });
});

// Obtener resumen de cuentas con estadísticas
export const getAccountsSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const accounts = await Account.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']]
  });

  // Calcular estadísticas por tipo de cuenta
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        total_balance: 0,
        accounts: []
      };
    }
    acc[type].count++;
    acc[type].total_balance += parseFloat(account.balance.toString());
    acc[type].accounts.push(account);
    return acc;
  }, {} as Record<string, any>);

  // Balance total
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance.toString());
  }, 0);

  // Cuenta con mayor balance
  const richestAccount = accounts.reduce((max, account) => {
    return parseFloat(account.balance.toString()) > parseFloat(max?.balance?.toString() || '0') ? account : max;
  }, null as any);

  res.json({
    success: true,
    data: {
      accounts,
      total_balance: totalBalance,
      accounts_by_type: accountsByType,
      total_accounts: accounts.length,
      richest_account: richestAccount
    }
  });
});
