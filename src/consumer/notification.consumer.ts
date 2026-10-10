import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import {
  KAFKA_TOPICS,
  KAFKA_GROUPS,
} from '../kafka/kafka.constant';
import { UserRegisteredEvent } from '../user/event/user-registered.event';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(private readonly kafka: KafkaService) {}

  async onModuleInit() {
    await this.kafka.subscribe(
      KAFKA_GROUPS.NOTIFICATION_SERVICE,
      [KAFKA_TOPICS.USER_REGISTERED],
      async ({ message }) => {
        const event: UserRegisteredEvent = JSON.parse(
          message.value!.toString(),
        );

        this.logger.log(`🔔 Push notification sent to ${event.email}`);
      },
    );
  }
}