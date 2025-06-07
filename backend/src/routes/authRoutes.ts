import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// Rotas de autenticação
router.post('/login', userController.login);
router.post('/register', userController.register);

export { router as authRouter }; 