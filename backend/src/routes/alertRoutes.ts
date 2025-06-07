import { Router } from 'express';
import { Alert } from '../models/Alert';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/authMiddleware';
import { AppDataSource } from '../services/datasourceService';

const router = Router();
router.use(authMiddleware);

const getAlertRepo = () => AppDataSource.getRepository(Alert);
const getUserRepo = () => AppDataSource.getRepository(User);

// Criar um novo alerta
router.post('/', async (req, res) => {
  const { asset, description, conditions } = req.body;
  const userId = (req as any).userId;

  try {
    const alertRepository = getAlertRepo();
    const userRepository = getUserRepo();

    const user = await userRepository.findOne({ where: { id: userId }});
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const newAlert = new Alert();
    newAlert.asset = asset;
    newAlert.description = description;
    newAlert.conditions = conditions;
    newAlert.user = user;
    
    await alertRepository.save(newAlert);
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar alerta', error });
  }
});

// Listar alertas do usuário
router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  try {
    const alertRepository = getAlertRepo();
    const alerts = await alertRepository.find({ where: { user: { id: userId } } });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar alertas', error });
  }
});

// Deletar um alerta
router.delete('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const alertId = parseInt(req.params.id);

  try {
    const alertRepository = getAlertRepo();
    const alert = await alertRepository.findOne({ where: { id: alertId, user: { id: userId } } });

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado ou não pertence ao usuário' });
    }

    await alertRepository.remove(alert);
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar alerta', error });
  }
});

export { router as alertRouter }; 