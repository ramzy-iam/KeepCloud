import nodemailer from 'nodemailer';
import Mail, { Attachment } from 'nodemailer/lib/mailer';
import { AwsServiceHelper } from './base.helper';
import { TemplateHelper } from '../template.helper';
import { S3Helper } from './s3.helper';
import { Env } from '../../config';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Logger } from '../logger.helper';

interface EmailBaseOptions {
  from?: string;
  to: string | string[];
  subject: string;
  attachments?: Attachment[];
  cc?: string[];
  bcc?: string[];
}

interface SendEmailOptions extends EmailBaseOptions {
  html: string;
}

interface MailBuildAndSendOptions extends EmailBaseOptions {
  data: unknown;
  templateBucket?: string;
  templateKey?: string;
  htmlTemplate?: string;
}

interface DirectEmailOptions extends EmailBaseOptions {
  html: string;
  data?: unknown;
}

export class EmailHelper extends AwsServiceHelper {
  private sesClient: SESv2Client;
  protected static instanceMap = new Map<string, SESv2Client>();
  private readonly logger = new Logger(EmailHelper.name);

  constructor(accessKeyId: string, secretAccessKey: string, region: string) {
    super(accessKeyId, secretAccessKey, region);
    this.sesClient = new SESv2Client({
      ...this.getCredentials(),
      region: this.getRegion(),
    });
  }

  public static getInstance(region = Env.SES_AWS_REGION): EmailHelper {
    return this._getInstance<EmailHelper>(this, region);
  }

  private async sendEmail({
    from,
    to,
    subject,
    html,
    attachments = [],
    cc,
    bcc,
  }: SendEmailOptions) {
    const mailOptions: Mail.Options = {
      from: from ?? `KeepCloud <${Env.NO_REPLY_EMAIL}>`,
      to,
      subject,
      html,
      cc,
      bcc,
      attachments,
    };

    const transporter = nodemailer.createTransport({
      SES: { sesClient: this.sesClient, SendEmailCommand },
    });

    const toStr = Array.isArray(to) ? to.join(', ') : to;
    try {
      this.logger.info(`Sending email to ${toStr} - Subject: ${subject}`);
      const info = await transporter.sendMail(mailOptions);
      this.logger.info(
        `Email sent successfully to ${toStr} - Message ID: ${info.messageId}`,
      );
      return info;
    } catch (error) {
      this.logger.error(`Error logging email to ${toStr} - ${error}`);
      throw error;
    }
  }

  private async buildMailMessage(
    templateBucket: string,
    templateKey: string,
    data: unknown,
    htmlTemplate?: string,
  ): Promise<string> {
    if (htmlTemplate) {
      return TemplateHelper.generateDocument(htmlTemplate, data);
    }

    if (!templateBucket?.trim()) throw new Error('Template bucket is required');
    if (!templateKey?.trim()) throw new Error('Template key is required');

    const s3File = await S3Helper.getInstance().readFile(
      templateBucket,
      templateKey,
    );
    if (!s3File?.Body) {
      const msg = `Cannot read email template ${templateKey} from bucket ${templateBucket}`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    const templateStr = await s3File.Body.transformToString();
    return TemplateHelper.generateDocument(templateStr, data);
  }

  public async buildAndSendMailMessage(options: MailBuildAndSendOptions) {
    const {
      from,
      to,
      subject,
      data,
      templateBucket = '',
      templateKey = '',
      htmlTemplate,
      attachments = [],
      cc,
      bcc,
    } = options;

    const html = await this.buildMailMessage(
      templateBucket,
      templateKey,
      data,
      htmlTemplate,
    );

    await this.sendEmail({
      from,
      to,
      subject,
      html,
      attachments,
      cc,
      bcc,
    });
  }

  public async sendDirectEmail(options: DirectEmailOptions) {
    const {
      from,
      to,
      subject,
      html,
      data = {},
      attachments = [],
      cc,
      bcc,
    } = options;

    const compiledHtml = TemplateHelper.generateDocument(html, data);

    await this.sendEmail({
      from,
      to,
      subject,
      html: compiledHtml,
      attachments,
      cc,
      bcc,
    });
  }
}
