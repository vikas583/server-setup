import { Authorized, Controller, Get, Params, QueryParam, QueryParams, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import { RegulationDetailService } from "../services/RegulationDetailService";

import { ParamRegulationDetailList, SkipLimitURLParamsUser, UserRoles } from "../types";
import { Response } from 'express'
import { RESPONSE_STATUS } from "../utils/ResponseStatus";

@Controller('/regulation/details')
@Service()
export class RegulationDetailController {

    constructor(
        @Inject()
        private readonly regulationDetailService: RegulationDetailService
    ) { }

    @Get('/list')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async list(
        @Res()
        res: Response,
        @QueryParams()
        { regulationId, query }: ParamRegulationDetailList
    ) {

        const { regulationDetails } = await this.regulationDetailService.list(Number(regulationId), query)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Regulation details fetched successfully!',
            data: { regulationDetails }
        })
    }


}