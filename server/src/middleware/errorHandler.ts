import {
    Middleware,
    ExpressErrorMiddlewareInterface,
    HttpError,
} from "routing-controllers";
import { Request, Response } from "express";
import logger from "../utils/logger";
import { APIError } from "../utils/APIError";
import { Service } from 'typedi';
import { RESPONSE_STATUS } from "../utils/ResponseStatus";

@Middleware({ type: "after" })
@Service()
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
    error(
        error: any,
        request: Request,
        response: Response
        // next: (err: any) => any
    ) {
        logger.error(
            `${error.status || 500} - ${error.message} - ${request.originalUrl} - ${request.method
            } - ${request.ip}`
        );
        logger.error(`Error: `, error);
        logger.error("Body: ", JSON.stringify(request.body));
        if (error instanceof APIError) {
            response.status(error.httpCode).json(error.toJSON());
        } else if (error instanceof HttpError) {
            response.status(error.httpCode).json({
                status: error.httpCode,
                msg: "Something went wrong",
            });
        } else {
            response.status(RESPONSE_STATUS.INTERNAL_SERVER_ERROR).json({
                status: false,
                msg: "Something went wrong",
            });
        }
        // next(error);
    }
}
