import { Router } from 'express';
import { BrokerageConnection, BrokerageName } from '../models/BrokerageConnection';
import { User } from '../models/User';
import { EncryptionService } from '../services/encryptionService';
import { authMiddleware } from '../middleware/authMiddleware';
import axios from 'axios';
import { AppDataSource } from '../services/datasourceService';

const router = Router();
router.use(authMiddleware);

const getBrokerageRepo = () => AppDataSource.getRepository(BrokerageConnection);
const getUserRepo = () => AppDataSource.getRepository(User);

// Adicionar uma nova conexão de corretora
router.post('/', async (req, res) => {
  const { brokerage, apiKey, apiSecret } = req.body;
  const userId = (req as any).userId;

  if (brokerage !== BrokerageName.BINANCE) {
    return res.status(400).json({ message: 'Apenas a corretora Binance é suportada no momento.' });
  }

  try {
    // 1. Testar a validade das chaves com a Binance
    // A melhor forma é fazer uma chamada simples, como "get account info"
    await axios.get('https://api.binance.com/api/v3/account', {
      headers: { 'X-MBX-APIKEY': apiKey } // Apenas a chave de API é necessária para alguns endpoints
    });
  } catch (error: any) {
    // Se a chave for inválida, a Binance retorna 401
    if (error.response && error.response.status === 401) {
       return res.status(400).json({ message: 'Chave de API inválida.' });
    }
    // Outros erros de conexão, etc.
    return res.status(500).json({ message: 'Não foi possível validar a chave de API com a Binance.' });
  }

  try {
    const connRepo = getBrokerageRepo();
    const userRepo = getUserRepo();

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    
    // Verificar se já existe uma conexão para essa corretora
    const existingConnection = await connRepo.findOne({ where: { user: { id: userId }, brokerage }});
    if (existingConnection) {
        return res.status(400).json({ message: `Você já tem uma conexão com ${brokerage}.`});
    }

    const newConnection = new BrokerageConnection();
    newConnection.user = user;
    newConnection.brokerage = brokerage;
    newConnection.apiKey = EncryptionService.encrypt(apiKey);
    newConnection.apiSecret = EncryptionService.encrypt(apiSecret);

    await connRepo.save(newConnection);
    
    // Não retornar as chaves, mesmo criptografadas
    res.status(201).json({ message: 'Conexão com a corretora adicionada com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar a conexão com a corretora.', error });
  }
});

// Listar conexões do usuário
router.get('/', async (req, res) => {
    const userId = (req as any).userId;
    try {
        const connRepo = getBrokerageRepo();
        const connections = await connRepo.find({ 
            where: { user: { id: userId } },
            select: ['id', 'brokerage', 'createdAt'] // Nunca retornar apiKey ou apiSecret
        });
        res.json(connections);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar conexões.', error });
    }
});

// Remover uma conexão
router.delete('/:id', async (req, res) => {
    const userId = (req as any).userId;
    const connectionId = parseInt(req.params.id);
  
    try {
      const connRepo = getBrokerageRepo();
      const connection = await connRepo.findOne({ where: { id: connectionId, user: { id: userId } } });
  
      if (!connection) {
        return res.status(404).json({ message: 'Conexão não encontrada ou não pertence ao usuário' });
      }
  
      await connRepo.remove(connection);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar conexão.', error });
    }
  });

export { router as brokerageRouter }; 