import { Controller, Get, Params, Post, QueryParam, Req, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";

import { AdminService } from "../../services/admin/AdminService";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { Response } from "express"
import { AdminRoles, SkipLimitURLParams } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";

@Controller('/admin')
@Service()

export class AdminController {

    constructor(
        @Inject()
        private readonly adminSerivce: AdminService
    ) { }



    @Get('/list/:skip/:limit')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN, AdminRoles.EDITOR, AdminRoles.VIEWER]))
    async adminList(
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParams,
        @Res() res: Response,
        @QueryParam('name') name?: string
    ) {
        const data = await this.adminSerivce.list(skip, limit, name)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'List fetched successfully!',
            data
        })
    }


}