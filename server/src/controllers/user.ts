import {
    Authorized,
    Body,
    Controller,
    CurrentUser,
    Delete,
    Get,
    Params,
    Patch,
    Post,
    QueryParams,
    Req,
    Res,
    UploadedFile,
    UseBefore,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import {
    CreateUserRequest,
    InitialSetPasswordRequest,
    InitialUserUpdateRequest,
    ResetPasswordRequestLoggedInUser,
    UpdateUserDetails,
    UserAccountView,
    UserInitialSteps,
    UserRoles,
} from "../types";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { UserService } from "../services/UserService";
import { InitialRequestValidation } from "../middleware/mfaRequestValidation";
import { Request, Response } from "express";
import { APIError } from "../utils/APIError";
import { TotpService } from "../services/TotpService";
import { validate } from "../middleware/validate";
import { initialSetupMFAValidationSchema, initialSetupPasswordValidationSchema, initialUserUpdateSchema, userCreationSchema, userUpdateSchema } from "../validation/userValidation";
import { AccountService } from "../services/AccountService";
import multer from "multer";
import path from "path";
import { replaceBlobUrl } from "../utils/replaceBlobUrl";


@Service()
@Controller("/user")
export class UserController {
    constructor(
        @Inject()
        private readonly userService: UserService,
        @Inject()
        private readonly totpService: TotpService,
        @Inject()
        private readonly accountService: AccountService
    ) { }

    /**
     * get list of active user that will be used by ACCOUNT OWNER for adding contributors.
     *
     */
    @Post("/create")
    @Authorized([UserRoles.account_owner])
    @UseBefore(validate(userCreationSchema))
    async create(
        @Body() body: CreateUserRequest,
        @CurrentUser({ required: true }) user: UserAccountView,
        @Res() res: Response
    ) {
        await this.userService.create(body, user);

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "successfully created!",
        });
    }

    @Get("/active")
    @Authorized([UserRoles.account_owner])
    async getActiveUser(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Res() res: Response
    ) {
        const users = await this.userService.getActiveAccountUser(
            user.accountId,
            user.id
        );

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Users fetched successfully!",
            data: users,
        });
    }

    // Step 2 of user creation - mandatory for all types of user roles
    @Patch("/info/update")
    @UseBefore(InitialRequestValidation())
    @UseBefore(validate(initialUserUpdateSchema))
    async initialUpdate(
        @Body()
        body: InitialUserUpdateRequest,
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError(
                "Something went wrong, try again later!",
                RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const userDetails = await this.userService.getUserDetails(req.userId);
        if (!userDetails) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }

        // if (userDetails.isUserInfoCompleted) {
        //     let nextStep = null;
        //     if (
        //         !userDetails.isBillingInfoCompleted && userDetails.userRole === UserRoles.account_owner && userDetails.isPrimaryAccountOwner
        //     )
        //         nextStep = UserInitialSteps.UPDATE_BILLING_DETAILS;
        //     else if (!userDetails.isPasswordResetCompleted)
        //         nextStep = UserInitialSteps.SETUP_PASSWORD;
        //     else if (!userDetails.isMFAStepCompleted)
        //         nextStep = UserInitialSteps.SETUP_MFA;
        //     else nextStep = UserInitialSteps.ENTER_MFA;

        //     return res.status(RESPONSE_STATUS.SUCCESS).send({
        //         status: true,
        //         msg: "User info already updated!!",
        //         nextStep,
        //     });
        // }

        await this.userService.initialUpdateUser(body, userDetails);

        const user = await this.userService.getUserDetails(req.userId);

        if (!user) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }

        let nextStep = null;
        if (!user.isBillingInfoCompleted && user.userRole === UserRoles.account_owner && user.isPrimaryAccountOwner)
            nextStep = UserInitialSteps.UPDATE_BILLING_DETAILS;
        else if (!user.isMFAStepCompleted) nextStep = UserInitialSteps.SETUP_MFA;
        else if (!userDetails.isPasswordResetCompleted) nextStep = UserInitialSteps.SETUP_PASSWORD;
        else nextStep = UserInitialSteps.ENTER_MFA;

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "updated successfully!",
            nextStep,
        });
    }

    @Get("/list")
    @Authorized([UserRoles.account_owner])
    async list(@CurrentUser() user: UserAccountView, @Res() res: Response) {
        const users = await this.userService.list(user);

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!",
            data: users,
        });
    }

    @Patch("/set/password")
    @UseBefore(InitialRequestValidation())
    @UseBefore(validate(initialSetupPasswordValidationSchema))
    async setInitialPassword(
        @Body()
        body: InitialSetPasswordRequest,
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError(
                "Something went wrong, try again later!",
                RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const user = await this.userService.getUserDetails(req.userId);
        if (!user) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }

        let nextStep = null;
        let msg = null;
        if (!user.isUserInfoCompleted) {
            nextStep = UserInitialSteps.UPDATE_USER_INITIALS;
            msg = "User info not updated!!"
        } else if (!user.isBillingInfoCompleted && user.userRole === UserRoles.account_owner && user.isPrimaryAccountOwner) {

            nextStep = UserInitialSteps.UPDATE_BILLING_DETAILS;
            msg = "Billing info not updated!!"
        } else if (!user.isMFAStepCompleted) {
            nextStep = UserInitialSteps.SETUP_MFA;
            msg = "MFA not setup!!"
        }


        if (nextStep && msg) {
            return res.status(RESPONSE_STATUS.BAD_REQUEST).send({
                status: false,
                msg,
                nextStep,
            });
        }

        if (user.isPasswordResetCompleted) {
            let nextStep = null;
            if (!user.isMFAStepCompleted) nextStep = UserInitialSteps.SETUP_MFA;
            else nextStep = UserInitialSteps.ENTER_MFA;
            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "User password already updated!!",
                nextStep,
            });
        }

        await this.userService.updatePassword(body, user);

        // const userDetails = await this.userService.getUserDetails(req.userId);


        const userInfo =
            await this.userService.authenticateUser(user.id);

        res.clearCookie("tempToken");
        res.cookie("refreshToken", userInfo.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-site cookies
            maxAge: 60 * 60 * 1000, // Expires in 7 days
        });

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Login successfully",
            data: {
                nextStep: UserInitialSteps.SETUP_DONE,
                token: userInfo.accessToken,
                user: {
                    id: user.id,
                    name: user.firstName + " " + user.lastName,
                    email: user.email,
                    role: user.userRole,
                },
            },
        });

    }

    @Get("/mfa/setup")
    @UseBefore(InitialRequestValidation())
    async mfaSetupDetails(
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError(
                "Something went wrong, try again later!",
                RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const user = await this.userService.getUserDetails(req.userId);
        if (!user) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }

        let nextStep = null;
        let msg = null;
        if (!user.isUserInfoCompleted) {
            nextStep = UserInitialSteps.UPDATE_USER_INITIALS;
            msg = "User info not updated!!"
        } else if (!user.isBillingInfoCompleted && user.userRole === UserRoles.account_owner && user.isPrimaryAccountOwner) {

            nextStep = UserInitialSteps.UPDATE_BILLING_DETAILS;
            msg = "Billing info not updated!!"
        }


        if (nextStep && msg) {
            return res.status(RESPONSE_STATUS.BAD_REQUEST).send({
                status: false,
                msg,
                nextStep,
            });
        }


        if (user.isMFAStepCompleted) {
            let nextStep = UserInitialSteps.ENTER_MFA;
            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "MFA Already setup!!",
                nextStep,
            });
        }

        const data = await this.totpService.generateTotp(user.id, user.email);
        if (data) {
            // const updateMfaSetupStatus =
            //     await this.userService.AfterMFASecretGenerated(req.userId);
            // if (updateMfaSetupStatus) {
            let nextStep = UserInitialSteps.ENTER_MFA;

            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "MFA QR code fetched successfully!",
                nextStep,
                data: data,
            });
            // }
        }
        throw new APIError(
            "Something went wrong, try again later!",
            RESPONSE_STATUS.INTERNAL_SERVER_ERROR
        );
    }

    @Post("/mfa/validate")
    @UseBefore(InitialRequestValidation())
    @UseBefore(validate(initialSetupMFAValidationSchema))
    async validateMFA(
        @Body()
        body: { token: string },
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError(
                "Something went wrong, try again later!",
                RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            );
        }
        const { token } = body;

        const userDetails = await this.userService.getUserDetails(req.userId);
        if (!userDetails) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }
        // console.log("userDetails", userDetails)

        const validateMfa = await this.totpService.verifyTotp(
            userDetails.id,
            token
        );

        if (!validateMfa.valid) {
            throw new APIError("Invalid code!", RESPONSE_STATUS.SUCCESS);
        }

        const { accessToken, refreshToken, user } =
            await this.userService.authenticateUser(userDetails.id);

        res.clearCookie("tempToken");
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-site cookies
            maxAge: 60 * 60 * 1000, // Expires in 7 days
        });

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Login successfully",
            data: {
                nextStep: UserInitialSteps.OPEN_DASHBOARD,
                token: accessToken,
                user: {
                    id: user.id,
                    name: user.firstName + " " + user.lastName,
                    email: user.email,
                    role: user.userRole,
                },
            },
        });
    }

    @Post("/mfa/initial/setup/validate")
    @UseBefore(InitialRequestValidation())
    @UseBefore(validate(initialSetupMFAValidationSchema))
    async validateInitialSetupMFA(
        @Body()
        body: { token: string },
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError(
                "Something went wrong, try again later!",
                RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            );
        }
        const { token } = body;

        const userDetails = await this.userService.getUserDetails(req.userId);
        if (!userDetails) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }
        // console.log("userDetails", userDetails)

        const validateMfa = await this.totpService.verifyTotp(
            userDetails.id,
            token
        );

        if (!validateMfa.valid) {
            throw new APIError("Invalid code!", RESPONSE_STATUS.SUCCESS);
        }

        const { user } = await this.userService.stepAfterInitialSetupMFAValidation(userDetails.id)



        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Validated successfully",
            nextStep: user.isPasswordResetCompleted ? UserInitialSteps.SETUP_DONE : UserInitialSteps.SETUP_PASSWORD,

        });
    }

    @Get("/info")
    @UseBefore(InitialRequestValidation())
    async initialUserInfo(
        @Req()
        req: Request,
        @Res()
        res: Response
    ) {
        if (!req.userId) {
            throw new APIError(
                "Something went wrong, try again later!",
                RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const userDetails = await this.userService.getUserDetails(req.userId);
        if (!userDetails) {
            throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
        }

        const userInfo = {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            position: userDetails.position,
            email: userDetails.email,
        };
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Fetched successfully!",
            data: userInfo,
        });
    }

    @Get('/details')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner, UserRoles.contributor])
    async details(
        @Res() res: Response,
        @CurrentUser() user: UserAccountView
    ) {
        const accountDetails = await this.accountService.billingInfo(user.accountId)

        const details = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.userRole,
            companyName: accountDetails.companyName,
            profilePicUrl: user.profilePicUrl ? replaceBlobUrl(user.shortCode, user.profilePicUrl) : user.profilePicUrl
        }
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "fetched successfully!",
            data: details
        })

    }

    @Patch('/update/profile/pic')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner, UserRoles.contributor])
    async updateProfilePic(
        @Res() res: Response,
        @CurrentUser() user: UserAccountView,
        @QueryParams({ required: false })
        { removeProfilePic }: { removeProfilePic: boolean },
        @UploadedFile('file', {
            options: {
                storage: multer.diskStorage({
                    destination: path.join(__dirname, '../../public/assets'),
                    filename: (_, file, cb) => {
                        cb(
                            null,
                            `${Date.now()}_${file.originalname
                                .replace(/[^a-zA-Z0-9\.]/g, '')
                                .replace(/\s+/g, '_')}`
                        );
                    },
                }),
                fileFilter: async (_req: any, file: any, cb: any) => {
                    if (
                        !['image/jpg', 'image/jpeg', 'image/png'].includes(
                            file.mimetype
                        )
                    ) {
                        return cb(new APIError('Only jpg, png & jpeg file is allowed', 400));
                    }
                    return cb(null, true);
                },
                limits: {
                    files: 10,
                    fieldNameSize: 255,
                    fileSize: 20 * 1024 * 1024, // 20MB
                    fieldSize: Infinity,
                },
            },
            required: false,
        })
        file?: any
    ) {
        if (removeProfilePic) {

            await this.userService.removeProfilePic(user)

            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "Profile pic updated successfully!"
            })
        } else {

            if (!file) {
                return new APIError('File is required.', RESPONSE_STATUS.BAD_REQUEST);
            }
            console.log("File upload on local storage!")

            await this.userService.updateProfilePic(user, file)

            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "Profile pic updated successfully!"
            })
        }

    }

    @Patch('/update/details')
    @Authorized([UserRoles.account_owner])
    @UseBefore(validate(userUpdateSchema))
    async updateDetails(
        @Body()
        body: UpdateUserDetails,
        @Res()
        res: Response,
        @CurrentUser()
        user: UserAccountView
    ) {
        await this.userService.update(body, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Update Successfully!"
        })
    }

    @Get("/details/:userId")
    @Authorized([UserRoles.account_owner])
    async getUserDetails(
        @Params({ required: true })
        { userId }: { userId: number },
        @Res()
        res: Response
    ) {
        const userDetails = await this.userService.getUserDetails(userId)

        const data = {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            email: userDetails.email,
            userRole: userDetails.userRole
        }

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!!",
            data
        })
    }

    @Delete("/delete/:userId")
    @Authorized([UserRoles.account_owner])
    async removeUser(
        @Res()
        res: Response,
        @Params({ required: true })
        { userId }: { userId: number },
        @CurrentUser()
        user: UserAccountView
    ) {
        await this.userService.removeUser(userId, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully updated!"
        })
    }

    @Patch("/update/password")
    @Authorized([UserRoles.account_owner, UserRoles.project_owner, UserRoles.contributor])
    async updatePassword(
        @Res()
        res: Response,
        @Body()
        body: ResetPasswordRequestLoggedInUser,
        @CurrentUser()
        user: UserAccountView
    ) {
        await this.userService.resetPasswordLoggedIn(body, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully updated!"
        })
    }
}
