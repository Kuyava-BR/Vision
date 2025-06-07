import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  role: 'user' | 'admin';
}

// Estendendo a interface Request do Express para incluir o userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: 'user' | 'admin';
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'vision_secret_key_123_do_not_use_in_production'
    ) as JwtPayload;
    
    // Anexar informações do usuário à requisição para uso posterior
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    return res.status(500).json({ message: 'Erro interno ao validar o token.' });
  }
}; 