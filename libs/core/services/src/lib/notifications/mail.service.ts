import {
  EmailHelper,
  Env,
  S3Helper,
  TemplateHelper,
  Logger,
} from '@keepcloud/commons/backend';
import { TemplateKey } from '@keepcloud/commons/constants';
import { Injectable } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';

export interface SendEmailOptions {
  templateKey: TemplateKey;
  to: string | string[];
  subject: string;
  data: Record<string, unknown>;
  from?: string;
  attachments?: Mail.Attachment[];
}
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailHelper = EmailHelper.getInstance();
  private readonly s3Helper = S3Helper.getInstance();
  private readonly senderEmail: string;
  private readonly templateBucket: string;

  constructor() {
    this.templateBucket = Env.TEMPLATES_BUCKET;
  }

  private async loadTemplate(templateKey: TemplateKey): Promise<string> {
    const response = await this.s3Helper.readFile(
      this.templateBucket,
      templateKey,
    );
    if (!response?.Body) {
      throw new Error(`Failed to load email template: ${templateKey}`);
    }
    return response.Body.transformToString();
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const {
      templateKey,
      to,
      subject,
      data,
      from = this.senderEmail,
      attachments = [],
    } = options;

    try {
      const templateMjml = await this.loadTemplate(templateKey);
      const html = TemplateHelper.generateDocumentFromMJML(templateMjml, data);

      await this.emailHelper.sendDirectEmail({
        to,
        from,
        subject,
        html,
        attachments,
      });

      this.logger.info(`Email sent to ${to} with subject "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
