import { Router } from 'express';
import userRoutes from './userRoutes';
import analysisRouter from './analysis.routes';

const routes = Router();

routes.use('/api', userRoutes);
routes.use('/api', analysisRouter);

export default routes; 