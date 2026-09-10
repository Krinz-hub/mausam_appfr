import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Engine1Service } from '../services/engine1Service.js';

const OnboardingSchema = z.object({
  userTypeKeys: z.array(z.string()).min(1, 'At least one user type is required'),
  weatherFactorKeys: z.array(z.string()).min(1, 'At least one weather factor is required'),
  activePeriods: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).min(1),
  explanation: z.string().optional(),
});

export class OnboardingController {
  /**
   * POST /api/me/onboarding
   * Submits user onboarding answers, processes Engine 1 logic on the server,
   * and persists needProfile and personaProfile to MongoDB.
   */
  public static async submitOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const validated = OnboardingSchema.parse(req.body);

      const user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found in database' });
        return;
      }

      // Execute server-side Engine 1 processing
      const { needProfile, personaProfile, userProfileData } = Engine1Service.processOnboarding(
        validated,
        uid
      );

      user.onboardingCompleted = true;
      user.profile = userProfileData;
      user.personalization = {
        needProfile,
        personaProfile,
      };

      await user.save();

      console.log(`✅ Onboarding completed and persisted in MongoDB for user: ${uid}`);

      res.status(200).json({
        success: true,
        message: 'Onboarding completed and personalization profiles persisted',
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          onboardingCompleted: user.onboardingCompleted,
          profile: user.profile,
          personalization: user.personalization,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation Error', issues: err.issues });
        return;
      }
      console.error('Error submitting onboarding:', err);
      res.status(500).json({ error: 'Server Error', message: err.message });
    }
  }

  /**
   * GET /api/me/personalization
   */
  public static async getPersonalization(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;

    try {
      const user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        personalization: user.personalization,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Server Error', message: err.message });
    }
  }
}
