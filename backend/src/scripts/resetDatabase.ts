import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

async function resetDatabase() {
  try {
    // Inicializar conexão
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida');

    // Dropar todas as tabelas existentes
    await AppDataSource.dropDatabase();
    console.log('Banco de dados limpo');

    // Fechar conexão
    await AppDataSource.destroy();
    console.log('Conexão com o banco de dados fechada');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    process.exit(1);
  }
}

resetDatabase(); 