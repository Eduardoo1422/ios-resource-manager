import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError('Token não fornecido', 401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    // @ts-ignore
    req.admin = decoded;
    
    if (decoded.mustChangePassword && req.path !== '/api/admin/change-password') {
      throw new AppError('Senha precisa ser alterada', 403);
    }
    
    next();
  } catch (err) {
    throw new AppError('Token inválido', 401);
  }
};

export const requireClient = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError('Token não fornecido', 401);
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      // @ts-ignore
      req.device = decoded;
      next();
    } catch (err) {
      throw new AppError('Token inválido', 401);
    }
  };
