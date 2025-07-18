import { Request, Response } from 'express';
import { Goal } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { GoalStatus } from '../models/Goal';

// Interfaz para crear meta
interface CreateGoalRequest {
  name: string;
  target_amount: number;
  target_date: string;
  description?: string;
}

// Crear nueva meta
export const createGoal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { name, target_amount, target_date, description }: CreateGoalRequest = req.body;

  // Validaciones básicas
  if (!name || !target_amount || !target_date) {
    throw createError('Nombre, monto objetivo y fecha objetivo son requeridos', 400);
  }

  if (target_amount <= 0) {
    throw createError('El monto objetivo debe ser mayor a 0', 400);
  }

  const targetDate = new Date(target_date);
  if (targetDate <= new Date()) {
    throw createError('La fecha objetivo debe ser futura', 400);
  }

  // Crear la meta
  const goal = await Goal.create({
    user_id: req.user.id,
    name: name.trim(),
    target_amount: parseFloat(target_amount.toString()),
    target_date: targetDate,
    description: description?.trim() || null
  });

  res.status(201).json({
    success: true,
    message: 'Meta creada exitosamente',
    data: { goal }
  });
});

// Obtener todas las metas del usuario
export const getGoals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { status } = req.query;

  // Construir filtros
  const where: any = { user_id: req.user.id };
  
  if (status && Object.values(GoalStatus).includes(status as GoalStatus)) {
    where.status = status;
  }

  const goals = await Goal.findAll({
    where,
    order: [['created_at', 'DESC']]
  });

  // Calcular estadísticas
  const totalGoals = goals.length;
  const activeGoals = goals.filter(goal => goal.status === GoalStatus.ACTIVA).length;
  const completedGoals = goals.filter(goal => goal.status === GoalStatus.COMPLETADA).length;
  const totalTargetAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.target_amount.toString()), 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.current_amount.toString()), 0);

  res.json({
    success: true,
    data: {
      goals,
      statistics: {
        total_goals: totalGoals,
        active_goals: activeGoals,
        completed_goals: completedGoals,
        total_target_amount: totalTargetAmount,
        total_current_amount: totalCurrentAmount,
        overall_progress: totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
      }
    }
  });
});

// Obtener una meta específica
export const getGoal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;

  const goal = await Goal.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!goal) {
    throw createError('Meta no encontrada', 404);
  }

  res.json({
    success: true,
    data: { goal }
  });
});

// Actualizar meta
export const updateGoal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;
  const { name, target_amount, target_date, description, status } = req.body;

  const goal = await Goal.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!goal) {
    throw createError('Meta no encontrada', 404);
  }

  // Validaciones
  if (target_amount !== undefined && target_amount <= 0) {
    throw createError('El monto objetivo debe ser mayor a 0', 400);
  }

  if (target_date) {
    const newTargetDate = new Date(target_date);
    if (newTargetDate <= new Date()) {
      throw createError('La fecha objetivo debe ser futura', 400);
    }
  }

  if (status && !Object.values(GoalStatus).includes(status)) {
    throw createError('Estado de meta inválido', 400);
  }

  // Actualizar la meta
  await goal.update({
    name: name ? name.trim() : goal.name,
    target_amount: target_amount !== undefined ? parseFloat(target_amount.toString()) : goal.target_amount,
    target_date: target_date ? new Date(target_date) : goal.target_date,
    description: description !== undefined ? description?.trim() || null : goal.description,
    status: status || goal.status
  });

  res.json({
    success: true,
    message: 'Meta actualizada exitosamente',
    data: { goal }
  });
});

// Agregar dinero a una meta
export const addToGoal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw createError('El monto debe ser mayor a 0', 400);
  }

  const goal = await Goal.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!goal) {
    throw createError('Meta no encontrada', 404);
  }

  if (goal.status !== GoalStatus.ACTIVA) {
    throw createError('Solo se puede agregar dinero a metas activas', 400);
  }

  // Actualizar el monto actual
  const newCurrentAmount = parseFloat(goal.current_amount.toString()) + parseFloat(amount.toString());
  
  // Verificar si se completó la meta
  const newStatus = newCurrentAmount >= parseFloat(goal.target_amount.toString()) 
    ? GoalStatus.COMPLETADA 
    : goal.status;

  await goal.update({
    current_amount: newCurrentAmount,
    status: newStatus
  });

  res.json({
    success: true,
    message: newStatus === GoalStatus.COMPLETADA 
      ? '¡Felicidades! Meta completada exitosamente' 
      : 'Dinero agregado a la meta exitosamente',
    data: { goal }
  });
});

// Eliminar meta
export const deleteGoal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { id } = req.params;

  const goal = await Goal.findOne({
    where: { id: parseInt(id), user_id: req.user.id }
  });

  if (!goal) {
    throw createError('Meta no encontrada', 404);
  }

  // Eliminar la meta
  await goal.destroy();

  res.json({
    success: true,
    message: 'Meta eliminada exitosamente'
  });
});

// Obtener metas próximas a vencer
export const getUpcomingGoals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { days = 30 } = req.query;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days as string));

  const goals = await Goal.findAll({
    where: {
      user_id: req.user.id,
      status: GoalStatus.ACTIVA,
      target_date: {
        lte: futureDate
      }
    },
    order: [['target_date', 'ASC']]
  });

  res.json({
    success: true,
    data: { goals }
  });
});
