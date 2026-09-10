import { FirebaseAuthService } from './firebaseAuth';

export { FirebaseAuthService };

export class GoogleAuthService {
  public static signOut(): Promise<void> {
    return FirebaseAuthService.signOut();
  }
}
