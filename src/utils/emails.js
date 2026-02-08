import { fileURLToPath } from 'url';
import path from 'path';
import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.userName = user.name;
    this.url = url;
    this.from = 'Support <support@health-care.io>';
  }

  newTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      userName: this.userName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html, {
        wordwrap: 130,
      }),
    };

    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Health-Care 🎉');
  }

  async sendPasswordReset() {
    await this.send(
      'password-reset',
      'Your password reset token (valid for only 10 min)',
    );
  }

  async sendDoctorApprove() {
    await this.send(
      'doctor-approval',
      'Your doctor profile has been approved 🎉',
    );
  }

  async sendDoctorReject() {
    await this.send(
      'doctor-rejection',
      'Unfortunately, your doctor profile has been rejected 😢',
    );
  }
}
