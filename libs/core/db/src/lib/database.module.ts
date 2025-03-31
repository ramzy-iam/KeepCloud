import { TypeOrmModule } from '@nestjs/typeorm';

const {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_SCHEMA,
  DATABASE_USERNAME,
  TYPEORM_LOGGING,
} = process.env;

export const DatabaseModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: DATABASE_HOST,
  port: +(DATABASE_PORT ?? 5432),
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  schema: DATABASE_SCHEMA,
  logging: Boolean(+(TYPEORM_LOGGING ?? 0)),
  synchronize: false,
  autoLoadEntities: true,
});
