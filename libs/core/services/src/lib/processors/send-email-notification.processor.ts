import { Logger } from '@keepcloud/commons/backend';
import { Injectable } from '@nestjs/common';
import { Processor } from '@keepcloud/commons/types';
import { MailService, SendEmailOptions } from '../notifications';

@Injectable()
export class SendEmailNotificationProcessor implements Processor {
  protected readonly logger = new Logger(SendEmailNotificationProcessor.name);

  constructor(private readonly mailService: MailService) {}

  async execute(data: SendEmailOptions) {
    const { to: recipientEmail, subject } = data;

    this.logger.info(
      `Sending email notification to ${recipientEmail} with subject: ${subject}`,
    );

    try {
      await this.mailService.sendEmail(data);

      this.logger.info(
        `Successfully sent email notification to ${recipientEmail}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to send email notification to ${recipientEmail}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
