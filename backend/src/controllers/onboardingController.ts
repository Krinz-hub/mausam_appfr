import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
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
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    try {
      const validated = OnboardingSchema.parse(req.body);
      const userIdStr = user._id.toString();

      // Execute server-side Engine 1 processing
      const { needProfile, personaProfile, userProfileData } = Engine1Service.processOnboarding(
        validated,
        userIdStr
      );

      user.onboardingCompleted = true;
      user.profile = userProfileData;
      user.personalization = {
        needProfile,
        personaProfile,
      };

      await user.save();

      console.log(`✅ Onboarding completed and persisted in MongoDB for user: ${userIdStr}`);

      res.status(200).json({
        success: true,
        message: 'Onboarding completed and personalization profiles persisted',
        user: user.toJSON(),
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation Error', issues: err.issues });
        return;
      }
      console.error('Error submitting onboarding:', err);
      res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
  }

  /**
   * GET /api/me/personalization
   */
  public static async getPersonalization(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      personalization: user.personalization,
    });
  }
}
