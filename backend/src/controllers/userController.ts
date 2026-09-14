import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { clearAuthCookie } from '../utils/jwt.js';

export class UserController {
  /**
   * GET /api/me
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
   * PATCH /api/me/profile
   */
  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, displayName, avatar, photoURL } = req.body;

    try {
      if (name !== undefined) req.user.name = name;
      if (displayName !== undefined) req.user.displayName = displayName;
      if (avatar !== undefined) req.user.avatar = avatar;
      if (photoURL !== undefined) req.user.photoURL = photoURL;

      await req.user.save();

      res.status(200).json({
        success: true,
        user: req.user.toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update profile' });
    }
  }

  /**
   * PATCH /api/me/preferences
   */
  public static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const prefs = req.body;

    try {
      req.user.preferences = {
        ...req.user.preferences,
        ...prefs,
      };

      await req.user.save();

      res.status(200).json({
        success: true,
        preferences: req.user.preferences,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update preferences' });
    }
  }

  /**
   * DELETE /api/me
   * Deletes user document from MongoDB and clears authentication cookie
   */
  public static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    try {
      const userId = req.user._id;
      await User.findByIdAndDelete(userId);
      clearAuthCookie(res);

      res.status(200).json({
        success: true,
        message: 'Account and associated data deleted successfully',
        deletedUser: userId,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete account' });
    }
  }
}
