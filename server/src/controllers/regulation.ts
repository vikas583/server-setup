import { Authorized, Controller, CurrentUser, Get, Params, QueryParam, Res } from "routing-controllers";
import { Inject, Service } from "typedi";
import { UserAccountView, UserRoles } from "../types";
import { Response } from 'express'
import { RegulationService } from "../services/RegulationService";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { SkipLimitURLParamsUser } from "../types";

@Controller('/regulations')
@Service()
export class RegulationController {

    constructor(
        @Inject()
        private readonly regulationService: RegulationService
    ) { }

    @Get('/list/:skip/:limit')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async list(
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParamsUser,
        @Res() res: Response,
        @QueryParam('query') query?: string
    ) {
        const { total, regulations } = await this.regulationService.list(+skip, +limit, query)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Regulations fetched successfully!',
            data: { total, regulations }
        })

    }


    @Get('/verification/list')
    @Authorized([UserRoles.account_owner])
    async regulationVerificationList(
        @CurrentUser()
        user: UserAccountView,
        @Res() res: Response
    ) {
        const regulations = await this.regulationService.requiredVerificationList(user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!",
            data: regulations
        })
    }
}
