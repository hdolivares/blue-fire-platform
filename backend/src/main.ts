// In backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { FRONTEND_URL } from './config/server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Trust the single reverse-proxy hop (Caddy in production) so Express derives
  // the real client IP (req.ip) from X-Forwarded-For instead of trusting the raw
  // client header. This is what makes the rate limiter's per-IP keying non-spoofable.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Security response headers (defense in depth alongside nginx).
  app.use(helmet());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit conversion
      },
      disableErrorMessages: false, // Keep error messages for development
    })
  );

  // CORS Configuration
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
  });

  const port = configService.get('PORT') || 3001;
  const environment = configService.get('NODE_ENV') || 'development';
  // Bind to loopback by default: only the reverse proxy should reach the API
  // directly. Set HOST=0.0.0.0 explicitly if a deployment needs wider exposure.
  const host = configService.get('HOST') || '127.0.0.1';

  await app.listen(port, host);

  logger.log(`🚀 Blue Fire Platform API is running on ${host}:${port}`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  logger.log(`🔗 Frontend URL: ${configService.get('FRONTEND_URL') || FRONTEND_URL}`);
}

bootstrap();