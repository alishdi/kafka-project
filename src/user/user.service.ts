import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { KafkaService } from '../kafka/kafka.service';
import { KAFKA_TOPICS } from '../kafka/kafka.constant';
import { UserRegisteredEvent } from './event/user-registered.event';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  private users: Map<string, any> = new Map();

  constructor(private readonly kafka: KafkaService) {}

  async register(dto: RegisterDto) {
    this.logger.log(`📝 Registering user: ${dto.email}`);

    const existing = Array.from(this.users.values()).find(
      (u) => u.email === dto.email,
    );
    if (existing) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    const user = {
      id: randomUUID(),
      email: dto.email,
      fullName: dto.fullName,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);

    const event: UserRegisteredEvent = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      registeredAt: user.createdAt,
    };

    try {
      await this.kafka.publish(
        KAFKA_TOPICS.USER_REGISTERED,
        event,
        user.id,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to publish event: ${message}`);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }
}