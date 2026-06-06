import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseAllowedOrigins(value?: string): Set<string> {
  const origins =
    value
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  return new Set(origins);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = new Set([
    'http://localhost:3000',
    'https://resenha-aposta-front-chi.vercel.app',
    ...parseAllowedOrigins(process.env.FRONTEND_URL),
    ...parseAllowedOrigins(process.env.CORS_ORIGINS),
  ]);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        (typeof origin === 'string' && allowedOrigins.has(origin))
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
