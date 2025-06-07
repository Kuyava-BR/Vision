import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { ChartAnalysisService } from '../services/ChartAnalysisService';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens nos formatos JPG, JPEG e PNG são permitidas'));
  }
}).single('image');

export class ChartAnalysisController {
  private analysisService: ChartAnalysisService;

  constructor() {
    this.analysisService = new ChartAnalysisService();
  }

  public analyzeChart = async (req: Request, res: Response): Promise<void> => {
    upload(req, res, async (err) => {
      if (err) {
        res.status(400).json({
          error: err.message
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: 'Nenhuma imagem foi enviada'
        });
        return;
      }

      try {
        const { marketType, timeframe } = req.body;
        const imagePath = req.file.path;

        const analysis = await this.analysisService.analyzeChart(imagePath, marketType, timeframe);
        
        res.json(analysis);
      } catch (error) {
        console.error('Erro ao analisar gráfico:', error);
        res.status(500).json({
          error: 'Erro ao processar análise do gráfico'
        });
      }
    });
  };
} 