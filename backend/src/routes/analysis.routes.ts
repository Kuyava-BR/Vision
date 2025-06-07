import { Router } from 'express';
import { AnalysisController } from '../controllers/AnalysisController';
import { ChartAnalysisController } from '../controllers/ChartAnalysisController';

const analysisRouter = Router();
const analysisController = new AnalysisController();
const chartAnalysisController = new ChartAnalysisController();

analysisRouter.post('/analysis', analysisController.analyze);
analysisRouter.post('/analyze-chart', chartAnalysisController.analyzeChart);

export default analysisRouter; 