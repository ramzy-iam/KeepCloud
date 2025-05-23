import { Global, Module } from '@nestjs/common';
import { PrismaService, RLSContextService } from './prisma';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
