import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../../entity/admin';
import { dbConnection } from '../../utils/dbConnection';
import { AdminTokenData } from '../../admin-types';
import { RESPONSE_STATUS } from '../../utils/ResponseStatus';

export const AdminAuthWithRoleMiddleware = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract the token from the Authorization header
            const token = req.headers.authorization?.split('Bearer ')[1];
            if (!token) {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).json({ message: 'Authentication token is missing' });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as AdminTokenData;
            if (!decoded) {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).json({ message: 'Invalid token' });
            }

            // Fetch the admin data from the database
            const dataSource = await dbConnection();
            const admin = await dataSource.getRepository(Admin).findOne({ where: { email: decoded.email }, relations: ['adminRole'] });

            if (!admin) {
                return res.status(RESPONSE_STATUS.CONFLICT).json({ message: 'Admin not found' });
            }

            // Attach admin data to the request object
            req.admin = {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.adminRole.name
            }

            if (!allowedRoles.includes(admin.adminRole.name)) {
                return res.status(RESPONSE_STATUS.FORBIDDEN).json({ message: 'You do not have permission to access this resource' });
            }


            next();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).send({ message: 'Token has expired, please refresh your token' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).send({ message: 'Invalid token' });
            } else {
                console.error(error);
                return res.status(RESPONSE_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
            }
        }
    };
};
