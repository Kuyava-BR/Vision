import { Router } from 'express';
import userRouter from './user.routes';
import analysisRouter from './analysis.routes';

const routes = Router();

routes.use('/api', userRouter);
routes.use('/api', analysisRouter);

export default routes; 