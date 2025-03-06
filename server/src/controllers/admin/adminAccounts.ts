import { Body, Controller, Get, Params, Patch, Post, QueryParam, Req, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminRoles, SkipLimitURLParams, CreateAccountRequest } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { UpdateAccountStatusRequest } from "../../types";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { adminAccountCreation } from "../../validation/admin/adminCustomerValidation";
import { AdminAccountService } from "../../services/admin/AdminAccountService";
import { validate } from "../../middleware/validate";
import { Request, Response } from "express";
import { AdminLogsService } from "../../services/admin/AdminLogsService";
import logger from "../../utils/logger";

@Controller('/admin/account')
@Service()

export class AdminAccountsController {
    constructor(
        @Inject()
        private readonly adminAccountService: AdminAccountService,
        @Inject()
        private readonly adminLogService: AdminLogsService
    ) { }

    @Get('/list/:skip/:limit')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async list(
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParams,
        @Req() req: Request,
        @Res() res: Response,
        @QueryParam('searchStr') searchStr?: string
    ) {

        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        logger.info(`Admin account list request received with searchStr: ${searchStr}`)
        const data = await this.adminAccountService.accountList(skip, limit, searchStr)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'List fetched successfully!',
            data
        })
    }

    @Post('/create')
    @UseBefore(validate(adminAccountCreation))
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async createAccount(
        @Body() body: CreateAccountRequest,
        @Req() req: Request,
        @Res() res: Response
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        await this.adminLogService.create(req.admin.id, 'Account Creation', 'POST', JSON.stringify(body))
        await this.adminAccountService.accountCreate(body)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Account Created Successfully!"
        })
    }

    @Patch('/status')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async activateDeactivateAccount(
        @Body()
        body: UpdateAccountStatusRequest,
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        await this.adminLogService.create(req.admin.id, `ACCOUNT ${body.isActive ? 'ACTIVATE' : 'DEACTIVATE'}`, 'PATCH', JSON.stringify(body))

        await this.adminAccountService.activeDeactiveAccount(body)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Account status updated successfull!'
        })

    }
}