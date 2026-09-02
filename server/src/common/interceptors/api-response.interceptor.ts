import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_METADATA } from '../decorators/response-message.decorator';

export class StandardResponse<T> {
  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty()
  data: T | null;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T> | undefined
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T> | undefined> {
    const ctx = context.switchToHttp();
    const response: Response = ctx.getResponse();

    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_METADATA,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data: T) => {
        if (response.statusCode === 204) {
          return undefined;
        }

        return {
          message: customMessage || 'Success',
          data: data ?? null,
        };
      }),
    );
  }
}
