import { Request, Response } from 'express';
import { ResourceService } from '../services/ResourceService';
import { AppError } from '../utils/errors';

const resourceService = new ResourceService();

export class ResourceController {
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    // @ts-ignore
    const actor = req.admin.email;
    const resource = await resourceService.updateStatus(id, status, actor);
    res.json(resource);
  }

  async create(req: Request, res: Response) {
    const { name, description, bundleId, targetFilePath, status } = req.body;
    const resource = await resourceService.createResource({
      name,
      description,
      bundleId,
      targetFilePath,
      status
    });
    res.status(201).json(resource);
  }

  async uploadVersion(req: Request, res: Response) {
    if (!req.file) throw new AppError('Arquivo não enviado');
    const { id } = req.params;
    const { version } = req.body;
    
    // Validações de segurança: tamanho, extensão, etc. já feitas no middleware multer
    const resourceVersion = await resourceService.uploadVersion(id, version, req.file.path);
    res.status(201).json(resourceVersion);
  }

  async list(req: Request, res: Response) {
    const resources = await resourceService.listResources();
    res.json(resources);
  }

  async rollback(req: Request, res: Response) {
    const { id, versionId } = req.params;
    await resourceService.rollback(id, versionId);
    res.json({ message: 'Rollback realizado' });
  }
}
