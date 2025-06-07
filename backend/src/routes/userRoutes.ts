import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();
const userController = new UserController();

// Todas as rotas de usuário abaixo requerem autenticação
router.use(authMiddleware);

// Rotas de perfil do usuário logado
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Rotas administrativas (requerem permissão de admin)
router.use(adminMiddleware);
router.get('/', userController.getAllUsers);
router.post('/', userController.register);
router.put('/:userId/role', userController.updateUserRole);
router.delete('/:userId', userController.deleteUser);
router.put('/:userId/active', userController.setUserActiveStatus);
router.put('/:userId/permissions', userController.updateUserPermissions);

export { router as userRouter }; 