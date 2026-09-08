import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof raw === 'object' && raw && 'message' in raw ? (raw as { message: unknown }).message :
      status === 500 ? 'An unexpected error occurred' : String(raw ?? exception);
    response.status(status).json({ success: false, message, code: status === 500 ? 'INTERNAL_ERROR' : `HTTP_${status}`, path: request.url, timestamp: new Date().toISOString() });
  }
}
