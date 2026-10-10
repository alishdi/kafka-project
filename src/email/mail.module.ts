import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './mail.service'; 

@Global()   // ⭐ همه‌جا در دسترس
@Module({
  imports: [ConfigModule],       // برای ConfigService
  providers: [EmailService],     // ثبت EmailService
  exports: [EmailService],       // صادر کردن برای بقیه
})
export class EmailModule {}