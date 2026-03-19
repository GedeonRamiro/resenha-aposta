import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncUserDto } from './dto/sync-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(data: SyncUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (user) return user;

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        image: data.image,
        provider: data.provider,
        providerId: data.providerId,
      },
    });
  }
}
