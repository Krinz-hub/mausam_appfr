import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type HapticNotificationType = 'success' | 'warning' | 'error';

class HapticManager {
  private enabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async impact(style: HapticImpactStyle = 'light'): Promise<void> {
    if (!this.enabled) return;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          const duration = style === 'heavy' ? 25 : style === 'medium' ? 18 : 10;
          navigator.vibrate(duration);
        }
        return;
      }

      let expoStyle: Haptics.ImpactFeedbackStyle;
      switch (style) {
        case 'medium':
          expoStyle = Haptics.ImpactFeedbackStyle.Medium;
          break;
        case 'heavy':
          expoStyle = Haptics.ImpactFeedbackStyle.Heavy;
          break;
        case 'rigid':
          expoStyle = Haptics.ImpactFeedbackStyle.Rigid;
          break;
        case 'soft':
          expoStyle = Haptics.ImpactFeedbackStyle.Soft;
          break;
        case 'light':
        default:
          expoStyle = Haptics.ImpactFeedbackStyle.Light;
          break;
      }

      await Haptics.impactAsync(expoStyle);
    } catch {
      // Haptics not available on this platform/device
    }
  }

  public async selection(): Promise<void> {
    if (!this.enabled) return;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(8);
        }
        return;
      }
      await Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  }

  public async notification(type: HapticNotificationType = 'success'): Promise<void> {
    if (!this.enabled) return;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          const pattern = type === 'error' ? [30, 40, 30] : [15, 30, 15];
          navigator.vibrate(pattern);
        }
        return;
      }

      let expoType: Haptics.NotificationFeedbackType;
      switch (type) {
        case 'warning':
          expoType = Haptics.NotificationFeedbackType.Warning;
          break;
        case 'error':
          expoType = Haptics.NotificationFeedbackType.Error;
          break;
        case 'success':
        default:
          expoType = Haptics.NotificationFeedbackType.Success;
          break;
      }

      await Haptics.notificationAsync(expoType);
    } catch {
      // Ignore
    }
  }
}

export const hapticManager = new HapticManager();
