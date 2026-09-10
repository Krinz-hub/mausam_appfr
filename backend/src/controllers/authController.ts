import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

export class AuthController {
  /**
   * POST /api/auth/sync
   * Authenticated endpoint called immediately after mobile signs in with Google.
   * Finds or creates MongoDB user matching verified firebaseUid.
   */
  public static async syncAuth(req: AuthenticatedRequest, res: Response): Promise<void> {
    const verifiedUser = req.user;

    if (!verifiedUser || !verifiedUser.uid) {
      res.status(401).json({ error: 'Unauthorized', message: 'No verified Firebase user' });
      return;
    }

    try {
      const { uid, email, displayName, photoURL } = verifiedUser;

      let user = await User.findOne({ firebaseUid: uid });
      let isNewUser = false;

      if (!user) {
        // Minimal user document on first login
        user = await User.create({
          firebaseUid: uid,
          email: email || `${uid}@mausam.in`,
          displayName: displayName || 'Weather Explorer',
          photoURL: photoURL || '',
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
        isNewUser = true;
        console.log(`✨ Created new MongoDB user for firebaseUid: ${uid}`);
      } else {
        // Optionally update display name or photo if changed
        if (displayName && user.displayName !== displayName) {
          user.displayName = displayName;
        }
        if (photoURL && user.photoURL !== photoURL) {
          user.photoURL = photoURL;
        }
        await user.save();
      }

      res.status(200).json({
        success: true,
        isNewUser,
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
      console.error('Error in syncAuth:', err);
      res.status(500).json({ error: 'Server Error', message: err.message || 'Failed to sync user' });
    }
  }

  /**
   * POST /api/auth/logout
   */
  public static async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
}
