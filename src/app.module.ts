import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { KafkaModule } from './kafka/kafka.module';
import { UsersModule } from './user/user.module';
import { NotificationConsumer } from './consumer/notification.consumer';
import { AnalyticsConsumer } from './consumer/analytics.consumer';
import { EmailModule } from './email/mail.module';
import { EmailConsumer } from './consumer/email.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KafkaModule,
    EmailModule,
    UsersModule,
  ],
  providers: [
    EmailConsumer,
    NotificationConsumer,
    AnalyticsConsumer,
  ],
})
export class AppModule {}