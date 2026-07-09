import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { FRONTEND_URL } from '../config/server';

@Injectable()
export class EmailService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!brevoApiKey) {
      throw new InternalServerErrorException('Brevo API Key is not configured.');
    }

    // This is the new, correct way to initialize and set the key
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      brevoApiKey,
    );
  }

  /**
   * The verified Brevo sender. Overridable via env so the sender can move to a
   * bluefire.ink domain address (once verified in Brevo) without a code change.
   * NOTE: whatever address this resolves to MUST be a verified sender in the
   * Brevo account, or every send is rejected.
   */
  private sender(): { name: string; email: string } {
    return {
      name: this.configService.get<string>('EMAIL_SENDER_NAME') || 'Blue Fire Platform',
      // Domain-authenticated sender (DKIM + DMARC on bluefire.ink). Override per
      // environment with EMAIL_SENDER_ADDRESS; must be a verified Brevo sender.
      email: this.configService.get<string>('EMAIL_SENDER_ADDRESS') || 'noreply@bluefire.ink',
    };
  }

  async sendPasswordResetEmail(userEmail: string, token: string) {
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = 'Your Password Reset Link';
    sendSmtpEmail.htmlContent = `<p>You requested a password reset. Please click this link to create a new password:</p><a href="${resetLink}">${resetLink}</a><p>This link will expire in one hour.</p>`;
    sendSmtpEmail.sender = this.sender();
    sendSmtpEmail.to = [{ email: userEmail }];

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Password reset email sent successfully via Brevo.');
    } catch (error) {
      console.error('Failed to send email via Brevo:', error);
      throw error;
    }
  }

  /**
   * Weekly heartbeat + status digest to the admin. Its main job is to keep the
   * Brevo API key active (Brevo deactivates long-idle keys); the stats make it
   * useful rather than noise. Sent to STATUS_REPORT_EMAIL (falls back to the
   * sender address).
   */
  async sendStatusReport(stats: { users: number; projects: number; generatedAt: string }) {
    const recipient =
      this.configService.get<string>('STATUS_REPORT_EMAIL') || this.sender().email;
    const environment = this.configService.get<string>('NODE_ENV') || 'development';

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `Blue Fire — Weekly Status (${environment})`;
    sendSmtpEmail.htmlContent = `
      <h2>Blue Fire Platform — Weekly Status</h2>
      <ul>
        <li><strong>Environment:</strong> ${environment}</li>
        <li><strong>Registered users:</strong> ${stats.users}</li>
        <li><strong>Projects:</strong> ${stats.projects}</li>
        <li><strong>Generated:</strong> ${stats.generatedAt}</li>
      </ul>
      <p>Automated weekly heartbeat — also keeps the email service key active.</p>`;
    sendSmtpEmail.sender = this.sender();
    sendSmtpEmail.to = [{ email: recipient }];

    await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Weekly status report sent via Brevo.');
  }
}