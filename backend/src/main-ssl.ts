// SSL-enabled version of main.ts for NestJS
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { FRONTEND_URL } from './config/server';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // SSL Certificate configuration
  const httpsOptions = {
    key: fs.readFileSync('/path/to/your/private-key.pem'),
    cert: fs.readFileSync('/path/to/your/certificate.pem'),
    // If you have a certificate chain
    // ca: fs.readFileSync('/path/to/your/ca-bundle.pem'),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  
  const configService = app.get(ConfigService);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
    })
  );

  // CORS Configuration for HTTPS
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

  // Trust proxy headers for SSL (if using Express adapter)
  // app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const port = configService.get('PORT') || 3001;
  const environment = configService.get('NODE_ENV') || 'development';

  await app.listen(port);
  
  logger.log(`🚀 Blue Fire Platform API is running on HTTPS port ${port}`);
  logger.log(`🔒 SSL/TLS enabled`);
  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`📚 API Documentation: https://localhost:${port}/docs`);
  logger.log(`🔗 Frontend URL: ${configService.get('FRONTEND_URL') || FRONTEND_URL}`);
}

bootstrap(); 