import * as z from 'zod/v4';

export const envSchema = z.object({
  VITE_GOOGLE_CLIENT_ID: z.string(),
  VITE_API_BASE_URL: z.string(),
  VITE_DOMAIN_NAME: z.string(),
});

export type EnvVariables = z.infer<typeof envSchema>;

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  console.error(
    'Invalid environment variables:',
    z.prettifyError(result.error),
  );
  throw new Error('Invalid environment variables');
}

export const Env = result.data;
