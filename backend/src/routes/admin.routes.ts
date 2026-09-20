import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../middlewares/authMiddleware';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();
const adminRoutes = Router();

adminRoutes.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new AppError('Credenciais inválidas', 401);
    }
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, mustChangePassword: admin.mustChangePassword },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ token, admin: { id: admin.id, email: admin.email, mustChangePassword: admin.mustChangePassword } });
  } catch (e) { next(e); }
});

adminRoutes.post('/change-password', requireAdmin, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) throw new AppError('A senha deve ter pelo menos 8 caracteres', 400);
    // @ts-ignore
    const adminId = req.admin.adminId;
    const hash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.update({
      where: { id: adminId },
      data: { password: hash, mustChangePassword: false }
    });
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, mustChangePassword: false },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ token, admin: { id: admin.id, email: admin.email, mustChangePassword: false } });
  } catch (e) { next(e); }
});

adminRoutes.get('/me', requireAdmin, async (req, res) => {
  // @ts-ignore
  res.json(req.admin);
});

export { adminRoutes };
