"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceController = void 0;
const ResourceService_1 = require("../services/ResourceService");
const errors_1 = require("../utils/errors");
const resourceService = new ResourceService_1.ResourceService();
class ResourceController {
    async updateStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        // @ts-ignore
        const actor = req.admin.email;
        const resource = await resourceService.updateStatus(id, status, actor);
        res.json(resource);
    }
    async create(req, res) {
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
    async uploadVersion(req, res) {
        if (!req.file)
            throw new errors_1.AppError('Arquivo não enviado');
        const { id } = req.params;
        const { version } = req.body;
        // Validações de segurança: tamanho, extensão, etc. já feitas no middleware multer
        const resourceVersion = await resourceService.uploadVersion(id, version, req.file.path);
        res.status(201).json(resourceVersion);
    }
    async list(req, res) {
        const resources = await resourceService.listResources();
        res.json(resources);
    }
    async rollback(req, res) {
        const { id, versionId } = req.params;
        await resourceService.rollback(id, versionId);
        res.json({ message: 'Rollback realizado' });
    }
}
exports.ResourceController = ResourceController;
