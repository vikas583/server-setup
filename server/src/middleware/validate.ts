import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { RESPONSE_STATUS } from '../utils/ResponseStatus';

export function validate(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(RESPONSE_STATUS.BAD_REQUEST).send(error.details);
        }
        next();
    };
}
