import { Authorized, Controller, CurrentUser, Get, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import { RoleService } from "../services/RoleService";
import { UserAccountView, UserRoles } from "../types";
import { Response } from "express";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";

@Controller('/roles')
@Service()
export class RolesController {

    constructor(
        @Inject()
        private readonly roleService: RoleService
    ) {

    }

    @Get('/list')
    @Authorized([UserRoles.account_owner])
    async list(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Res() res: Response,
    ) {
        const roles = await this.roleService.getRoles()

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Fetched successfully!!",
            data: roles
        })
    }
}