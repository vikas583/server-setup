import { Controller, Get, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { AdminRoles } from "../../admin-types";
import { AdminCustomerRoleService } from "../../services/admin/AdminCustomerRoleService";
import { Response } from "express"
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";

@Service()
@Controller('/admin/customers/roles')
export class AdminCustomerRoles {
    constructor(
        @Inject()
        private readonly adminCustomerRolesService: AdminCustomerRoleService
    ) { }

    @Get('/')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async getRoles(
        @Res() res: Response
    ) {
        const roles = await this.adminCustomerRolesService.getRoles()

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "List fetched successfully!",
            data: {
                roles
            }
        })

    }
}