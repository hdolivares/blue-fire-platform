import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.message;
      } else {
        message = exception.message;
        error = exception.message;
      }
    } else if (exception instanceof MongoError) {
      // Handle MongoDB errors
      switch (exception.code) {
        case 11000: // Duplicate key error
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          error = 'Conflict';
          break;
        case 121: // Document validation failed
          status = HttpStatus.BAD_REQUEST;
          message = 'Validation failed';
          error = 'Bad Request';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database error occurred';
          error = 'Internal Server Error';
      }
    } else if (exception instanceof MongooseError.ValidationError) {
      // Handle Mongoose validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Bad Request';
    } else if (exception instanceof Error) {
      // Do NOT leak internal error text (DB/driver messages, absolute paths,
      // stack details) to clients in production. Full detail is still logged
      // below.
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
        error = 'Internal Server Error';
      } else {
        message = exception.message;
        error = exception.name;
      }
    }

    // Log the error
    this.logger.error(
      `Exception occurred: ${exception instanceof Error ? exception.stack : exception}`,
      {
        path: request.url,
        method: request.method,
        status,
        message,
        timestamp: new Date().toISOString(),
        userAgent: request.get('User-Agent'),
        ip: request.ip,
      }
    );

    // Send consistent error response
    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
} 