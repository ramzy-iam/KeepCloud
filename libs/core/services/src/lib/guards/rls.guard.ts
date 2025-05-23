import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BY_PASS_RLS } from '../decorators';
import { RLSContextService } from '@keepcloud/core/db';
import { ForbiddenException } from '@keepcloud/commons/backend';

@Injectable()
export class RLSAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const byPassRLS = this.reflector.getAllAndOverride<boolean>(BY_PASS_RLS, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (byPassRLS) {
      RLSContextService.byPassRLS();
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException();
    }

    RLSContextService.setUserId(userId);

    return true;
  }
}
