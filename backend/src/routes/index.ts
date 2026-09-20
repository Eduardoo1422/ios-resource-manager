import { Router } from 'express';
import { keyRoutes } from './key.routes';
import { clientRoutes } from './client.routes';
import { resourceRoutes } from './resource.routes';
import { adminRoutes } from './admin.routes';

const routes = Router();

routes.use('/api/admin', adminRoutes);
routes.use('/api/admin/keys', keyRoutes);
routes.use('/api/admin/resources', resourceRoutes);
routes.use('/api/client', clientRoutes);

export { routes };
