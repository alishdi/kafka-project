import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service'; 
import {
  KAFKA_TOPICS,
  KAFKA_GROUPS,
} from '../kafka/kafka.constant';
import { UserRegisteredEvent } from '../user/event/user-registered.event';

@Injectable()
export class AnalyticsConsumer implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsConsumer.name);

  constructor(private readonly kafka: KafkaService) {}

  async onModuleInit() {
    await this.kafka.subscribe(
      KAFKA_GROUPS.ANALYTICS_SERVICE,
      [KAFKA_TOPICS.USER_REGISTERED],
      async ({ message }) => {
        const event: UserRegisteredEvent = JSON.parse(
          message.value!.toString(),
        );

        this.logger.log(`📊 New user registered: ${event.email}`);
        this.logger.log(`📈 Total users: +1`);
      },
    );
  }
}