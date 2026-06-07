import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncUserDto } from './dto/sync-user.dto';
import * as jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? '';
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(data: SyncUserDto) {
    const secret = getJwtSecret();
    if (!secret) {
      throw new Error('JWT_SECRET não está definido');
    }

    const user = await this.prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        image: data.image,
        provider: data.provider,
        providerId: data.providerId,
      },
      create: {
        name: data.name,
        email: data.email,
        image: data.image,
        provider: data.provider,
        providerId: data.providerId,
      },
    });

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    return {
      user,
      token,
    };
  }
}
