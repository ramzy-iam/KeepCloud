import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BY_PASS_RLS, IS_PUBLIC } from '../decorators';
import { PrismaService, RLSContextService } from '@keepcloud/core/db';
import { ForbiddenException } from '@keepcloud/commons/backend';

@Injectable()
export class RLSAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const shouldByPass = this.reflector.getAllAndOverride<boolean>(
      BY_PASS_RLS,
      [context.getHandler(), context.getClass()],
    );

    RLSContextService.prismaWithoutRLS = this.prismaService.getClient(); //by pass rls by default

    if (isPublicRoute || shouldByPass) {
      RLSContextService.prisma = this.prismaService.getClient();
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException();
    }

    RLSContextService.prisma = this.prismaService.getClient(userId);
    RLSContextService.userId = userId;

    return true;
  }
}
