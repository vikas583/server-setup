import { Body, Controller, Get, Post, Req, Res, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { AdminFeedbackFormQuestionRequest, AdminFeedbackFormRequest, AdminRoles } from "../../admin-types";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { AdminFeedbackService } from "../../services/admin/adminFeedbackService";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { Response } from "express"

@Controller('/admin/feedback')
@Service()
export class AdminFeedbackController {

    constructor(
        @Inject()
        private readonly adminFeedbackService: AdminFeedbackService
    ) { }

    @Post('/create/form')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async createForm(
        @Body()
        body: AdminFeedbackFormRequest,
        @Res()
        res: Response
    ) {
        await this.adminFeedbackService.createForm(body)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            stauts: true,
            msg: "Created successfully!"
        })
    }

    @Post('/create/questions')
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async createQuestions(
        @Body()
        body: AdminFeedbackFormQuestionRequest,
        @Res()
        res: Response
    ) {
        await this.adminFeedbackService.addQuestionsToForm(body)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            stauts: true,
            msg: "Created successfully!"
        })
    }

    @Get('/user/list')
    async listUserFeedback() {

    }

}