import { Router } from 'express';
import { KeyController } from '../controllers/KeyController';
import { requireAdmin } from '../middlewares/authMiddleware';

const keyRoutes = Router();
const keyController = new KeyController();

keyRoutes.use(requireAdmin);
keyRoutes.post('/', keyController.create);
keyRoutes.get('/', keyController.list);
keyRoutes.patch('/:id', keyController.toggle);
keyRoutes.delete('/device/:deviceId', keyController.unlink);

export { keyRoutes };
