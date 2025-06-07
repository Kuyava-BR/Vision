import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';
import routes from './routes';
import { UserController } from './controllers/UserController';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Configurar pasta de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Inicializar banco de dados e criar admin
AppDataSource.initialize()
  .then(async () => {
    console.log('Conexão com o banco de dados estabelecida');
    
    // Criar usuário admin padrão
    await UserController.createDefaultAdmin();
    
    // Configurar rotas
    app.use(routes);
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  }); 