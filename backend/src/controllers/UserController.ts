import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import crypto from 'crypto';

export class UserController {
  static async createDefaultAdmin() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'bruno12kuyava@gmail.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Livi@357';

      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = new User();
        admin.name = 'Admin';
        admin.email = adminEmail;
        admin.password = hashedPassword;
        admin.role = 'admin';
        admin.isActive = true;
        admin.permissions = ['all'];
        await admin.save();
        console.log('Usuário administrador padrão criado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao criar usuário administrador padrão:', error);
    }
  }

  async register(req: Request, res: Response) {
    try {
      console.log('Recebido para registro:', req.body); // DEBUG
      const { name, email, password } = req.body;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      // Criar novo usuário
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = hashedPassword;
      user.role = 'user';
      user.isActive = true;
      user.permissions = [];
      await user.save();

      res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, deviceFingerprint } = req.body;

      if (!deviceFingerprint) {
        return res.status(400).json({ message: 'Identificação do dispositivo ausente.' });
      }

      // Verificar se usuário existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Lógica do Device Fingerprint
      if (user.deviceFingerprint) {
        // Se já existe um fingerprint, ele deve ser o mesmo
        if (user.deviceFingerprint !== deviceFingerprint) {
          return res.status(403).json({ message: 'Acesso permitido apenas a partir do dispositivo original.' });
        }
      } else {
        // Se for o primeiro login, salva o fingerprint
        user.deviceFingerprint = deviceFingerprint;
        await user.save();
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'vision_secret_key_123_do_not_use_in_production',
        { expiresIn: '1d' }
      );

      // Retornar informações do usuário (exceto senha e fingerprint)
      const { password: _, deviceFingerprint: __, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const user = await User.findOne({ where: { id: userId } });
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, email } = req.body;

      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  }

  // Funções administrativas
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await User.findOne({ where: { id: Number(userId) } });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      user.role = role;
      await user.save();

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar papel do usuário' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ where: { id: Number(userId) } });
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ message: 'Não é possível deletar um administrador' });
      }

      await user.remove();
      res.json({ message: 'Usuário removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
  }

  // Ativar ou desativar usuário
  async setUserActiveStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      const user = await User.findOne({ where: { id: Number(userId) } });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      user.isActive = isActive;
      await user.save();
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar status do usuário' });
    }
  }

  // Alterar permissões extras do usuário
  async updateUserPermissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;
      const user = await User.findOne({ where: { id: Number(userId) } });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      user.permissions = permissions;
      await user.save();
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar permissões do usuário' });
    }
  }
} 