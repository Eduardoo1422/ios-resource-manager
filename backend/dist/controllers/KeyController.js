"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyController = void 0;
const KeyService_1 = require("../services/KeyService");
const keyService = new KeyService_1.KeyService();
class KeyController {
    async create(req, res) {
        const { count, validUntil, maxDevices } = req.body;
        await keyService.generateKeys(count || 1, new Date(validUntil), maxDevices || 1);
        res.status(201).json({ message: 'Chaves geradas' });
    }
    async list(req, res) {
        const keys = await keyService.getAllKeys();
        res.json(keys);
    }
    async toggle(req, res) {
        const { id } = req.params;
        const { isActive } = req.body;
        await keyService.toggleActive(id, isActive);
        res.json({ message: 'Status atualizado' });
    }
    async unlink(req, res) {
        const { deviceId } = req.params;
        await keyService.unlinkDevice(deviceId);
        res.json({ message: 'Dispositivo desvinculado' });
    }
}
exports.KeyController = KeyController;
