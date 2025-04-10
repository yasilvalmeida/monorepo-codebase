import { Global, Module } from '@nestjs/common';
import { MailSenderService } from './service/mail-sender.service';
import { BullModule } from '@nestjs/bull';
import { MailSenderProcessor } from './processor/mail-sender.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail-sender-queue',
    }),
  ],
  providers: [MailSenderService, MailSenderProcessor],
  exports: [MailSenderService],
})
export class QueueModule {}
