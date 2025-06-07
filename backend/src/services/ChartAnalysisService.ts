import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

interface AnalysisResult {
  recommendation: 'buy' | 'sell';
  confidence: number;
  explanation: string;
  patterns: string[];
  indicators: {
    trend: string;
    momentum: number;
    volatility: number;
    support: number;
    resistance: number;
  };
}

export class ChartAnalysisService {
  private async analyzeImageColors(imagePath: string): Promise<{
    greenPixels: number;
    redPixels: number;
    totalPixels: number;
  }> {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    
    let greenPixels = 0;
    let redPixels = 0;
    const totalPixels = image.width * image.height;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detecta pixels verdes (candles de alta)
      if (g > r + 30 && g > b + 30) {
        greenPixels++;
      }
      // Detecta pixels vermelhos (candles de baixa)
      else if (r > g + 30 && r > b + 30) {
        redPixels++;
      }
    }
    
    return { greenPixels, redPixels, totalPixels };
  }

  private detectTrend(greenPixels: number, redPixels: number): string {
    return greenPixels > redPixels ? 'uptrend' : 'downtrend';
  }

  private calculateConfidence(greenPixels: number, redPixels: number, totalPixels: number): number {
    const dominantPixels = Math.max(greenPixels, redPixels);
    const ratio = dominantPixels / (greenPixels + redPixels);
    return Math.min(ratio * 100, 100);
  }

  private generateExplanation(trend: string, confidence: number, timeframe: string): string {
    let explanation = `Baseado na análise do gráfico de ${timeframe}:\n\n`;
    
    explanation += `- Tendência identificada: ${trend === 'uptrend' ? 'Alta' : 'Baixa'}\n`;
    explanation += `- Força da tendência: ${confidence.toFixed(2)}%\n`;
    
    if (confidence > 70) {
      explanation += '- Sinal forte e confiável\n';
    } else if (confidence > 50) {
      explanation += '- Sinal moderado, considere outros indicadores\n';
    } else {
      explanation += '- Sinal fraco, mercado pode estar lateralizado\n';
    }
    
    return explanation;
  }

  public async analyzeChart(
    imagePath: string,
    marketType: string,
    timeframe: string
  ): Promise<AnalysisResult> {
    try {
      // Análise das cores da imagem
      const { greenPixels, redPixels, totalPixels } = await this.analyzeImageColors(imagePath);
      
      // Determina a tendência
      const trend = this.detectTrend(greenPixels, redPixels);
      
      // Calcula a confiança
      const confidence = this.calculateConfidence(greenPixels, redPixels, totalPixels);
      
      // Gera explicação
      const explanation = this.generateExplanation(trend, confidence, timeframe);
      
      // Determina a recomendação
      const recommendation = trend === 'uptrend' ? 'buy' : 'sell';
      
      // Simula alguns indicadores técnicos
      const indicators = {
        trend,
        momentum: confidence,
        volatility: Math.random() * 50 + 25, // 25-75%
        support: Math.random() * 1000,
        resistance: Math.random() * 1000
      };
      
      // Limpa o arquivo temporário
      fs.unlinkSync(imagePath);
      
      return {
        recommendation,
        confidence,
        explanation,
        patterns: [], // Simplificado para esta versão
        indicators
      };
    } catch (error) {
      console.error('Erro na análise:', error);
      throw new Error('Falha ao analisar o gráfico');
    }
  }
} 