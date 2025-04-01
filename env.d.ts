declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NX_AUTH_PUBLIC_URL: string;

      DATABASE_HOST: string;
      DATABASE_PORT: string;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
      DATABASE_SCHEMA: string;
      TYPEORM_LOGGING: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      API_BASE_URL: string;
    }
  }
}

// convert it into a module by adding an empty export statement.
export {};
