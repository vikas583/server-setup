import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { TokenData, UserRoles } from '../types';
import { RESPONSE_STATUS } from './ResponseStatus';
import { APIError } from './APIError';

export const authChecker = (req: Request, res: Response, roles: UserRoles[]): boolean => {
    try {
        const { authorization } = req.headers || {};
        const { token: queryToken } = req.query || {};
        
        if (!authorization && typeof queryToken !== 'string') return false;


        let token = authorization?.split("Bearer ")[1];
        if (!token) token = queryToken as string;
        if (!token) {
            throw new APIError('Please login again!', RESPONSE_STATUS.UNAUTHENTICATED)
        }
        const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as TokenData;
        if (!userData) {
            throw new APIError('Invalid token!', RESPONSE_STATUS.UNAUTHENTICATED)
        };

        // Here, userData.role should be the user's role extracted from the token.
        // Check if the user's role matches any of the roles provided.

        if (roles.includes(userData.role)) return true;

        throw new APIError('You do not have permission to access this resource', RESPONSE_STATUS.FORBIDDEN)
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new APIError('Token has expired, please refresh your token', RESPONSE_STATUS.UNAUTHENTICATED)
        } else if (error.name === 'JsonWebTokenError') {
            throw new APIError('Invalid token', RESPONSE_STATUS.UNAUTHENTICATED)
        } else {
            throw new APIError('Internal server error', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
    }
};

