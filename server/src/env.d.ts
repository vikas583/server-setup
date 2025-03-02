declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY_DAYS: string;
    CORS_DOMAINS: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    DB_SCHEMA: string;
    BLOB_SERVICE_URL: string;
    BLOB_SERVICE_API_KEY: string;
    BLOB_BASE_URL: string;
    PORT: string;
  }
}
