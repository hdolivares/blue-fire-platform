import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from '@getbrevo/brevo';

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

  async sendPasswordResetEmail(userEmail: string, token: string) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = 'Your Password Reset Link';
    sendSmtpEmail.htmlContent = `<p>You requested a password reset. Please click this link to create a new password:</p><a href="${resetLink}">${resetLink}</a><p>This link will expire in one hour.</p>`;
    sendSmtpEmail.sender = { name: 'Blue Fire Platform', email: 'hobeja7@gmail.com' };
    sendSmtpEmail.to = [{ email: userEmail }];

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Password reset email sent successfully via Brevo.');
    } catch (error) {
      console.error('Failed to send email via Brevo:', error);
      throw error;
    }
  }
}