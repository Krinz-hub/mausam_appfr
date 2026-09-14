import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AuthController } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.get('/me', requireAuth, AuthController.getMe);
authRouter.post('/logout', AuthController.logout);
