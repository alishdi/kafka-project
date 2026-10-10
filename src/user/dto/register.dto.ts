import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'ali@test.com',
    description: 'ایمیل کاربر',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'رمز عبور (حداقل ۶ کاراکتر)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: 'Ali Rezaei',
    description: 'نام کامل',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}