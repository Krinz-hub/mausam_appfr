import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt.js';
import { User, IUserModel } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUserModel;
  userId?: string;
  token?: string;
}

/**
 * Authentication middleware that validates JWT from HTTP-only cookie
 * or Authorization Bearer header, attaches user to request, or returns 401.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Check Authorization Bearer header (mobile client / API callers)
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1]?.trim();
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
    });
    return;
  }

  try {
    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.',
      });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account not found. Please register or sign in.',
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.token = token;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid authentication token.',
    });
  }
}
