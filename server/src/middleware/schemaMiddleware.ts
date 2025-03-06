
import { dbConnection } from '../utils/dbConnection';
import { NextFunction, Request, Response } from "express";

export const SchemaMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Assume user is already authenticated and their shortCode is available
        const user = req.user; // Replace this with your user retrieval logic

        if (user && user.shortCode) {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

            // Get the current connection and set the schema
            const dataSource = await dbConnection();
            await dataSource.query(`SET search_path TO ${schemaName}, public`)

        }

        next();
    }
}
