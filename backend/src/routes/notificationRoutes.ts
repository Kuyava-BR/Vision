import { Router } from 'express';
import { AppDataSource } from '../services/datasourceService';
import { Notification } from '../models/Notification';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// Listar todas as notificações
router.get('/', async (req, res) => {
  try {
    const notificationRepo = AppDataSource.getRepository(Notification);
    const notifications = await notificationRepo.find({
      order: {
        createdAt: 'DESC', // Mostrar as mais recentes primeiro
      },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar notificações.', error });
  }
});

export { router as notificationRouter }; 