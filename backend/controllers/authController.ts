import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';

// Interfaz para el registro de usuario
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Interfaz para el login
interface LoginRequest {
  email: string;
  password: string;
}

// Generar token JWT
const generateToken = (user: { id: number; email: string; name: string }): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT_SECRET no configurado', 500);
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// Registro de usuario
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password }: RegisterRequest = req.body;

  // Validaciones básicas
  if (!name || !email || !password) {
    throw createError('Todos los campos son requeridos', 400);
  }

  if (password.length < 6) {
    throw createError('La contraseña debe tener al menos 6 caracteres', 400);
  }

  // Verificar si el email ya existe
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw createError('El email ya está registrado', 409);
  }

  // Hashear la contraseña
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Crear el usuario
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword
  });

  // Generar token
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    }
  });
});

// Login de usuario
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Validaciones básicas
  if (!email || !password) {
    throw createError('Email y contraseña son requeridos', 400);
  }

  // Buscar usuario por email
  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    throw createError('Credenciales inválidas', 401);
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Credenciales inválidas', 401);
  }

  // Generar token
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    }
  });
});

// Obtener perfil del usuario autenticado
export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('Usuario no autenticado', 401);
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    }
  });
});
