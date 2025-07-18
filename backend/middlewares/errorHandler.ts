import { Request, Response, NextFunction } from 'express';

// Interfaz para errores personalizados
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Middleware de manejo de errores global
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error capturado:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.details || error.message
    });
    return;
  }

  // Error de clave única de Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      message: 'El recurso ya existe',
      error: 'Conflicto de datos únicos'
    });
    return;
  }

  // Error de clave foránea de Sequelize
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      success: false,
      message: 'Error de referencia de datos',
      error: 'Referencia inválida'
    });
    return;
  }

  // Error de conexión a la base de datos
  if (error.name === 'SequelizeConnectionError') {
    res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      error: 'Servicio temporalmente no disponible'
    });
    return;
  }

  // Errores personalizados con código de estado
  if (error.statusCode) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details && { details: error.details })
    });
    return;
  }

  // Error por defecto - Error interno del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} no encontrada`
  });
};

// Función para crear errores personalizados
export const createError = (
  message: string,
  statusCode: number = 500,
  details?: any
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

// Wrapper para funciones async que maneja errores automáticamente
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
