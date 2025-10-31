import 'dotenv/config';
import * as z from 'zod/v4';

export const awsSchema = z.object({
  APP_AWS_ACCESS_KEY_ID: z.string().optional(),
  APP_AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_DEFAULT_REGION: z.string().default('eu-west-3'),
  SES_AWS_REGION: z.string().default('us-east-1'),
});

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  API_ALLOWED_ORIGIN_LIST: z.string().default('http://localhost:4200'),
  SYSTEM_QUEUE_URL: z.string().default('redis://localhost:6379'),
  FILE_BUCKET: z.string(),
  FRONTEND_URL: z.url().default('http://keepcloud.heyramzy.com'),
  TEMPLATES_BUCKET: z.string().default('templates-rzlab'),
  SUPPORT_EMAIL: z.email().default('ramesfeukeng@gmail.com'),
  GOOGLE_CLIENT_SECRET: z.string(),
  VITE_GOOGLE_CLIENT_ID: z.string(),
  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  REQUEST_LOGGING_ENABLED: z.stringbool().default(false),

  NO_REPLY_EMAIL: z.string().default('no-reply@heyramzy.com'),

  ...awsSchema.shape,

  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),

  JWT_SECRET_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET_EXPIRES_IN: z.string().default('15d'),

  CREATE_INITIAL_FOLDERS_ON_SIGNUP: z.stringbool().default(false),
});

export type EnvVariables = z.infer<typeof envSchema>;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    'Invalid environment variables:',
    z.prettifyError(result.error),
  );
  process.exit(1);
}

export const Env = result.data;
