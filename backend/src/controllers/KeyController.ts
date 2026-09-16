import { Request, Response } from 'express';
import { KeyService } from '../services/KeyService';

const keyService = new KeyService();

export class KeyController {
  async create(req: Request, res: Response) {
    const { count, validUntil, maxDevices } = req.body;
    await keyService.generateKeys(count || 1, new Date(validUntil), maxDevices || 1);
    res.status(201).json({ message: 'Chaves geradas' });
  }

  async list(req: Request, res: Response) {
    const keys = await keyService.getAllKeys();
    res.json(keys);
  }

  async toggle(req: Request, res: Response) {
    const { id } = req.params;
    const { isActive } = req.body;
    await keyService.toggleActive(id, isActive);
    res.json({ message: 'Status atualizado' });
  }

  async unlink(req: Request, res: Response) {
    const { deviceId } = req.params;
    await keyService.unlinkDevice(deviceId);
    res.json({ message: 'Dispositivo desvinculado' });
  }
}
