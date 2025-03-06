import { Controller, Get, Params, QueryParam, QueryParams, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { AdminAuditService } from "../../services/admin/AdminAuditService";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { Request } from "express";
import { AdminRoles } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import logger from "../../utils/logger";


@Controller('/admin/audits')
@Service()
export class AdminAuditsController {

    constructor(
        private readonly adminAuditService: AdminAuditService
    ) {
    }

    @Get('/list/:skip/:limit')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async getAudits(
        @Params()
        { skip, limit }: { skip: number, limit: number },
        @Req()
        req: Request,
        @QueryParams()
        { searchStr, accountId, projectId }: { searchStr: string, accountId: number, projectId: number }
    ) {
        logger.info(projectId)
        if (!accountId) {
            throw new APIError('Account ID is required', RESPONSE_STATUS.BAD_REQUEST);
        }

        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        const { total, auditDocuments } = await this.adminAuditService.list(skip, limit, accountId, projectId, searchStr)
        return {
            status: true,
            msg: "Audits fetched successfully",
            data: { total, auditDocuments }
        }
    }
}