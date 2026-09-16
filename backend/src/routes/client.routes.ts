import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';

import { requireClient } from '../middlewares/authMiddleware';

const clientRoutes = Router();
const clientController = new ClientController();

clientRoutes.post('/activate', clientController.activate);
clientRoutes.get('/sync', requireClient, clientController.sync);
clientRoutes.get('/resources', requireClient, clientController.listResources);
clientRoutes.get('/resources/:id/download', requireClient, clientController.downloadResource);

export { clientRoutes };
