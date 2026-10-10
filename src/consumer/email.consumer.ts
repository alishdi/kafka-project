import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import {
  KAFKA_TOPICS,
  KAFKA_GROUPS,
} from '../kafka/kafka.constant';
import { UserRegisteredEvent } from '../user/event/user-registered.event';
import { EmailService } from '../email/mail.service';   

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly emailService: EmailService,   // ⭐ تزریق
  ) {}

  async onModuleInit() {
    await this.kafka.subscribe(
      KAFKA_GROUPS.EMAIL_SERVICE,
      [KAFKA_TOPICS.USER_REGISTERED],
      async ({ message }) => {
        const event: UserRegisteredEvent = JSON.parse(
          message.value!.toString(),
        );

        try {
          await this.emailService.sendWelcomeEmail(
            event.email,
            event.fullName,
          );

          this.logger.log(`✉️ Welcome email sent to ${event.email}`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          this.logger.error(`❌ Failed to send email: ${message}`);
        }
      },
    );
  }
}