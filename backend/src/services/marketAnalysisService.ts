import { DataSource } from 'typeorm';
import axios from 'axios';
import { SMA } from 'technicalindicators';
import { Notification, NotificationSignal } from '../models/Notification';
import { AppDataSource } from './datasourceService';

const ASSETS_TO_MONITOR = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT'
];
const SHORT_PERIOD = 9;
const LONG_PERIOD = 21;

interface Kline {
  closeTime: number;
  close: string;
}

async function getKlines(asset: string): Promise<number[]> {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
      params: {
        symbol: asset,
        interval: '1h', // Velas de 1 hora
        limit: 100,      // 100 períodos para garantir dados suficientes
      },
    });
    // Retorna apenas os preços de fechamento
    return response.data.map((k: any[]) => parseFloat(k[4]));
  } catch (error) {
    console.error(`Erro ao buscar klines para ${asset}:`, error);
    return [];
  }
}

async function analyzeAsset(asset: string) {
  const notificationRepo = AppDataSource.getRepository(Notification);
  const closingPrices = await getKlines(asset);

  if (closingPrices.length < LONG_PERIOD) {
    console.log(`Dados insuficientes para analisar ${asset}`);
    return;
  }

  const shortSma = SMA.calculate({ period: SHORT_PERIOD, values: closingPrices });
  const longSma = SMA.calculate({ period: LONG_PERIOD, values: closingPrices });

  const lastShortSma = shortSma[shortSma.length - 1];
  const lastLongSma = longSma[longSma.length - 1];
  const prevShortSma = shortSma[shortSma.length - 2];
  const prevLongSma = longSma[longSma.length - 2];

  let signal: NotificationSignal | null = null;
  let reason = '';

  // Condição de Compra: Média curta cruza para CIMA da longa
  if (prevShortSma <= prevLongSma && lastShortSma > lastLongSma) {
    signal = NotificationSignal.BUY;
    reason = `Média Móvel Simples de ${SHORT_PERIOD} períodos cruzou para cima da de ${LONG_PERIOD} períodos.`;
  } 
  // Condição de Venda: Média curta cruza para BAIXO da longa
  else if (prevShortSma >= prevLongSma && lastShortSma < lastLongSma) {
    signal = NotificationSignal.SELL;
    reason = `Média Móvel Simples de ${SHORT_PERIOD} períodos cruzou para baixo da de ${LONG_PERIOD} períodos.`;
  }

  if (signal) {
    const newNotification = new Notification();
    newNotification.asset = asset;
    newNotification.signal = signal;
    newNotification.priceAtSignal = closingPrices[closingPrices.length - 1];
    newNotification.indicator = `Cruzamento de Médias Móveis (${SHORT_PERIOD}, ${LONG_PERIOD})`;
    newNotification.reason = reason;

    await notificationRepo.save(newNotification);
    console.log(`[+] Nova oportunidade encontrada para ${asset}: ${signal}`);
  }
}

export async function runMarketAnalysis() {
  console.log('--- Iniciando análise de mercado ---');
  for (const asset of ASSETS_TO_MONITOR) {
    await analyzeAsset(asset);
  }
  console.log('--- Análise de mercado finalizada ---');
} 