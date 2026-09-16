import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface DeviceRequest extends Request {
  device?: { deviceId: string };
}

export class ClientController {
  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, hardwareUuid, deviceName } = req.body;
      
      const license = await prisma.licenseKey.findUnique({ 
        where: { keyString: key },
        include: { devices: true }
      });

      if (!license || !license.isActive || new Date() > license.validUntil) {
        throw new AppError('Licença inválida, expirada ou revogada', 403);
      }

      let device = license.devices.find(d => d.hardwareUuid === hardwareUuid);

      if (!device) {
        if (license.devices.length >= license.maxDevices) {
          throw new AppError('Limite de dispositivos atingido', 403);
        }
        device = await prisma.linkedDevice.create({
          data: { licenseId: license.id, hardwareUuid, deviceName }
        });
      }

      const token = jwt.sign({ deviceId: device.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ token, status: 'VALID' });
    } catch (error) {
      next(error);
    }
  }

  async sync(req: DeviceRequest, res: Response, next: NextFunction) {
    try {
      const deviceId = req.device?.deviceId;
      if (!deviceId) throw new AppError('Acesso não autorizado', 401);
      
      const device = await prisma.linkedDevice.findUnique({
        where: { id: deviceId },
        include: { license: true }
      });

      if (!device || !device.license.isActive) {
        throw new AppError('Acesso não autorizado', 401);
      }

      const resources = await prisma.resource.findMany({
        include: { currentVersion: true }
      });

      res.json(resources);
    } catch (error) {
      next(error);
    }
  }

  async listResources(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await prisma.resource.findMany({
        where: { status: 'ONLINE' },
        select: {
          id: true,
          name: true,
          description: true,
          bundleId: true,
          status: true,
          currentVersion: {
            select: {
              id: true,
              version: true,
              createdAt: true
            }
          }
        }
      });
      res.json(resources);
    } catch (error) {
      next(error);
    }
  }

  async downloadResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resource = await prisma.resource.findUnique({
        where: { id },
        include: { currentVersion: true }
      });

      if (!resource) throw new AppError('Recurso não encontrado', 404);
      if (resource.status !== 'ONLINE') throw new AppError('Recurso indisponível para download', 403);
      if (!resource.currentVersion) throw new AppError('Versão atual não definida', 404);

      const filePath = resource.currentVersion.fileUrl;
      const safePath = path.resolve(filePath);

      // Verificação de Path Traversal
      const UPLOADS_DIR = path.join(__dirname, '../../uploads');
      if (!safePath.startsWith(path.resolve(UPLOADS_DIR))) {
        throw new AppError('Acesso negado', 403);
      }

      if (!fs.existsSync(safePath) || !fs.statSync(safePath).isFile()) {
        throw new AppError('Arquivo não encontrado', 404);
      }

      res.download(safePath, `${resource.name}.bin`);
    } catch (error) {
      next(error);
    }
  }
}
