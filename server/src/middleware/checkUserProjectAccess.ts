import { NextFunction, Request, Response } from "express";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import logger from "../utils/logger";


export const CheckUserProjectAccess = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            logger.info('testing==========')
            console.log(req.user)
            logger.info('testing++++++++++')

            next()
        } catch (error) {
            console.error("Error checking project access:", error);
            res.status(RESPONSE_STATUS.INTERNAL_SERVER_ERROR).send({
                status: false,
                message: "Something went wrong, try again later!."
            });
        }
    }
}