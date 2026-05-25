import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncUserDto } from './dto/sync-user.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(data: SyncUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          provider: data.provider,
          providerId: data.providerId,
        },
      }));

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não está definido');

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    return {
      user,
      token,
    };
  }
}
