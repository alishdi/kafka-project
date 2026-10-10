import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UsersService } from './user.service';
import { RegisterDto } from './dto/register.dto'; 

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  @ApiResponse({ status: 201, description: 'کاربر ثبت‌نام شد' })
  @ApiResponse({ status: 409, description: 'ایمیل تکراری' })
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }
}