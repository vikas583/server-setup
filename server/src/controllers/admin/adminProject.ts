import {
    Controller,
    Get,
    Params,
    UseBefore,
    Req,
    Res,
    QueryParams
} from "routing-controllers";
import { SkipLimitURLParams } from "../../admin-types";
import { AdminRoles } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { Response, Request } from "express"
import { Inject, Service } from "typedi";
import { AdminProjectService } from "../../services/admin/AdminProjectService";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { APIError } from "../../utils/APIError";

@Controller("/admin/project")
@Service()
export class AdminProjectController {

    constructor(
        @Inject()
        private readonly adminProjectService: AdminProjectService
    ) {

    }

    @Get("/list/:skip/:limit")
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async list(
        @Res()
        res: Response,
        @Req()
        req: Request,
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParams,
        @QueryParams()
        { accountId, searchStr }: { accountId: number, searchStr?: string }
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        const { total, projects } = await this.adminProjectService.list(+skip, +limit, +accountId, searchStr);
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Projects fetched successfully",
            data: { total, projects }
        });
    }
}
