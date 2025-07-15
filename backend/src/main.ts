// In backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

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
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
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

  await app.listen(port);
  
  logger.log(`🚀 Blue Fire Platform API is running on port ${port}`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  logger.log(`🔗 Frontend URL: ${configService.get('FRONTEND_URL') || 'http://localhost:3000'}`);
}

bootstrap();