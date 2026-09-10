import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UserController } from '../controllers/userController.js';
import { OnboardingController } from '../controllers/onboardingController.js';

export const userRouter = Router();

// /api/me
userRouter.get('/', requireAuth, UserController.getMe);
userRouter.patch('/profile', requireAuth, UserController.updateProfile);
userRouter.patch('/preferences', requireAuth, UserController.updatePreferences);
userRouter.delete('/', requireAuth, UserController.deleteAccount);

// Onboarding & Personalization nested under /me
userRouter.post('/onboarding', requireAuth, OnboardingController.submitOnboarding);
userRouter.get('/personalization', requireAuth, OnboardingController.getPersonalization);
