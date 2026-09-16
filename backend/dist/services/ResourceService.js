"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("../utils/crypto");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("../utils/errors");
const crypto_2 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(UPLOADS_DIR))
    fs_1.default.mkdirSync(UPLOADS_DIR);
class ResourceService {
    async updateStatus(resourceId, status, actor) {
        const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource)
            throw new errors_1.AppError('Recurso não encontrado', 404);
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
    async createResource(data) {
        return prisma.resource.create({ data });
    }
    async uploadVersion(resourceId, version, filePath) {
        const sha256 = await (0, crypto_1.calculateSHA256)(filePath);
        const versionId = crypto_2.default.randomUUID();
        const newPath = path_1.default.join(UPLOADS_DIR, `${versionId}.bin`);
        fs_1.default.copyFileSync(filePath, newPath);
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
    async rollback(resourceId, versionId) {
        await prisma.resource.update({
            where: { id: resourceId },
            data: { currentVersionId: versionId }
        });
    }
}
exports.ResourceService = ResourceService;
