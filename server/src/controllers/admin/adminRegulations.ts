import { Body, Controller, Get, Params, Post, QueryParam, Req, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminRoles, RegulationCreateRequest, RegulationDetailCreateRequest, SkipLimitURLParams } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { Response, Request } from "express"
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { AdminLogsService } from "../../services/admin/AdminLogsService";
import { AdminRegulationService } from "../../services/admin/AdminRegulationService";
import { validate } from "../../middleware/validate";
import { adminRegualtionCreate, regulationDetailCreate } from "../../validation/admin/adminRegulationValidation";
import { AdminRegulationDetailService } from "../../services/admin/AdminRegulationDetailService";

@Controller('/admin/regulation')
@Service()
export class AdminRegulationsController {

    constructor(
        @Inject()
        private readonly adminLogService: AdminLogsService,
        @Inject()
        private readonly adminRegulationService: AdminRegulationService,
        @Inject()
        private readonly adminRegulationDetailService: AdminRegulationDetailService
    ) {

    }

    @Get('/list/:skip/:limit')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async list(
        @Res()
        res: Response,
        @Req()
        req: Request,
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParams,
        @QueryParam('searchStr') searchStr?: string,
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        const { total, regulations } = await this.adminRegulationService.list(+skip, +limit, searchStr)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Regulations fetched succesfully!',
            data: {
                total,
                regulations
            }
        })
    }

    @Get('/detail/:skip/:limit')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async detail(
        @Req()
        req: Request,
        @Res()
        res: Response,
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParams,
        @QueryParam('searchStr') searchStr?: string,
        @QueryParam('regulationId') regulationId?: string,

    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        const { total, regulationdetails } = await this.adminRegulationDetailService.list(+skip, +limit, searchStr, regulationId)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Regulations fetched succesfully!',
            data: {
                total,
                regulationdetails
            }
        })

    }

    @Post('/create')
    @UseBefore(validate(adminRegualtionCreate))
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async create(
        @Res()
        res: Response,
        @Req()
        req: Request,
        @Body()
        body: RegulationCreateRequest
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        await this.adminLogService.create(req.admin.id, 'Regulation Create', 'POST', JSON.stringify(body))

        await this.adminRegulationService.create(body, req.admin.id)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully created!"
        })
    }

    @Post('/detail/create')
    @UseBefore(validate(regulationDetailCreate))
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async createDetail(
        @Body()
        body: RegulationDetailCreateRequest,
        @Req()
        req: Request,
        @Res()
        res: Response,
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        await this.adminLogService.create(req.admin.id, "Regulation Detail Create", 'POST', JSON.stringify(body))

        await this.adminRegulationDetailService.create(body)
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully created"
        })
    }

}