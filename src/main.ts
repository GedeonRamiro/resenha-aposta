import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = new Set([
    'http://localhost:3000',
    'https://resenha-aposta-front-chi.vercel.app',
  ]);

  const frontendUrl = (process.env.FRONTEND_URL ?? '').trim();
  if (frontendUrl) {
    allowedOrigins.add(frontendUrl);
  }

  const corsOriginsFromEnv = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of corsOriginsFromEnv) {
    allowedOrigins.add(origin);
  }

  const isAllowedNgrokOrigin = (origin: string): boolean => {
    try {
      const { protocol, hostname } = new URL(origin);
      const isHttp = protocol === 'http:' || protocol === 'https:';
      const isNgrokHost =
        hostname.endsWith('.ngrok-free.dev') ||
        hostname.endsWith('.ngrok.io') ||
        hostname.endsWith('.ngrok.app');

      return isHttp && isNgrokHost;
    } catch {
      return false;
    }
  };

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      const isStringOrigin = typeof origin === 'string';

      if (
        !origin ||
        (isStringOrigin &&
          (allowedOrigins.has(origin) || isAllowedNgrokOrigin(origin)))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8000);
}

void bootstrap();
