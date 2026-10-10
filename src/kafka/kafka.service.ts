import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Kafka,
  Producer,
  Consumer,
  EachMessagePayload,
  Admin,
  logLevel,
} from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Consumer[] = [];

  private readonly requiredTopics = [
    'user.registered',
    'user.logged-in',
    'order.created',
    'order.paid',
  ];

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'nest-kafka-app',
      brokers: [this.config.get('KAFKA_BROKER', 'localhost:9093')],
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    await this.ensureTopicsExist();

    this.producer = this.kafka.producer();
    await this.producer.connect();

    this.logger.log('✅ Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await Promise.all(this.consumers.map((c) => c.disconnect()));
    this.logger.log('❌ Kafka disconnected');
  }


  private async ensureTopicsExist(): Promise<void> {
    const admin: Admin = this.kafka.admin();

    try {
      await admin.connect();
      this.logger.log('🔌 Kafka Admin connected');

      const existingTopics = await admin.listTopics();
      this.logger.log(`📋 Existing topics: ${existingTopics.join(', ') || 'none'}`);

      const topicsToCreate = this.requiredTopics
        .filter((topic) => !existingTopics.includes(topic))
        .map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        }));

      if (topicsToCreate.length === 0) {
        this.logger.log('✅ All required topics exist');
        return;
      }

      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true,
        timeout: 10000,
      });

      this.logger.log(
        `✅ Created topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`,
      );

      const finalTopics = await admin.listTopics();
      this.logger.log(`📋 All topics: ${finalTopics.join(', ')}`);
    } catch (error) {
      this.logger.error('❌ Failed to ensure topics', error);
      throw error;
    } finally {
      await admin.disconnect();
    }
  }

  async publish<T>(topic: string, message: T, key?: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key || null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(`📤 Published to ${topic}`);
    } catch (error) {
      this.logger.error(`❌ Failed to publish to ${topic}`, error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════
  // Consumer
  // ═══════════════════════════════════════════════════════
  async subscribe(
    groupId: string,
    topics: string[],
    handler: (payload: EachMessagePayload) => Promise<void>,
  ): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
      eachMessage: async (payload) => {
        try {
          this.logger.log(
            `📥 [${groupId}] ${payload.topic}: ${payload.message.value?.toString()}`,
          );
          await handler(payload);
        } catch (error) {
          this.logger.error(`❌ Error in ${groupId}`, error);
        }
      },
    });

    this.consumers.push(consumer);
    this.logger.log(`✅ Consumer [${groupId}] → ${topics.join(', ')}`);
  }
}