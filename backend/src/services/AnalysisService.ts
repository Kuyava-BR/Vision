import { RSI, MACD, BollingerBands, EMA } from 'technicalindicators';
import { MarketDataService } from './MarketDataService';

interface MarketData {
  prices: number[];
  volumes: number[];
  timestamps: number[];
}

interface AnalysisResult {
  trend: string;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  support: number;
  resistance: number;
  momentum: number;
  volume: number;
  volatility: number;
  prediction: string;
  confidence: number;
}

export class AnalysisService {
  private marketDataService: MarketDataService;

  constructor() {
    this.marketDataService = new MarketDataService();
  }

  private async getMarketData(asset: string, timeframe: string): Promise<MarketData> {
    return await this.marketDataService.getKlines(asset, timeframe, 100);
  }

  private calculateRSI(prices: number[]): number {
    const rsiPeriod = 14;
    const rsiValues = RSI.calculate({
      values: prices,
      period: rsiPeriod
    });
    return rsiValues[rsiValues.length - 1];
  }

  private calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
    const macdInput = {
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    };

    const macdValues = MACD.calculate(macdInput);
    const lastMACD = macdValues[macdValues.length - 1];

    return {
      value: lastMACD.MACD,
      signal: lastMACD.signal,
      histogram: lastMACD.histogram
    };
  }

  private calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } {
    const period = 20;
    const stdDev = 2;
    const bbandsInput = {
      period: period,
      values: prices,
      stdDev: stdDev
    };

    const bbands = BollingerBands.calculate(bbandsInput);
    const lastBBand = bbands[bbands.length - 1];

    return {
      upper: lastBBand.upper,
      middle: lastBBand.middle,
      lower: lastBBand.lower
    };
  }

  private calculateSupport(prices: number[]): number {
    const period = 20;
    const recentPrices = prices.slice(-period);
    return Math.min(...recentPrices);
  }

  private calculateResistance(prices: number[]): number {
    const period = 20;
    const recentPrices = prices.slice(-period);
    return Math.max(...recentPrices);
  }

  private calculateMomentum(prices: number[]): number {
    const period = 10;
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 1 - period];
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  private calculateVolatility(prices: number[]): number {
    const period = 20;
    const recentPrices = prices.slice(-period);
    const returns = recentPrices.map((price, i) => {
      if (i === 0) return 0;
      return (price - recentPrices[i - 1]) / recentPrices[i - 1];
    });

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(365); // Anualizado
  }

  private determineTrend(prices: number[], macd: { value: number; signal: number }): string {
    const ema20 = EMA.calculate({ period: 20, values: prices });
    const ema50 = EMA.calculate({ period: 50, values: prices });
    
    const lastPrice = prices[prices.length - 1];
    const lastEma20 = ema20[ema20.length - 1];
    const lastEma50 = ema50[ema50.length - 1];

    if (lastPrice > lastEma20 && lastEma20 > lastEma50 && macd.value > macd.signal) {
      return 'Alta';
    } else if (lastPrice < lastEma20 && lastEma20 < lastEma50 && macd.value < macd.signal) {
      return 'Baixa';
    } else {
      return 'Lateral';
    }
  }

  private generatePrediction(analysis: Partial<AnalysisResult>): { prediction: string; confidence: number } {
    let bullishSignals = 0;
    let totalSignals = 0;

    // RSI
    if (analysis.rsi) {
      totalSignals++;
      if (analysis.rsi < 30) bullishSignals++;
      if (analysis.rsi > 70) bullishSignals += 0;
    }

    // MACD
    if (analysis.macd) {
      totalSignals++;
      if (analysis.macd.value > analysis.macd.signal) bullishSignals++;
    }

    // Tendência
    if (analysis.trend) {
      totalSignals++;
      if (analysis.trend === 'Alta') bullishSignals++;
    }

    // Momentum
    if (analysis.momentum) {
      totalSignals++;
      if (analysis.momentum > 0) bullishSignals++;
    }

    const confidence = (bullishSignals / totalSignals) * 100;
    let prediction = '';

    if (confidence >= 75) {
      prediction = 'Forte tendência de alta. Considere posições compradas com stops ajustados.';
    } else if (confidence >= 50) {
      prediction = 'Tendência levemente altista. Monitore os níveis de suporte para entradas.';
    } else if (confidence >= 25) {
      prediction = 'Tendência levemente baixista. Aguarde confirmação de reversão.';
    } else {
      prediction = 'Forte tendência de baixa. Considere proteção do capital ou posições vendidas.';
    }

    return { prediction, confidence };
  }

  public async analyze(asset: string, timeframe: string): Promise<AnalysisResult> {
    const marketData = await this.getMarketData(asset, timeframe);
    const { prices, volumes } = marketData;

    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const bbands = this.calculateBollingerBands(prices);
    const support = this.calculateSupport(prices);
    const resistance = this.calculateResistance(prices);
    const momentum = this.calculateMomentum(prices);
    const volume = volumes[volumes.length - 1];
    const volatility = this.calculateVolatility(prices);
    const trend = this.determineTrend(prices, macd);

    const partialAnalysis = {
      trend,
      rsi,
      macd,
      support,
      resistance,
      momentum,
      volume,
      volatility
    };

    const { prediction, confidence } = this.generatePrediction(partialAnalysis);

    return {
      ...partialAnalysis,
      prediction,
      confidence
    };
  }
} 