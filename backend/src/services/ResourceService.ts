import { PrismaClient } from '@prisma/client';
import { calculateSHA256 } from '../utils/crypto';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/errors';
import crypto from 'crypto';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

export class ResourceService {
  async updateStatus(resourceId: string, status: string, actor: string) {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new AppError('Recurso não encontrado', 404);

    const oldStatus = resource.status;
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        actor,
        action: 'UPDATE_STATUS',
        details: JSON.stringify({ resourceId, oldStatus, newStatus: status })
      }
    });

    return updatedResource;
  }

  async createResource(data: any) {
    return prisma.resource.create({ data });
  }

  async uploadVersion(resourceId: string, version: string, filePath: string) {
    const sha256 = await calculateSHA256(filePath);
    const versionId = crypto.randomUUID();
    const newPath = path.join(UPLOADS_DIR, `${versionId}.bin`);
    
    fs.copyFileSync(filePath, newPath);

    const resourceVersion = await prisma.resourceVersion.create({
      data: {
        id: versionId,
        resourceId,
        version,
        fileUrl: newPath,
        sha256
      }
    });

    await prisma.resource.update({
      where: { id: resourceId },
      data: { currentVersionId: resourceVersion.id }
    });

    return resourceVersion;
  }

  async listResources() {
    return prisma.resource.findMany({ include: { versions: true } });
  }

  async rollback(resourceId: string, versionId: string) {
    await prisma.resource.update({
      where: { id: resourceId },
      data: { currentVersionId: versionId }
    });
  }
}
