import { fileURLToPath } from 'url';
import path from 'path';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { Resend } from 'resend';
import AppError from './AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailServices {
  constructor(user, url) {
    this.to = user.email;
    this.userName = user.name;
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'Healthcare <noreply@resend.dev>';
  }

  async sendEmail({ subject, template }) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      userName: this.userName,
      url: this.url,
      subject,
    });

    try {
      await resend.emails.send({
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html),
      });
    } catch (err) {
      console.log('Email failed: ', err.message);
      throw new AppError('Faild to send email', 500);
    }
  }

  sendEmailVerification() {
    return this.sendEmail({
      subject: 'Email Verification',
      template: 'email-verification',
    });
  }

  sendWelcomeEmail() {
    return this.sendEmail({
      subject: 'Welcome to Health-Care Family',
      template: 'welcome',
    });
  }

  sendPasswordRest() {
    return this.sendEmail({
      subject: 'Your password reset token',
      template: 'password-reset',
    });
  }

  sendPasswordResetSuccess() {
    return this.sendEmail({
      subject: 'Your password has successfully reset',
      template: 'password-reset-success',
    });
  }

  sendDoctorApproval() {
    return this.sendEmail({
      subject: 'Your doctor profile has been approved',
      template: 'doctor-approval',
    });
  }

  sendDoctorReject() {
    return this.sendEmail({
      subject: 'Your doctor profile rejected',
      template: 'doctor-rejection',
    });
  }
}
