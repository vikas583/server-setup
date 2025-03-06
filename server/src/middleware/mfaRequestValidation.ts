import { NextFunction, Request, Response } from "express";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import jwt from 'jsonwebtoken';
import { TempTokenData } from "../types";

export const InitialRequestValidation = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.tempToken;

            if (!token) {
                return res.status(RESPONSE_STATUS.FORBIDDEN).json({ msg: 'User must log in first!' });
            }

            const decoded = jwt.verify(token, process.env.TEMP_TOKEN_SECRET) as TempTokenData;

            if (!decoded) {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).json({ msg: 'Please login again!' });
            }

            req.userId = decoded.id

            next();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).send({ msg: 'Token has expired, please refresh your token' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(RESPONSE_STATUS.UNAUTHENTICATED).send({ msg: 'Please login again!' });
            } else {
                console.error(error);
                return res.status(RESPONSE_STATUS.INTERNAL_SERVER_ERROR).send({ msg: 'Internal server error' });
            }
        }
    };
};
