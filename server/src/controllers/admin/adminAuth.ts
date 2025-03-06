import { Body, Controller, Get, Post, Req, Res, UseAfter, UseBefore } from "routing-controllers";
import { Inject, Service } from "typedi";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";

import { Response, Request } from "express"
import { AdminLoginRequest, AdminRegisterRequest, AdminRoles } from "../../admin-types";
import { AdminAuthSerivce } from "../../services/admin/AdminAuthService";
import { validate } from "../../middleware/validate";
import { adminLoginSchema, adminSignupSchema } from "../../validation/admin/adminAuthValidation";
import { AdminAuthWithRoleMiddleware } from "../../middleware/admin/adminAuthWithRoleMiddleware";
import { APIError } from "../../utils/APIError";
import { AdminLogsService } from "../../services/admin/AdminLogsService";


@Controller('/admin-auth')
@Service()
export class AdminAuthController {
    constructor(
        @Inject()
        private readonly adminAuthService: AdminAuthSerivce,
        @Inject()
        private readonly adminLogService: AdminLogsService
    ) { }

    @Post('/login')
    @UseBefore(validate(adminLoginSchema))
    async login(
        @Res() res: Response,
        @Body() body: AdminLoginRequest
    ) {
        const { admin, accessToken, refreshToken } = await this.adminAuthService.login(body)
        // Set the refresh token as a secure HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Set to true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none for cross-site cookies
            maxAge: 7 * 24 * 60 * 60 * 1000,  // Expires in 7 days
        });

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Logged in successfully!",
            data: {
                accessToken,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            }
        })
    }

    @Post('/create')
    @UseBefore(validate(adminSignupSchema))
    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN]))
    async create(
        @Res() res: Response,
        @Body() body: AdminRegisterRequest,
        @Req() req: Request
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        await this.adminLogService.create(req.admin.id, 'User Creation', 'POST', JSON.stringify(body))

        await this.adminAuthService.register(body)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully addded!"
        })

    }

    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN || AdminRoles.EDITOR || AdminRoles.VIEWER]))
    @Get('/current-user')
    async getCurrentUser(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const admin = req.admin
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Admin data fetched successfully!",
            data: {
                admin
            }
        })
    }

    @Post('/generate-access-token')
    async generateAccesToken(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(RESPONSE_STATUS.UNAUTHENTICATED).json({ message: 'No refresh token provided' });
        }

        const accessToken = await this.adminAuthService.refreshToken(refreshToken)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Access token generated successfully!",
            data: {
                accessToken
            }
        })
    }

    @UseBefore(AdminAuthWithRoleMiddleware([AdminRoles.ADMIN || AdminRoles.EDITOR || AdminRoles.VIEWER]))
    @Get('/logout')
    async logout(
        @Req() req: Request,
        @Res() res: Response
    ) {
        if (!req.admin) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
        const admin = req.admin
        await this.adminAuthService.logout(admin.id)
        res.clearCookie('refreshToken')
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Logout successfully!"
        })
    }
}