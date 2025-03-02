import { Body, Controller, Post, Res } from "routing-controllers";
import { LoginRequest } from "../types";
import { Inject, Service } from "typedi";
import { Response } from "express";
import AuthService from "../services/AuthService";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";


@Controller('/auth')
@Service()
export class AuthController {

    constructor(
        @Inject()
        private readonly authService: AuthService,
    ) {

    }


    @Post('/login')
    async login(@Body() { email, password }: LoginRequest, @Res() res: Response) {
        const user = await this.authService.validateCredentials({
            email,
            password,
        });
        if (!user) {
            throw new APIError(
                "Invalid credentials",
                RESPONSE_STATUS.UNAUTHENTICATED
            );
        }

        const { accessToken, refreshToken } = await this.authService.login(user)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Set to true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none for cross-site cookies
            maxAge: 60 * 60 * 1000,  // Expires in 60 m
        });

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: 'Login successful',
            data: {
                token: accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    }
}

