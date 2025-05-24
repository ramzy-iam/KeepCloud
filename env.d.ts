declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_HOST: string;
      DATABASE_PORT: string;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      DATABASE_SCHEMA: string;
      DATABASE_URL: string;
      DATABASE_URL_MIGRATION: string;
      TYPEORM_LOGGING: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      VITE_GOOGLE_CLIENT_ID: string;
      API_BASE_URL: string;

      APP_AWS_ACCESS_KEY_ID: string;
      APP_AWS_SECRET_ACCESS_KEY: string;
      APP_AWS_DEFAULT_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_DEFAULT_REGION: string;

      FILE_BUCKET: string;
    }
  }
}

// convert it into a module by adding an empty export statement.
export {};
