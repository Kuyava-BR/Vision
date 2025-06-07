import { DataSource } from 'typeorm';
import { Alert, AlertStatus } from '../models/Alert';
import { User } from '../models/User';

// Simula a busca de preço de um ativo. Em um cenário real, isso viria de uma API como a da Binance.
async function getMockPrice(asset: string): Promise<number> {
  // Para fins de teste, vamos gerar um preço aleatório para BTC.
  if (asset === 'BTCUSDT') {
    return 60000 + (Math.random() - 0.5) * 5000;
  }
  return 0;
}

async function checkAlerts(dataSource: DataSource) {
  const alertRepository = dataSource.getRepository(Alert);

  try {
    const activeAlerts = await alertRepository.find({
      where: { status: AlertStatus.ACTIVE },
      relations: ['user'],
    });

    for (const alert of activeAlerts) {
      try {
        const conditions = alert.conditions as any;
        
        // Focar apenas em alertas de preço por enquanto
        if (conditions.indicator !== 'Preço') {
          continue;
        }

        const currentPrice = await getMockPrice(alert.asset);
        if (currentPrice === 0) continue;

        const value = Number(conditions.value);
        let conditionMet = false;

        if (conditions.operator === '>' && currentPrice > value) {
          conditionMet = true;
        } else if (conditions.operator === '<' && currentPrice < value) {
          conditionMet = true;
        }

        if (conditionMet) {
          alert.status = AlertStatus.TRIGGERED;
          alert.lastTriggeredAt = new Date();
          await alertRepository.save(alert);
          console.log(`ALERTA DISPARADO: ${alert.description} para o usuário ${alert.user.email}`);
        }
      } catch (priceError) {
        console.error(`Erro ao processar alerta #${alert.id} para ${alert.asset}:`, priceError);
      }
    }
  } catch (error) {
    console.error('Erro geral ao verificar alertas:', error);
  }
}

let intervalId: NodeJS.Timeout | null = null;

export function startAlertingService(dataSource: DataSource, interval: number) {
  if (intervalId) {
    return;
  }
  console.log(`Serviço de Alertas iniciado. Verificando a cada ${interval / 1000} segundos.`);
  intervalId = setInterval(() => checkAlerts(dataSource), interval);
}

export function stopAlertingService() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Serviço de Alertas parado.');
  }
} 