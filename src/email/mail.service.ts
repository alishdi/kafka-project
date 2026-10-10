import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    // ⭐ Ethereal با اطلاعات ثابت
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'jennyfer.gulgowski96@ethereal.email',   // ⭐ یوزر تو
        pass: '2nwbx5gdeyhbHpnagR',                     // ⭐ پسورد تو
      },
    });

    // ⭐ تأیید اتصال
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email transporter ready');
      this.logger.log('📬 View emails at: https://ethereal.email/messages');
    } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
      this.logger.error('❌ Email transporter failed', message);
    }
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = `"Task API" <noreply@task-api.com>`;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`✉️ Email sent to ${options.to}`);
      this.logger.log(`   📬 Message ID: ${info.messageId}`);
      this.logger.log(`   📬 Preview: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to send: ${message}`);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, fullName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 خوش آمدید ${fullName}!</h1>
          </div>
          <div class="content">
            <p>سلام ${fullName} عزیز،</p>
            <p>حساب کاربری شما با موفقیت ساخته شد!</p>
          </div>
          <div class="footer">
            <p>© 2026 Task API</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send({
      to,
      subject: `🎉 خوش آمدید ${fullName}`,
      html,
    });
  }
}