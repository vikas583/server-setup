import {
  Authorized,
  Body,
  Controller,
  CurrentUser,
  Get,
  Post,
  Req,
  Res,
  UseBefore,
  Patch,
  QueryParam,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { Response, Request } from "express";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import {
  LoginRequest,
  TempTokenData,
  UserAccountView,
  UserRoles,
  UserInitialSteps,
  SendPasswordResetLinkRequest,
  ResetPasswordRequest2FA,
  ResetPasswordRequest,
} from "../types";
import AuthService from "../services/AuthService";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validation/authValidation";
import { User } from "../entity/user";
import { APIError } from "../utils/APIError";
import { generateTempAccessToken } from "../utils/authUtils";
import { SettingService } from "../services/SettingService";
import { dbConnection } from "../utils/dbConnection";
import { TotpService } from "../services/TotpService";
import { sendPasswordResetLinkSchema } from "../validation/userValidation";

@Service()
@Controller("/auth")
export class AuthController {
  constructor(
    @Inject()
    private readonly authService: AuthService,
    @Inject()
    private readonly settingService: SettingService,
    @Inject()
    private readonly totpService: TotpService
  ) { }

  @Post("/login")
  @UseBefore(validate(loginSchema))
  async login(@Body() { email, password }: LoginRequest, @Res() res: Response) {
    const dbMFAValue = await this.settingService.getValue("isMFAMandtory");

    const IS_MFA_MANDATORY: boolean = dbMFAValue ? Boolean(dbMFAValue) : true;

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

    // if (user.isFirstLogin) {
    const tokenData: TempTokenData = {
      id: user.id,
      type: "user",
    };
    const minsTemplTokenValid = 5;
    const token = generateTempAccessToken(tokenData, minsTemplTokenValid);
    res.cookie("tempToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-site cookies
      maxAge: minsTemplTokenValid * 60 * 1000, // Expires in 5 mins
    });

    let nextStep = null;
    // console.log(user)
    if (!user.isUserInfoCompleted) nextStep = UserInitialSteps.UPDATE_USER_INITIALS;
    else if (!user.isBillingInfoCompleted && user.role === UserRoles.account_owner && user.isPrimaryAccountOwner) nextStep = UserInitialSteps.UPDATE_BILLING_DETAILS;
    else if (!user.isMFAStepCompleted) nextStep = UserInitialSteps.SETUP_MFA;
    else if (!user.isPasswordResetCompleted) nextStep = UserInitialSteps.SETUP_PASSWORD;
    else nextStep = UserInitialSteps.ENTER_MFA;

    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Authenticated Successfully!!!",
      tempToken: token,
      mfaRequired: IS_MFA_MANDATORY,
      nextStep,
      isFirstLogin: user.isFirstLogin
    });
    // } else {
    //     const { accessToken, refreshToken } = await this.authService.login(user)

    //     res.cookie('refreshToken', refreshToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',  // Set to true in production
    //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none for cross-site cookies
    //         maxAge: 60 * 60 * 1000,  // Expires in 60 m
    //     });

    //     return res.status(RESPONSE_STATUS.SUCCESS).send({
    //         status: true,
    //         msg: 'Login successful',
    //         data: {
    //             token: accessToken,
    //             user: {
    //                 id: user.id,
    //                 name: user.name,
    //                 email: user.email,
    //                 role: user.role
    //             }
    //         }
    //     });

    // }
  }

  @Get("/me")
  @Authorized([
    UserRoles.account_owner,
    UserRoles.project_owner,
    UserRoles.contributor,
  ])
  async authMe(
    @CurrentUser({ required: true }) user: UserAccountView,
    @Res() res: Response
  ) {
    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      data: {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.userRole,
      },
    });
  }

  @Get("/logout")
  @Authorized([
    UserRoles.account_owner,
    UserRoles.project_owner,
    UserRoles.contributor,
  ])
  async logout(@CurrentUser() user: User, @Res() res: Response) {
    const userId = user.id;
    await this.authService.logout(userId);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Logout successfully!",
    });
  }

  @Post("/generate-access-token")
  async generateAccesToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(RESPONSE_STATUS.UNAUTHENTICATED)
        .json({ message: "No refresh token provided" });
    }

    const accessToken = await this.authService.refreshToken(refreshToken);

    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Access token generated successfully!",
      data: {
        accessToken,
      },
    });
  }

  @Post("/sendResetPasswordEmail")
  @UseBefore(validate(sendPasswordResetLinkSchema))
  async sendResetPasswordEmail(
    @Body() { email }: SendPasswordResetLinkRequest,
    @Res() res: Response
  ) {
    await this.authService.sendPasswordResetEmail(email);
    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Email sent successfully!",
    });
  }

  @Get("/validateResetPasswordToken")
  async validateResetPasswordToken(
    @QueryParam("token") token: string,
    @Res() res: Response
  ) {
    await this.authService.validateResetPasswordToken(token);
    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Token is valid!",
    });
  }

  @Patch("/resetPassword")
  async resetPassword(
    @Body() { token, password }: ResetPasswordRequest,
    @Res() res: Response
  ) {
    await this.authService.resetPassword(token, password);
    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Password reset successfully!",
    });
  }

  @Patch("/resetPassword2FA")
  async resetPassword2FA(
    @Body() { email, code }: ResetPasswordRequest2FA,
    @Res() res: Response
  ) {
    const conn = await dbConnection();
    const userDetails = await conn.getRepository(User).findOne({
      where: {
        email,
      },
    });

    if (!userDetails) {
      throw new APIError("User not found!", RESPONSE_STATUS.BAD_REQUEST);
    }

    const validateMfa = await this.totpService.verifyTotp(userDetails.id, code);

    if (!validateMfa.valid) {
      throw new APIError("Invalid code!", RESPONSE_STATUS.SUCCESS);
    }

    const resetPasswordToken = await this.authService.resetPassword2FA(email);
    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Password reset successfully!",
      resetPasswordToken,
    });
  }
}
