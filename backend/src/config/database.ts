import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../models/User';
import { Chart } from '../models/Chart';
import { Alert } from '../models/Alert';
import { BrokerageConnection } from '../models/BrokerageConnection';
import { Notification } from '../models/Notification';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  throw new Error('Configurações do banco de dados não encontradas. Verifique as variáveis de ambiente.');
}

const dbConfig: DataSourceOptions = process.env.DATABASE_URL
  ? { // Configuração para produção (usando a URL)
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      database: process.env.DB_NAME || 'vision_db',
    }
  : { // Configuração para desenvolvimento (usando variáveis individuais)
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'vision_db',
    };

export const AppDataSource = new DataSource({
  ...dbConfig,
  synchronize: false,
  logging: !isProduction,
  entities: [User, Chart, Alert, BrokerageConnection, Notification],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [],
}); 