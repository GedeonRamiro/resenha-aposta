import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? process.env.BETTER_AUTH_SECRET ?? '';
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const secret = getJwtSecret();
      if (!secret) {
        throw new Error('JWT_SECRET ou BETTER_AUTH_SECRET não está definido');
      }

      const payload = jwt.verify(token, secret) as { userId: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user) {
        req.user = user;
      }
    } catch {
      // Token inválido, mas não lança erro aqui, apenas não seta user
    }

    next();
  }
}
