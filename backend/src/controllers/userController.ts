import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { deleteFirebaseUser } from '../config/firebase.js';

export class UserController {
  /**
   * GET /api/me
   */
  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;

    try {
      const user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found in database' });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          onboardingCompleted: user.onboardingCompleted,
          profile: user.profile,
          preferences: user.preferences,
          personalization: user.personalization,
          savedLocations: user.savedLocations,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Server Error', message: err.message });
    }
  }

  /**
   * PATCH /api/me/profile
   */
  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;
    const { displayName, photoURL } = req.body;

    try {
      const user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      if (displayName !== undefined) user.displayName = displayName;
      if (photoURL !== undefined) user.photoURL = photoURL;

      await user.save();

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Server Error', message: err.message });
    }
  }

  /**
   * PATCH /api/me/preferences
   */
  public static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;
    const prefs = req.body;

    try {
      const user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      user.preferences = {
        ...user.preferences,
        ...prefs,
      };

      await user.save();

      res.status(200).json({
        success: true,
        preferences: user.preferences,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Server Error', message: err.message });
    }
  }

  /**
   * DELETE /api/me
   * Deletes user document from MongoDB and removes from Firebase Auth
   */
  public static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;

    try {
      if (!uid) {
        res.status(400).json({ error: 'Bad Request', message: 'Missing user ID' });
        return;
      }

      const deleted = await User.findOneAndDelete({ firebaseUid: uid });
      await deleteFirebaseUser(uid);

      res.status(200).json({
        success: true,
        message: 'Account and associated data deleted successfully',
        deletedUser: deleted?._id,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Server Error', message: err.message });
    }
  }
}
