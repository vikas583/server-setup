import {
    Authorized,
    Body,
    Controller,
    CurrentUser,
    Get,
    Patch,
    Req,
    Res,
    UseBefore
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { InitialRequestValidation } from "../middleware/mfaRequestValidation";
import { InitialBillingInfoUpdateRequest, UserRoles, UserInitialSteps, UserAccountView } from "../types";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { AccountService } from "../services/AccountService";
import { validate } from "../middleware/validate";
import { initialBillingInfoUpdateSchema } from "../validation/accountValidation";


@Service()
@Controller('/account')
export class AccountController {

    constructor(
        @Inject()
        private readonly userService: UserService,
        @Inject()
        private readonly accountService: AccountService
    ) { }


    @Patch('/billing/update')
    @UseBefore(InitialRequestValidation())
    @UseBefore(validate(initialBillingInfoUpdateSchema))
    async billingInfoUpdate(
        @Body()
        body: InitialBillingInfoUpdateRequest,
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        const user = await this.userService.getUserDetails(req.userId)
        if (!user) {
            throw new APIError('User not found!', RESPONSE_STATUS.BAD_REQUEST)
        }

        if (user.userRole !== UserRoles.account_owner) {
            throw new APIError('Billing info can only be updated by Account Owner!',)
        }

        if (!user.isPrimaryAccountOwner) {
            throw new APIError('Billing info can only be updated by Primary Account Owner!',)
        }

        if (user.isBillingInfoCompleted) {
            let nextStep = null
            if (!user.isMFAStepCompleted) nextStep = UserInitialSteps.SETUP_MFA
            else if (!user.isPasswordResetCompleted) nextStep = UserInitialSteps.SETUP_PASSWORD
            else nextStep = UserInitialSteps.ENTER_MFA
            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: 'Account billing info already updated!!',
                nextStep,
            })
        }

        await this.accountService.updateBillingInfo(body, user)

        const userDetails = await this.userService.getUserDetails(req.userId)

        if (!userDetails) {
            throw new APIError('User not found!', RESPONSE_STATUS.BAD_REQUEST)
        }

        let nextStep = null
        if (!userDetails.isMFAStepCompleted) nextStep = UserInitialSteps.SETUP_MFA
        else if (!userDetails.isPasswordResetCompleted) nextStep = UserInitialSteps.SETUP_PASSWORD
        else nextStep = UserInitialSteps.ENTER_MFA

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'updated successfully!',
            nextStep,
        })
    }

    @Get('/billing/info')
    @UseBefore(InitialRequestValidation())
    async accountInfo(
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

        const user = await this.userService.getUserDetails(req.userId)
        if (!user) {
            throw new APIError('User not found!', RESPONSE_STATUS.BAD_REQUEST)
        }
        if (user.userRole !== UserRoles.account_owner) {
            throw new APIError('Billing info can only be updated by Account Owner!',)
        }

        const account = await this.accountService.billingInfo(user.accountId)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!",
            data: account
        })
    }

    @Get('/billing/details')
    @Authorized([UserRoles.account_owner])
    async info(
        @CurrentUser() user: UserAccountView,

        @Res()
        res: Response
    ) {

        if (user.userRole !== UserRoles.account_owner) {
            throw new APIError('Billing info can only be updated by Account Owner!',)
        }

        const account = await this.accountService.billingInfo(user.accountId)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!",
            data: account
        })
    }

}