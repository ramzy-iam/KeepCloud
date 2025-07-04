import 'dotenv/config';
import * as z from 'zod/v4';

export const awsSchema = z.object({
  APP_AWS_ACCESS_KEY_ID: z.string(),
  APP_AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_DEFAULT_REGION: z.string().default('eu-west-3'),
});

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  KEEPCLOUD_ALLOWED_ORIGIN: z.string().default('http://localhost:4200'),
  KEEPCLOUD_API_ALLOWED_ORIGIN_LIST: z
    .string()
    .default('http://localhost:4200'),

  API_ALLOWED_ORIGIN_LIST: z.string().default('http://localhost:4200'),
  SYSTEM_QUEUE_URL: z.string().default('redis://localhost:6379'),
  FILE_BUCKET: z.string(),
  API_BASE_URL: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_SECRET: z.string(),
  VITE_GOOGLE_CLIENT_ID: z.string(),
  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  ...awsSchema.shape,

  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
});

export type EnvVariables = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:', result.error.format());
  process.exit(1);
}

export const Env = result.data;
