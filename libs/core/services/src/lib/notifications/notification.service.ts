import { Env, Logger } from '@keepcloud/commons/backend';
import { TemplateKey } from '@keepcloud/commons/constants';
import { Injectable } from '@nestjs/common';
import { SystemQueueService } from '../queues';

@Injectable()
export class NotificationService {
  private readonly frontendUrl: string;
  private readonly supportEmail: string;
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly systemQueueService: SystemQueueService) {
    this.frontendUrl = Env.VITE_FRONTEND_URL;
    this.supportEmail = Env.SUPPORT_EMAIL;
  }

  async sendWelcomeEmail(
    email: string,
    firstName?: string | null,
  ): Promise<void> {
    await this.systemQueueService.enqueueSendEmail({
      templateKey: TemplateKey.WELCOME_EMAIL,
      to: email,
      subject:
        '[KeepCloud] Welcome to KeepCloud - Your secure cloud storage is ready!',
      data: {
        firstName: firstName || 'there',
        dashboardUrl: `${this.frontendUrl}/home`,
        supportEmail: this.supportEmail,
        currentYear: new Date().getFullYear(),
      },
    });
    this.logger.info(
      `Welcome email queued for ${email} with first name: ${firstName}`,
    );
  }
}
