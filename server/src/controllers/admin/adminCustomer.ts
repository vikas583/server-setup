import { Body, Controller, Delete, Get, Params, Patch, Post, QueryParam, Req, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminRoles, BlockCustomerRequest, SkipLimitURLParams } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { Response, Request } from "express"
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { AdminCustomerService } from "../../services/admin/AdminCustomerService";
import { AddCustomerRequest } from "../../types";
import { AdminLogsService } from "../../services/admin/AdminLogsService";
import { APIError } from "../../utils/APIError";


@Service()
@Controller('/admin/customer')
export class AdminCustomerController {
    constructor(

        @Inject()
        private readonly adminCustomerService: AdminCustomerService,
        @Inject()
        private readonly adminLogService: AdminLogsService
    ) { }

    @Get('/list/:skip/:limit')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async customerList(
        @Params({ validate: true }) { skip, limit }: SkipLimitURLParams,
        @Res() res: Response,
        @QueryParam('searchStr') searchStr?: string,
        @QueryParam('accountId') accountId?: string
    ) {

        const { total, customers } = await this.adminCustomerService.customerList(skip, limit, Number(accountId), searchStr)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'User fetched succesfully!',
            data: {
                total,
                customers
            }
        })

    }

    @Post('/create')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async addCustomer(
        @Body()
        body: AddCustomerRequest,
        @Res()
        res: Response,
        @Req()
        req: Request
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        await this.adminLogService.create(req.admin.id, 'User Creation', 'POST', JSON.stringify(body))

        await this.adminCustomerService.create(body, req.admin.id)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully created!"
        })
    }

    @Patch('/block')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async blockUnblockUser(
        @Body()
        body: BlockCustomerRequest,
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        await this.adminLogService.create(req.admin.id, `User ${body.isBlocked ? 'Block' : 'Un-Block'}`, 'PATCH', JSON.stringify(body))

        await this.adminCustomerService.blockUnblockUser(body.userId, body.isBlocked)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully updated!"
        })
    }

    @Delete('/delete/:userId')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async deleteUser(
        @Params()
        { userId }: { userId: number },
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        await this.adminLogService.create(req.admin.id, `User Delete`, 'DELETE', JSON.stringify({ userId }))

        await this.adminCustomerService.deleteUser(userId)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Deleted successfully!'
        })
    }

    @Get('/resend-welcome-email/:customerId')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async resendWelcomeEmail(
        @Params()
        { customerId }: { customerId: number },
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {

        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        await this.adminLogService.create(req.admin.id, `Resend Welcome Email`, 'GET', JSON.stringify({ customerId }))

        await this.adminCustomerService.resendWelcomeEmail(customerId)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Welcome email sent successfully!'
        })
    }
}
