import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.');
}

const JWT_SECRET = process.env.JWT_SECRET;

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Token mal formatado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
    }

    // Verificar se o usuário ainda existe e está ativo
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'Usuário não encontrado ou desativado' });
    }

    (req as any).userId = decoded.id;
    (req as any).userRole = decoded.role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 