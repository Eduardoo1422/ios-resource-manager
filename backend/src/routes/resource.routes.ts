import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';
import { requireAdmin } from '../middlewares/authMiddleware';
import multer from 'multer';

const upload = multer({ 
    dest: 'temp/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const resourceRoutes = Router();
const resourceController = new ResourceController();

resourceRoutes.use(requireAdmin);
resourceRoutes.post('/', resourceController.create);
resourceRoutes.post('/:id/upload', upload.single('file'), resourceController.uploadVersion);
resourceRoutes.patch('/:id/status', resourceController.updateStatus);
resourceRoutes.get('/', resourceController.list);
resourceRoutes.patch('/:id/rollback/:versionId', resourceController.rollback);

export { resourceRoutes };
