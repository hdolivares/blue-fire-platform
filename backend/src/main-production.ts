// Production-optimized main.ts for Blue Fire Platform
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { FRONTEND_URL } from './config/server';

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

  // Enhanced CORS Configuration for SSL/Production
  const frontendUrl = configService.get('FRONTEND_URL') || FRONTEND_URL;
  const environment = configService.get('NODE_ENV') || 'development';
  
  // CORS origins based on environment
  const corsOrigins = environment === 'production' 
    ? [
        frontendUrl, // https://app.bluefire.love
        'https://app.bluefire.love', // Explicit HTTPS
        'https://www.app.bluefire.love', // www subdomain if needed
      ]
    : [
        frontendUrl,
        'http://localhost:8080', // Local development
        'http://localhost:3000', // Backup local
        'http://161.35.225.243:8080', // IP access
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Forwarded-For',
      'X-Forwarded-Proto',
      'X-Real-IP',
    ],
    // Additional security headers for production
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false,
  });

  // Trust proxy headers (important for SSL with Nginx)
  if (environment === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  const port = configService.get('PORT') || 3001;

  await app.listen(port);
  
  logger.log(`🚀 Blue Fire Platform API is running on port ${port}`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`🔒 SSL Mode: ${environment === 'production' ? 'Enabled' : 'Development'}`);
  logger.log(`📚 API Documentation: ${environment === 'production' ? 'https' : 'http'}://localhost:${port}/docs`);
  logger.log(`🔗 Frontend URL: ${frontendUrl}`);
  logger.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
}

bootstrap(); 