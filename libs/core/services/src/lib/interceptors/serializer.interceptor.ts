import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance, plainToClassFromExist } from 'class-transformer';
import { Observable, map } from 'rxjs';

export class SerializerInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    };

    return next.handle().pipe(
      map((data: any) => {
        return typeof this.dto === 'function'
          ? plainToInstance(this.dto, data, options)
          : plainToClassFromExist(this.dto, data, { ...options });
      })
    );
  }
}

export function Serialize(dto: any) {
  return UseInterceptors(new SerializerInterceptor(dto));
}
