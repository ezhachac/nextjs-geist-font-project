import { Request, Response } from 'express';
import { Transaction, Account, Category, Goal } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { TransactionType } from '../models/Transaction';

// Obtener análisis financiero mensual
export const getMonthlyAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { year, month } = req.query;
  const currentDate = new Date();
  const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();
  const targetMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;

  // Fechas de inicio y fin del mes
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  // Obtener transacciones del mes
  const transactions = await Transaction.findAll({
    where: {
      user_id: req.user.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: [
      { model: Category, as: 'category' },
      { model: Account, as: 'account' }
    ]
  });

  // Calcular totales
  const ingresos = transactions
    .filter(t => t.type === TransactionType.INGRESO)
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const gastos = transactions
    .filter(t => t.type === TransactionType.GASTO)
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const balance = ingresos - gastos;
  const porcentajeAhorro = ingresos > 0 ? (balance / ingresos) * 100 : 0;

  // Gastos por categoría
  const gastosPorCategoria = transactions
    .filter(t => t.type === TransactionType.GASTO)
    .reduce((acc: any, transaction) => {
      const categoryName = transaction.category?.name || 'Sin categoría';
      const categoryColor = transaction.category?.color || '#6B7280';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          amount: 0,
          color: categoryColor,
          count: 0
        };
      }
      
      acc[categoryName].amount += parseFloat(transaction.amount.toString());
      acc[categoryName].count += 1;
      return acc;
    }, {});

  // Ingresos por categoría
  const ingresosPorCategoria = transactions
    .filter(t => t.type === TransactionType.INGRESO)
    .reduce((acc: any, transaction) => {
      const categoryName = transaction.category?.name || 'Sin categoría';
      const categoryColor = transaction.category?.color || '#10B981';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          amount: 0,
          color: categoryColor,
          count: 0
        };
      }
      
      acc[categoryName].amount += parseFloat(transaction.amount.toString());
      acc[categoryName].count += 1;
      return acc;
    }, {});

  // Transacciones por día
  const transaccionesPorDia = transactions.reduce((acc: any, transaction) => {
    const day = transaction.date.getDate();
    if (!acc[day]) {
      acc[day] = { ingresos: 0, gastos: 0, balance: 0 };
    }
    
    const amount = parseFloat(transaction.amount.toString());
    if (transaction.type === TransactionType.INGRESO) {
      acc[day].ingresos += amount;
    } else {
      acc[day].gastos += amount;
    }
    acc[day].balance = acc[day].ingresos - acc[day].gastos;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      period: {
        year: targetYear,
        month: targetMonth,
        start_date: startDate,
        end_date: endDate
      },
      summary: {
        total_ingresos: ingresos,
        total_gastos: gastos,
        balance,
        porcentaje_ahorro: porcentajeAhorro,
        total_transacciones: transactions.length
      },
      gastos_por_categoria: Object.values(gastosPorCategoria),
      ingresos_por_categoria: Object.values(ingresosPorCategoria),
      transacciones_por_dia: transaccionesPorDia,
      alertas: {
        presupuesto_excedido: balance < 0,
        ahorro_bajo: porcentajeAhorro < 10,
        gastos_altos: gastos > ingresos * 0.8
      }
    }
  });
});

// Obtener proyecciones financieras
export const getProjections = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const { months = 6 } = req.query;
  const projectionMonths = parseInt(months as string);

  // Obtener datos históricos de los últimos 6 meses
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const historicalTransactions = await Transaction.findAll({
    where: {
      user_id: req.user.id,
      date: {
        gte: sixMonthsAgo
      }
    }
  });

  // Calcular promedios mensuales
  const monthlyData: any = {};
  
  historicalTransactions.forEach(transaction => {
    const monthKey = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { ingresos: 0, gastos: 0 };
    }
    
    const amount = parseFloat(transaction.amount.toString());
    if (transaction.type === TransactionType.INGRESO) {
      monthlyData[monthKey].ingresos += amount;
    } else {
      monthlyData[monthKey].gastos += amount;
    }
  });

  const monthlyValues = Object.values(monthlyData) as any[];
  const avgIngresos = monthlyValues.length > 0 
    ? monthlyValues.reduce((sum: number, month: any) => sum + month.ingresos, 0) / monthlyValues.length 
    : 0;
  const avgGastos = monthlyValues.length > 0 
    ? monthlyValues.reduce((sum: number, month: any) => sum + month.gastos, 0) / monthlyValues.length 
    : 0;

  // Generar proyecciones
  const projections = [];
  const currentDate = new Date();

  for (let i = 1; i <= projectionMonths; i++) {
    const projectionDate = new Date(currentDate);
    projectionDate.setMonth(projectionDate.getMonth() + i);
    
    // Aplicar una variación aleatoria pequeña para hacer más realista
    const variationFactor = 0.1; // 10% de variación
    const ingresosProjected = avgIngresos * (1 + (Math.random() - 0.5) * variationFactor);
    const gastosProjected = avgGastos * (1 + (Math.random() - 0.5) * variationFactor);
    
    projections.push({
      month: projectionDate.getMonth() + 1,
      year: projectionDate.getFullYear(),
      projected_ingresos: Math.round(ingresosProjected * 100) / 100,
      projected_gastos: Math.round(gastosProjected * 100) / 100,
      projected_balance: Math.round((ingresosProjected - gastosProjected) * 100) / 100
    });
  }

  res.json({
    success: true,
    data: {
      historical_averages: {
        avg_ingresos: Math.round(avgIngresos * 100) / 100,
        avg_gastos: Math.round(avgGastos * 100) / 100,
        avg_balance: Math.round((avgIngresos - avgGastos) * 100) / 100
      },
      projections,
      recommendations: {
        ahorro_sugerido: Math.round(avgIngresos * 0.2 * 100) / 100,
        limite_gastos: Math.round(avgIngresos * 0.8 * 100) / 100
      }
    }
  });
});

// Obtener resumen del dashboard
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  // Obtener balance total de cuentas
  const accounts = await Account.findAll({
    where: { user_id: req.user.id }
  });

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance.toString());
  }, 0);

  // Transacciones del mes actual
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

  const monthlyTransactions = await Transaction.findAll({
    where: {
      user_id: req.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    include: [{ model: Category, as: 'category' }]
  });

  const monthlyIngresos = monthlyTransactions
    .filter(t => t.type === TransactionType.INGRESO)
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const monthlyGastos = monthlyTransactions
    .filter(t => t.type === TransactionType.GASTO)
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  // Metas activas
  const activeGoals = await Goal.findAll({
    where: {
      user_id: req.user.id,
      status: 'activa'
    }
  });

  const goalsProgress = activeGoals.map(goal => ({
    id: goal.id,
    name: goal.name,
    progress: goal.getProgress(),
    current_amount: parseFloat(goal.current_amount.toString()),
    target_amount: parseFloat(goal.target_amount.toString()),
    target_date: goal.target_date
  }));

  // Transacciones recientes
  const recentTransactions = await Transaction.findAll({
    where: { user_id: req.user.id },
    include: [
      { model: Category, as: 'category' },
      { model: Account, as: 'account' }
    ],
    order: [['created_at', 'DESC']],
    limit: 5
  });

  res.json({
    success: true,
    data: {
      balance_total: totalBalance,
      monthly_summary: {
        ingresos: monthlyIngresos,
        gastos: monthlyGastos,
        balance: monthlyIngresos - monthlyGastos
      },
      accounts_summary: {
        total_accounts: accounts.length,
        accounts: accounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          balance: parseFloat(account.balance.toString()),
          color: account.color
        }))
      },
      goals_summary: {
        total_active_goals: activeGoals.length,
        goals: goalsProgress
      },
      recent_transactions: recentTransactions
    }
  });
});
