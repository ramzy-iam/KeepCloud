/**
 * Welcome Email Integration Example
 *
 * This demonstrates how the welcome email system works:
 *
 * 1. User signs up with Google OAuth
 * 2. AuthService.validateOrCreateUser() is called
 * 3. UserService.createOrUpdateGoogleUser() creates the user and returns { user, isNewUser: true }
 * 4. If isNewUser is true, AuthService sends a welcome email
 * 5. MailService.sendWelcomeEmail() uses the MJML template to send a branded email
 *
 * The welcome email includes:
 * - Personalized greeting with user's first name
 * - Account information (email, plan, storage)
 * - Feature highlights (security, organization, sync, sharing)
 * - Call-to-action button to access dashboard
 * - Getting started tips
 * - Support contact information
 *
 * Email Template Variables:
 * - firstName: User's first name from Google profile
 * - fullName: Full display name or email fallback
 * - email: User's email address
 * - dashboardUrl: Frontend dashboard URL
 * - supportEmail: Support contact email
 * - currentYear: Current year for copyright
 * - logoUrl: Company logo URL
 *
 * Error Handling:
 * - Email sending errors are logged but don't prevent user authentication
 * - Users can still access the platform even if welcome email fails
 * - Mail service uses AWS SES for reliable delivery
 */

import { AuthService } from '@keepcloud/core/services';

// Example usage in your auth controller:
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async googleAuth(code: string) {
    // This will automatically send welcome email for new users
    const tokens = await this.authService.validateOrCreateUser(code);
    return tokens;
  }
}
