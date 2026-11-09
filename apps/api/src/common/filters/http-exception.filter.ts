import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : null;
    const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : typeof raw === 'string' ? raw : (raw as {message?: unknown} | null)?.message ?? 'Erro interno do servidor';
    response.status(status).json({ statusCode: status, timestamp: new Date().toISOString(), path: request.url, message });
  }
}
