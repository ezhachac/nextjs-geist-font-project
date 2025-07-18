import { Request, Response } from 'express';
import { Transaction, Account, Category } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { TransactionType } from '../models/Transaction';

// Interfaz para crear transacción
interface CreateTransactionRequest {
  account_id: number;
  category_id: number;
  amount: number;
  type: TransactionType;
  description?: string;
  date?: string;
}

// Crear nueva transacción (ingreso o gasto)
export const createTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { account_id, category_id, amount, type, description, date }: CreateTransactionRequest = req.body;

  // Validaciones básicas
  if (!account_id || !category_id || !amount || !type) {
    throw createError('Cuenta, categoría, monto y tipo son requeridos', 400);
  }

  if (amount <= 0) {
    throw createError('El monto debe ser mayor a 0', 400);
  }

  if (!Object.values(TransactionType).includes(type)) {
    throw createError('Tipo de transacción inválido', 400);
  }

  // Verificar que la cuenta pertenece al usuario
  const account = await Account.findOne({
    where: { id: account_id, user_id: req.user.id }
  });

  if (!account) {
    throw createError('Cuenta no encontrada o no autorizada', 404);
  }

  // Verificar que la categoría existe
  const category = await Category.findByPk(category_id);
  if (!category) {
    throw createError('Categoría no encontrada', 404);
  }

  // Crear la transacción
  const transaction = await Transaction.create({
    user_id: req.user.id,
    account_id,
    category_id,
    amount: parseFloat(amount.toString()),
    type,
    description: description?.trim() || null,
    date: date ? new Date(date) : new Date()
  });

  // Actualizar el balance de la cuenta
  const balanceChange = type === TransactionType.INGRESO ? amount : -amount;
  await account.update({
    balance: parseFloat(account.balance.toString()) + balanceChange
  });

  // Obtener la transacción completa con relaciones
  const fullTransaction = await Transaction.findByPk(transaction.id, {
    include: [
      { model: Account, as: 'account' },
      { model: Category, as: 'category' }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Transacción creada exitosamente',
    data: { transaction: fullTransaction }
  });
});

// Obtener todas las transacciones del usuario
export const getTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { page = 1, limit = 20, type, account_id, category_id, start_date, end_date } = req.query;

  // Construir filtros
  const where: any = { user_id: req.user.id };

  if (type && Object.values(TransactionType).includes(type as TransactionType)) {
    where.type = type;
  }

  if (account_id) {
    where.account_id = parseInt(account_id as string);
  }

  if (category_id) {
    where.category_id = parseInt(category_id as string);
  }

  if (start_date || end_date) {
    where.date = {};
    if (start_date) {
      where.date.gte = new Date(start_date as string);
    }
    if (end_date) {
      where.date.lte = new Date(end_date as string);
    }
  }

  // Calcular offset para paginación
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Obtener transacciones con paginación
  const { count, rows: transactions } = await Transaction.findAndCountAll({
    where,
    include: [
      { model: Account, as: 'account' },
      { model: Category, as: 'category' }
    ],
    order: [['date', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit as string),
    offset
  });

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        current_page: parseInt(page as string),
        total_pages: Math.ceil(count / parseInt(limit as string)),
        total_items: count,
        items_per_page: parseInt(limit as string)
      }
    }
  });
});

// Obtener una transacción específica
export const getTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;

  const transaction = await Transaction.findOne({
    where: { id: parseInt(id), user_id: req.user.id },
    include: [
      { model: Account, as: 'account' },
      { model: Category, as: 'category' }
    ]
  });

  if (!transaction) {
    throw createError('Transacción no encontrada', 404);
  }

  res.json({
    success: true,
    data: { transaction }
  });
});

// Actualizar transacción
export const updateTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;
  const { account_id, category_id, amount, type, description, date } = req.body;

  // Buscar la transacción
  const transaction = await Transaction.findOne({
    where: { id: parseInt(id), user_id: req.user.id },
    include: [{ model: Account, as: 'account' }]
  });

  if (!transaction) {
    throw createError('Transacción no encontrada', 404);
  }

  // Validaciones si se proporciona nuevo monto
  if (amount !== undefined && amount <= 0) {
    throw createError('El monto debe ser mayor a 0', 400);
  }

  // Revertir el balance anterior si cambia el monto o tipo
  const oldAmount = parseFloat(transaction.amount.toString());
  const oldBalanceChange = transaction.type === TransactionType.INGRESO ? -oldAmount : oldAmount;
  
  // Actualizar balance de la cuenta anterior
  if (transaction.account) {
    await transaction.account.update({
      balance: parseFloat(transaction.account.balance.toString()) + oldBalanceChange
    });
  }

  // Actualizar la transacción
  await transaction.update({
    account_id: account_id || transaction.account_id,
    category_id: category_id || transaction.category_id,
    amount: amount !== undefined ? parseFloat(amount.toString()) : transaction.amount,
    type: type || transaction.type,
    description: description !== undefined ? description?.trim() || null : transaction.description,
    date: date ? new Date(date) : transaction.date
  });

  // Aplicar nuevo balance
  const newAmount = parseFloat(transaction.amount.toString());
  const newType = transaction.type;
  const newBalanceChange = newType === TransactionType.INGRESO ? newAmount : -newAmount;

  // Obtener la cuenta (puede haber cambiado)
  const account = await Account.findByPk(transaction.account_id);
  if (account) {
    await account.update({
      balance: parseFloat(account.balance.toString()) + newBalanceChange
    });
  }

  // Obtener la transacción actualizada con relaciones
  const updatedTransaction = await Transaction.findByPk(transaction.id, {
    include: [
      { model: Account, as: 'account' },
      { model: Category, as: 'category' }
    ]
  });

  res.json({
    success: true,
    message: 'Transacción actualizada exitosamente',
    data: { transaction: updatedTransaction }
  });
});

// Eliminar transacción
export const deleteTransaction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;

  const transaction = await Transaction.findOne({
    where: { id: parseInt(id), user_id: req.user.id },
    include: [{ model: Account, as: 'account' }]
  });

  if (!transaction) {
    throw createError('Transacción no encontrada', 404);
  }

  // Revertir el balance de la cuenta
  const amount = parseFloat(transaction.amount.toString());
  const balanceChange = transaction.type === TransactionType.INGRESO ? -amount : amount;
  
  if (transaction.account) {
    await transaction.account.update({
      balance: parseFloat(transaction.account.balance.toString()) + balanceChange
    });
  }

  // Eliminar la transacción
  await transaction.destroy();

  res.json({
    success: true,
    message: 'Transacción eliminada exitosamente'
  });
});
