import { Request, Response, NextFunction } from 'express';
import { verifyToken, VerifiedToken } from '../config/firebase.js';

export interface AuthenticatedRequest extends Request {
  user?: VerifiedToken;
  token?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header with Bearer token is required',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token cannot be empty',
    });
    return;
  }

  try {
    const verified = await verifyToken(token);
    req.user = verified;
    req.token = token;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized',
      message: err.message || 'Token verification failed',
    });
  }
}
