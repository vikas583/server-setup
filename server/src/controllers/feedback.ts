import { Authorized, Body, Controller, CurrentUser, Get, Param, Params, Post, Res, UseBefore } from "routing-controllers";
import { Response } from 'express'
import { FeedbackCaptureRequest, FeedbackFormType, UserAccountView, UserRoles } from "../types";
import { Inject, Service } from "typedi";
import { FeedbackService } from "../services/feedbackService";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { validate } from "../middleware/validate";
import { feedbackCaptureRequestSchema } from "../validation/feedbackValidation";

@Controller('/feedback')
@Service()
export class FeedbackController {

    constructor(
        @Inject()
        private readonly feedbackService: FeedbackService
    ) { }


    @Get('/questions/:type')
    @Authorized([UserRoles.account_owner || UserRoles.project_owner || UserRoles.contributor])
    async list(
        @Params({ required: true })
        { type }: { type: FeedbackFormType },
        @Res()
        res: Response
    ) {
        const feedbackFormQuestions = await this.feedbackService.feedbackQuestionsList(type)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Feedback questions fetched successfully!",
            data: feedbackFormQuestions
        })
    }

    @Post('/capture')
    @Authorized([UserRoles.account_owner || UserRoles.project_owner || UserRoles.contributor])
    @UseBefore(validate(feedbackCaptureRequestSchema))
    async capture(
        @Body()
        body: FeedbackCaptureRequest,
        @CurrentUser()
        user: UserAccountView,
        @Res()
        res: Response
    ) {
        await this.feedbackService.captureFeedback(body, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Thanks for sharing your valuable feedback!!!"
        })
    }
}