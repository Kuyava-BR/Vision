import axios from 'axios';
import * as crypto from 'crypto';

interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  trades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export class MarketDataService {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.baseUrl = process.env.DATA_API_URL || 'https://api.binance.com/api/v3';
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';
  }

  private getTimeframeInterval(timeframe: string): string {
    const intervals: { [key: string]: string } = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m'
    };
    return intervals[timeframe] || '1m';
  }

  private getSymbol(asset: string): string {
    // Converte ativos para o formato da Binance
    if (asset.includes('/')) {
      return asset.replace('/', '');
    }
    return asset + 'USDT'; // Adiciona USDT para criptomoedas
  }

  private async signRequest(queryString: string): Promise<string> {
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
    return signature;
  }

  public async getKlines(asset: string, timeframe: string, limit: number = 100): Promise<{
    prices: number[];
    volumes: number[];
    timestamps: number[];
  }> {
    try {
      const symbol = this.getSymbol(asset);
      const interval = this.getTimeframeInterval(timeframe);
      const timestamp = Date.now();
      const queryString = `symbol=${symbol}&interval=${interval}&limit=${limit}&timestamp=${timestamp}`;
      const signature = await this.signRequest(queryString);

      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol,
          interval,
          limit,
          timestamp,
          signature
        },
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      const klines = response.data as any[][];
      
      return {
        prices: klines.map(k => parseFloat(k[4])), // Preço de fechamento
        volumes: klines.map(k => parseFloat(k[5])), // Volume
        timestamps: klines.map(k => k[0]) // Timestamp de abertura
      };
    } catch (error) {
      console.error('Erro ao buscar dados de mercado:', error);
      throw new Error('Falha ao obter dados de mercado da Binance');
    }
  }

  public async getPrice(asset: string): Promise<number> {
    try {
      const symbol = this.getSymbol(asset);
      const response = await axios.get(`${this.baseUrl}/ticker/price`, {
        params: { symbol }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
      throw new Error('Falha ao obter preço atual');
    }
  }
} 