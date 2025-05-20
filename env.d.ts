declare global {
  namespace NodeJS {
    interface ProcessEnv {
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
      VITE_GOOGLE_CLIENT_ID: string;
      API_BASE_URL: string;
    }
  }
}

// convert it into a module by adding an empty export statement.
export {};
