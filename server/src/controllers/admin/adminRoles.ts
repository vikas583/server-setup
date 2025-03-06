import { Controller, Get, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminRoleService } from "../../services/admin/AdminRoleService";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { AdminRoles } from "../../admin-types";
import { Response } from "express"

@Service()
@Controller('/admin/roles')
export class AdminRolesController {

    constructor(
        @Inject()
        private readonly adminRoleService: AdminRoleService
    ) { }

    @Get('/')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async getRoles(
        @Res() res: Response
    ) {
        const roles = await this.adminRoleService.getRoles()

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "List fetched successfully!",
            data: {
                roles
            }
        })

    }
}