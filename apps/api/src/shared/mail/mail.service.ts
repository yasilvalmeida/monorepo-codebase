import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';
import { MailSenderService } from '../queue/service/mail-sender.service';

@Injectable()
export class MailService {
  constructor(private readonly mailSenderService: MailSenderService) {}

  async sendNewsletterSubscription(email: string): Promise<SentMessageInfo> {
    this.mailSenderService.addNewsletterSubscriptionSendMailJob(email);
  }
}
