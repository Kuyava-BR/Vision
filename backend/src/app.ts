import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { authRouter } from './routes/authRoutes';
import { userRouter } from './routes/userRoutes';
import { chartRouter } from './routes/chartRoutes';
import { alertRouter } from './routes/alertRoutes';
import { brokerageRouter } from './routes/brokerageRoutes';
import { notificationRouter } from './routes/notificationRoutes';
import { startAlertingService } from './services/alertingService';
import { runMarketAnalysis } from './services/marketAnalysisService';
import { UserController } from './controllers/UserController';
import iaRoutes from './routes/iaRoutes';
import { authMiddleware } from './middleware/authMiddleware';

dotenv.config();

const app = express();

// Configuração do CORS para produção
const allowedOrigins = [
  'http://localhost:3000',
  'https://vision-analytics.vercel.app', // Substitua pelo seu domínio do Vercel
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Rota de verificação de saúde do servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authRouter);

// Aplicar middleware de autenticação a todas as rotas abaixo
app.use(authMiddleware);

app.use('/api/users', userRouter);
app.use('/api/charts', chartRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/brokerages', brokerageRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/ia', iaRoutes);

const PORT = Number(process.env.PORT) || 5000;

// Inicialização Unificada
AppDataSource.initialize()
  .then(async () => {
    console.log('Conexão com o banco de dados estabelecida');

    // Criar usuário administrador padrão, se necessário
    await UserController.createDefaultAdmin();

    // Iniciar o servidor Express
    app.listen(PORT, async () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      
      // Inicia o serviço de verificação de alertas do usuário
      startAlertingService(AppDataSource, 15000); 

      // Executa a análise de mercado ao iniciar e depois a cada 10 minutos
      console.log('Executando análise de mercado inicial...');
      await runMarketAnalysis();
      setInterval(runMarketAnalysis, 10 * 60 * 1000); // 10 minutos
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1); // Encerra a aplicação em caso de falha na inicialização
  });

export default app; 