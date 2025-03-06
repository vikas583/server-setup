declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY_DAYS: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    DB_PORT: string;
    CORS_DOMAINS: string;
    PORT: string;
    REQUEST_QUEUE: string;
    RESPONSE_QUEUE: string;
    DB_SCHEMA: string;
    KEY_VAULT_URL: string;
    AZURE_CLIENT_ID: string;
    AZURE_TENANT_ID: string;
    AZURE_CLIENT_SECRET: string;
    TOTP_API_KEY: string;
    TOTP_BASE_URL: string;
    TEMP_TOKEN_SECRET: string;
    RESET_PASSWORD_TOKEN_SECRET: string;
    BLOB_SERVICE_URL: string;
    BLOB_SERVICE_API_KEY: string;
    BLOB_BASE_URL: string;
    DB_INITIAL: string;
    ADMIN_NAME: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    FRONTEND_URL: string;
    DB_TEMPLATE_SCHMEA_NAME: string;
    RABBITMQ_CONN_STR: string;
    ACS_CONNECTION_STRING: string;
    EMAIL_SENDER_ADDRESS: string;
    PROFILE_PIC_BLOB_DIRECTORY_NAME: string;
    AZURE_CONTAINER_NAME: string;
    BACKEND_URL: string;
    AI_BACKEND_URL: string;
  }
}
