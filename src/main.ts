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
