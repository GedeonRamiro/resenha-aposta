import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dtos/update-config.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/decorators';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  get() {
    return this.configService.get();
  }

  @Put()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Body() dto: UpdateConfigDto) {
    return this.configService.update(dto);
  }
}
