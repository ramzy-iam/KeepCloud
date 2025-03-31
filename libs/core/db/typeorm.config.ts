import { DataSource } from 'typeorm';

const {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_SCHEMA,
} = process.env;

const source = new DataSource({
  type: 'postgres',
  host: DATABASE_HOST,
  port: +(DATABASE_PORT ?? 5432),
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  schema: DATABASE_SCHEMA,
  entities: ['**/*.entity.ts'],
  migrations: ['libs/core/db/migrations/*-migration.ts'],
});

export default source;
