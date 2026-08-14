import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal Server Error';
    let errorType = 'Internal Server Error';

    // HTTP Exceptions ( NotFoundException, BadRequest, etc...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const data = exceptionResponse as HttpExceptionResponse;

        message = data.message ?? exception.message;
        errorType = data.error ?? exception.name;
      } else {
        message = exception.message;
        errorType = exception.name;
      }
    }
    // Database connection lost, TypeORM errors, Syntax errors
    else if (exception instanceof Error) {
      //adding stack trace
      this.logger.error(
        `[${request.method}] ${request.originalUrl} - ${exception.message}`,
        exception.stack,
      );
    }

    // If the message is an array (from ValidationPipe) ..join it
    const finalMessage = Array.isArray(message) ? message.join(', ') : message;

    response.status(status).json({
      message: finalMessage,
      error: errorType,
      data: null,
    });
  }
}
