import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AuthController } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/sync', requireAuth, AuthController.syncAuth);
authRouter.post('/logout', requireAuth, AuthController.logout);
