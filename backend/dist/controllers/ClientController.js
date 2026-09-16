"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
class ClientController {
    async activate(req, res, next) {
        try {
            const { key, hardwareUuid, deviceName } = req.body;
            const license = await prisma.licenseKey.findUnique({
                where: { keyString: key },
                include: { devices: true }
            });
            if (!license || !license.isActive || new Date() > license.validUntil) {
                throw new errors_1.AppError('Licença inválida, expirada ou revogada', 403);
            }
            let device = license.devices.find(d => d.hardwareUuid === hardwareUuid);
            if (!device) {
                if (license.devices.length >= license.maxDevices) {
                    throw new errors_1.AppError('Limite de dispositivos atingido', 403);
                }
                device = await prisma.linkedDevice.create({
                    data: { licenseId: license.id, hardwareUuid, deviceName }
                });
            }
            const token = jsonwebtoken_1.default.sign({ deviceId: device.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
            res.json({ token, status: 'VALID' });
        }
        catch (error) {
            next(error);
        }
    }
    async sync(req, res, next) {
        try {
            const deviceId = req.device?.deviceId;
            if (!deviceId)
                throw new errors_1.AppError('Acesso não autorizado', 401);
            const device = await prisma.linkedDevice.findUnique({
                where: { id: deviceId },
                include: { license: true }
            });
            if (!device || !device.license.isActive) {
                throw new errors_1.AppError('Acesso não autorizado', 401);
            }
            const resources = await prisma.resource.findMany({
                include: { currentVersion: true }
            });
            res.json(resources);
        }
        catch (error) {
            next(error);
        }
    }
    async listResources(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
    async downloadResource(req, res, next) {
        try {
            const { id } = req.params;
            const resource = await prisma.resource.findUnique({
                where: { id },
                include: { currentVersion: true }
            });
            if (!resource)
                throw new errors_1.AppError('Recurso não encontrado', 404);
            if (resource.status !== 'ONLINE')
                throw new errors_1.AppError('Recurso indisponível para download', 403);
            if (!resource.currentVersion)
                throw new errors_1.AppError('Versão atual não definida', 404);
            const filePath = resource.currentVersion.fileUrl;
            const safePath = path_1.default.resolve(filePath);
            // Verificação de Path Traversal
            const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
            if (!safePath.startsWith(path_1.default.resolve(UPLOADS_DIR))) {
                throw new errors_1.AppError('Acesso negado', 403);
            }
            if (!fs_1.default.existsSync(safePath) || !fs_1.default.statSync(safePath).isFile()) {
                throw new errors_1.AppError('Arquivo não encontrado', 404);
            }
            res.download(safePath, `${resource.name}.bin`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ClientController = ClientController;
