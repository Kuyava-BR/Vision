import { Router } from 'express';
import { ChartController } from '../controllers/ChartController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const chartController = new ChartController();

router.use(authMiddleware);

router.post('/', chartController.createChart);
router.get('/', chartController.getCharts);
router.get('/:id', chartController.getChartById);
router.put('/:id', chartController.updateChart);
router.delete('/:id', chartController.deleteChart);

export { router as chartRouter }; 