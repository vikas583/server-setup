import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from "typeorm";

const port = process.env.DB_PORT as unknown as number;

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: port,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    synchronize: process.env.NODE_ENV === 'development' ? true : false,
    logging: process.env.NODE_ENV === 'development' ? true : false,
    entities: [`dist/entity/*.{ts,js}`],
    migrations: [`dist/migrations/*.{ts,js}`]
})

export const dbConnection = async () => {
    if (!dataSource.isInitialized) {
        console.log('Database Initialized!!!')
        await dataSource.initialize();
    }
    return dataSource;
};