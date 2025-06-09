import { Router } from 'express';
import { userRouter } from './userRoutes';
import analysisRouter from './analysis.routes';

const routes = Router();

routes.use('/users', userRouter);
routes.use('/analysis', analysisRouter);

export default routes; 