import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync-user')
  @HttpCode(HttpStatus.OK)
  syncUser(@Body() dto: SyncUserDto) {
    return this.authService.syncUser(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
