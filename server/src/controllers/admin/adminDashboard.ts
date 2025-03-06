import { Controller, Get, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminDashboardService } from "../../services/admin/AdminDashboardService";
import { Response } from "express";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { AdminRoles } from "../../admin-types";

@Controller('/admin/dashboard')
@Service()

export class AdminDashboardController {
    constructor(
        @Inject()
        private readonly adminDashboardService: AdminDashboardService
    ) { }

    @Get('/card')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async dashboardCardData(
        @Res() res: Response
    ) {
        const data = await this.adminDashboardService.dashboardCardCount()
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Data fetched successfully!",
            data
        })
    }
}