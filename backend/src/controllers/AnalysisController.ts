import { Request, Response } from 'express';
import { AnalysisService } from '../services/AnalysisService';

export class AnalysisController {
  private analysisService: AnalysisService;

  constructor() {
    this.analysisService = new AnalysisService();
  }

  public analyze = async (req: Request, res: Response): Promise<void> => {
    try {
      const { asset, timeframe } = req.body;

      if (!asset || !timeframe) {
        res.status(400).json({ error: 'Asset e timeframe são obrigatórios' });
        return;
      }

      const analysis = await this.analysisService.analyze(asset, timeframe);
      res.json(analysis);
    } catch (error) {
      console.error('Erro ao realizar análise:', error);
      res.status(500).json({ error: 'Erro interno ao processar análise' });
    }
  };
} 