import { Request, Response } from 'express';
import { Chart } from '../models/Chart';

export class ChartController {
  async createChart(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { title, data, description, type, isFavorite } = req.body;

      const chart = new Chart();
      chart.title = title;
      chart.data = data;
      chart.description = description;
      chart.type = type || 'line';
      chart.isFavorite = isFavorite || false;
      chart.userId = userId;

      await chart.save();

      res.status(201).json(chart);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar gráfico' });
    }
  }

  async getCharts(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const charts = await Chart.find({
        where: { userId },
        order: {
          isFavorite: 'DESC',
          createdAt: 'DESC'
        }
      });
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar gráficos' });
    }
  }

  async getChartById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const chart = await Chart.findOne({ where: { id: Number(id), userId } });
      
      if (!chart) {
        return res.status(404).json({ message: 'Gráfico não encontrado' });
      }

      res.json(chart);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar gráfico' });
    }
  }

  async updateChart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { title, data, description, type, isFavorite } = req.body;

      const chart = await Chart.findOne({ where: { id: Number(id), userId } });
      
      if (!chart) {
        return res.status(404).json({ message: 'Gráfico não encontrado' });
      }

      chart.title = title || chart.title;
      chart.data = data || chart.data;
      chart.description = description || chart.description;
      chart.type = type || chart.type;
      if (typeof isFavorite === 'boolean') {
        chart.isFavorite = isFavorite;
      }

      await chart.save();

      res.json(chart);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar gráfico' });
    }
  }

  async deleteChart(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const chart = await Chart.findOne({ where: { id: Number(id), userId } });
      
      if (!chart) {
        return res.status(404).json({ message: 'Gráfico não encontrado' });
      }

      await chart.remove();

      res.json({ message: 'Gráfico removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover gráfico' });
    }
  }
} 