import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('mail-sender-queue')
export class MailSenderProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send-newsletter-subscription-job')
  async processSendRecoverTokenJob(job: Job): Promise<void> {
    try {
      console.log('Start Send Newsletter Subscription Job...');
      const { email } = job?.data;
      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Albrix Newsletter Subscription',
        template: './newsletter-subscription',
        context: {},
      });
      if (result?.accept > 0) {
        console.log('Email send success');
      }
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(error);
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }

  @OnQueueError()
  onError(error: Error) {
    console.log(`Job ID failed. ${JSON.stringify(error)}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    console.log(
      `Completed job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}`,
    );
  }
}
