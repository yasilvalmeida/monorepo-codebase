import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailSenderService {
  constructor(
    @InjectQueue('mail-sender-queue') private mailSenderQueue: Queue,
  ) {}

  async addNewsletterSubscriptionSendMailJob(mail: string) {
    const job = await this.mailSenderQueue.add(
      'send-newsletter-subscription-job',
      { mail },
      { attempts: 5, removeOnComplete: true },
    );
    console.log(`created new send newsletter subscription job ${job.id}`);
  }
}
