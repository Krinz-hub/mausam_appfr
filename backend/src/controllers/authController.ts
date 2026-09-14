import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  /**
   * POST /api/auth/register
   * Creates a new user account, hashes password, sets HTTP-only auth cookie, and returns JWT.
   */
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Validation failed',
          issues: parsed.error.issues,
        });
        return;
      }

      const { name, email, password } = parsed.data;
      const normalizedEmail = email.toLowerCase().trim();

      // Check for existing user
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in.',
        });
        return;
      }

      // Create new user in MongoDB
      const user = await User.create({
        name,
        displayName: name,
        email: normalizedEmail,
        password,
        onboardingCompleted: false,
        profile: {
          userTypes: [],
          interests: [],
          activities: [],
        },
        preferences: {
          temperatureUnit: 'celsius',
          notificationsEnabled: true,
          soundEnabled: true,
          reducedMotion: false,
          rainAlerts: true,
          severeWeatherAlerts: true,
        },
        savedLocations: [],
      });

      const token = generateToken(user._id.toString());
      setAuthCookie(res, token);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: user.toJSON(),
        token,
      });
    } catch (err: any) {
      console.error('Error in AuthController.register:', err);
      res.status(500).json({
        success: false,
        message: 'Unable to create account. Please try again later.',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticates user against MongoDB, sets HTTP-only auth cookie, and returns JWT.
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid email or password',
        });
        return;
      }

      const { email, password } = parsed.data;
      const normalizedEmail = email.toLowerCase().trim();

      // Find user and explicitly include password hash
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const token = generateToken(user._id.toString());
      setAuthCookie(res, token);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        user: user.toJSON(),
        token,
      });
    } catch (err: any) {
      console.error('Error in AuthController.login:', err);
      res.status(500).json({
        success: false,
        message: 'Unable to sign in. Please try again later.',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Returns currently authenticated user session.
   */
  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  }

  /**
   * POST /api/auth/logout
   * Clears HTTP-only auth cookie.
   */
  public static async logout(_req: Request, res: Response): Promise<void> {
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
