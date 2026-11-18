import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const path = request.originalUrl.split('?')[0];

      if (process.env.NODE_ENV === 'production') {
        this.logger.error(`Unhandled ${request.method} ${path} error`);
      } else if (exception instanceof Error) {
        this.logger.error(
          `${request.method} ${path}: ${exception.name}: ${exception.message}`,
          exception.stack,
        );
      } else {
        this.logger.error(`${request.method} ${path}: ${String(exception)}`);
      }
    }

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    let message = 'Internal server error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const exceptionMessage = exceptionResponse.message;

      if (typeof exceptionMessage === 'string') {
        message = exceptionMessage;
      } else if (Array.isArray(exceptionMessage)) {
        message = exceptionMessage.join(', ');
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
