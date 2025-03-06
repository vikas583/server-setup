import { Inject, Service } from "typedi";
import { dbConnection } from "../utils/dbConnection";
import { APIError } from "../utils/APIError";
import {
  LoginRequest,
  LoginUserResponse,
  ResetPasswordTokenData,
  SignupRequest,
  TokenData,
} from "../types";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { Account } from "../entity/account";
import { User } from "../entity/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateExpiryDate,
  generatePasswordResetLink,
  generateRefreshToken,
  generateResetPasswordToken,
} from "../utils/authUtils";
import { Roles } from "../entity/roles";
import logger from "../utils/logger";
import { loadTemplate } from "../utils/loadTemplate";
import EmailQueue from "../lib/rabbitmq/queues/email";
import { validateAgainstSuspiciousPatterns } from "../utils/securityPatterns";
const MAX_FAILED_ATTEMPTS = 3;
const MAX_LOGIN_LOCK_CYCLES = 3;

@Service()
export default class AuthService {
  constructor(
    @Inject()
    private readonly emailQueue: EmailQueue
  ) { }

  /**
   * Handles user signup process.
   *
   * This method creates a new company and a new user associated with that company.
   * It first establishes a connection to the database, then creates and saves a
   * new Company entity. After successfully saving the company, it creates and saves
   * a new User entity with the provided details and links it to the created company.
   *
   * @param {SignupRequest} body - The request body containing user and company details.
   * @returns {Promise<User>} - The created User entity.
   */
  async signUp(body: SignupRequest) {
    const dataSource = await dbConnection();

    const alreadyAccount = await dataSource
      .getRepository(Account)
      .findOne({ where: { name: body.companyName.toLowerCase() } });

    if (alreadyAccount) {
      throw new APIError(
        "Account name already exist!",
        RESPONSE_STATUS.CONFLICT
      );
    }

    const accountObj = new Account();
    accountObj.name = body.companyName.toLowerCase();

    const account = await dataSource.getRepository(Account).save(accountObj);

    if (!account) {
      throw new APIError(
        "Something went wrong, while adding company!",
        RESPONSE_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const userObj = new User();
    userObj.account = account;
    // userObj.name = body.name;
    userObj.email = body.email.toLowerCase();
    userObj.password = bcrypt.hashSync(body.password, 10);

    const user = await dataSource.getRepository(User).save(userObj);

    if (!user) {
      throw new APIError(
        "Something went wrong, while adding user!",
        RESPONSE_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return user;
  }

  async login(user: LoginUserResponse) {
    try {
      const tokenData: TokenData = {
        accountId: user.accountId,
        email: user.email,
        role: user.role,
      };

      const refreshToken = generateRefreshToken(tokenData, "60m");
      const accessToken = generateAccessToken(tokenData);
      const refreshTokenExpiresAt = generateExpiryDate();

      const dataSource = await dbConnection();

      await dataSource.getRepository(User).update(
        {
          id: user.id,
        },
        {
          lastLoginAt: new Date(),
          refreshAuthToken: refreshToken,
          refreshAuthTokenExpiresAt: refreshTokenExpiresAt,
          isLoggedIn: true,
        }
      );

      return { accessToken, refreshToken };
    } catch (err: any) {
      logger.error("Server::Service AuthService::Login");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async getUserDetails(fieldType: string, value: string) {
    const dataSource = await dbConnection();

    const query = await dataSource
      .getRepository(User)
      .createQueryBuilder("usr")
      .leftJoinAndSelect(Account, "account", 'usr."accountId" = account.id')
      .leftJoinAndSelect(Roles, "role", 'usr."roleId" = role.id')
      .select([
        'usr.id as "id"',
        'usr."firstName" as name',
        "usr.password as password",
        'usr.email as "email"',
        'usr."accountId" as "accountId"',
        'usr."isBlocked" as "isBlocked"',
        'usr."isDeleted" as "isDeleted"',
        'usr."isFirstLogin" as "isFirstLogin"',
        'usr."lastLoginAt" as "lastLoginAt"',
        'usr."isLoggedIn" as "isLoggedIn"',
        'usr."isMFAEnabled" as "isMFAEnabled"',
        'usr."isPrimaryAccountOwner" as "isPrimaryAccountOwner"',
        'usr."isMFAStepCompleted" as "isMFAStepCompleted"',
        'usr."failedLoginAttempts" as "failedLoginAttempts"',
        'usr."loginLockedUntil" as "loginLockedUntil"',
        'usr."loginLockCycles" as "loginLockCycles"',
        'role.name as "role"',
        'account."isActive" as "accountIsActive"',
        'account."isBillingInfoCompleted" as "isBillingInfoCompleted"',
        'usr."isUserInfoCompleted" as "isUserInfoCompleted"',
        'usr."isPasswordResetCompleted" as "isPasswordResetCompleted"',
      ]);
    // console.log(fieldType)

    if (fieldType === "email") {
      return query
        .where("usr.email = :email", { email: value })
        .getRawOne<LoginUserResponse>();
    } else if (fieldType === "id") {
      return query
        .where("usr.id = :id", { id: Number(value) })
        .getRawOne<LoginUserResponse>();
    } else if (fieldType === "token") {
      return query
        .where('usr."refreshAuthToken"=:token', { token: value })
        .getRawOne<LoginUserResponse>();
    }
  }

  async validateCredentials(body: LoginRequest) {
    const dataSource = await dbConnection();
    try {
      const user = await this.getUserDetails("email", body.email);

      if (!user) {
        throw new APIError(
          `User doesn't exist!`,
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      // Check if account is temporarily locked
      if (user.loginLockedUntil && new Date() < user.loginLockedUntil) {
        throw new APIError(
          `Account is temporarily locked. Please try again later.`,
          RESPONSE_STATUS.TOO_MANY_REQUESTS
        );
      }

      if (user.isBlocked) {
        throw new APIError(
          "Account has been permanently locked. Please contact support.",
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      if (user.isDeleted) {
        throw new APIError("User has been deleted, by admin!", RESPONSE_STATUS.BAD_REQUEST);
      }

      if (!user.accountIsActive) {
        throw new APIError(
          "Account not active, please contact admin!",
          RESPONSE_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const isPasswordValid = bcrypt.compareSync(body.password, user.password);

      if (!isPasswordValid) {
        // Increment failed attempts and update lock status
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockCycles = user.loginLockCycles || 0;

        let updates: Partial<User> = {
          failedLoginAttempts: failedAttempts,
        };

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          // Check lock cycles before applying temporary lock
          if (lockCycles >= MAX_LOGIN_LOCK_CYCLES - 1) {
            // Permanently block user after 3 lock cycles
            updates = {
              ...updates,
              isBlocked: true,
              failedLoginAttempts: 0,
              loginLockCycles: 0,
            };

            // Update the user account first
            await dataSource.getRepository(User).update(
              { id: user.id },
              updates
            );

            // Then throw the error
            throw new APIError(
              "Account has been locked due to multiple failed attempts. Please contact support.",
              RESPONSE_STATUS.FORBIDDEN
            );
          }

          // Temporary lock for 10 minutes
          updates = {
            ...updates,
            loginLockedUntil: new Date(Date.now() + 10 * 60 * 1000),
            failedLoginAttempts: 0,
            loginLockCycles: lockCycles + 1,
          };
        }

        console.log(updates)
        await dataSource.getRepository(User).update(
          { id: user.id },
          updates
        );

        throw new APIError(
          "Invalid password!",
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      // Reset login attempts on successful login
      await dataSource.getRepository(User).update(
        { id: user.id },
        {
          failedLoginAttempts: 0,
          loginLockedUntil: new Date(0),
          loginLockCycles: 0,
        }
      );

      return user;
    } catch (err) {
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async logout(id: number) {
    try {
      const dataSource = await dbConnection();
      await dataSource.getRepository(User).update(
        {
          id,
        },
        {
          refreshAuthToken: "",
          refreshAuthTokenExpiresAt: undefined,
        }
      );

      return true;
    } catch (error: any) {
      throw new APIError(
        "Something went wrong, try again later!",
        RESPONSE_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(token: string) {
    try {
      const userDetails = await this.getUserDetails("token", token);
      if (!userDetails) {
        throw new APIError(
          "Please login again!",
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      const verifyToken = await jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
      );
      if (!verifyToken) {
        throw new APIError("Token Expired!", RESPONSE_STATUS.UNAUTHENTICATED);
      }

      if (userDetails.isBlocked) {
        throw new APIError("Access Revoked", RESPONSE_STATUS.FORBIDDEN);
      }
      const tokenData: TokenData = {
        accountId: userDetails.accountId,
        email: userDetails.email,
        role: userDetails.role,
      };

      const accessToken = generateAccessToken(tokenData);

      return accessToken;
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.name === "JsonWebTokenError" ||
          err.name === "TokenExpiredError"
        ) {
          throw new APIError(
            "Forbidden: Invalid or expired token",
            RESPONSE_STATUS.UNAUTHENTICATED
          );
        }
      }

      // Now, assert the type of err as APIError if applicable
      const errorMessage =
        err instanceof APIError
          ? err.msg
          : "Something went wrong, try again later!";
      const errorCode =
        err instanceof APIError
          ? err.httpCode
          : RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      throw new APIError(errorMessage, errorCode);
    }
  }

  async sendPasswordResetEmail(email: string) {
    const conn = await dbConnection();
    const queryRunner = conn.createQueryRunner();

    try {
      await queryRunner.startTransaction();
      const user = await queryRunner.manager.getRepository(User).findOne({
        where: {
          email,
        },
      });

      if (!user) {
        throw new APIError("User not found!", RESPONSE_STATUS.NOT_FOUND);
      }

      if (
        user.passwordResetTokenExpiresAt &&
        user.passwordResetTokenExpiresAt > new Date()
      ) {
        throw new APIError(
          "Please wait for upto 5mins before trying again!",
          RESPONSE_STATUS.BAD_REQUEST
        );
      }

      // token is only valid for 5 minutes
      const token = generateResetPasswordToken(
        {
          email: user.email,
        },
        5
      );

      await queryRunner.manager.getRepository(User).update(
        {
          id: user.id,
        },
        {
          passwordResetToken: token,
          passwordResetTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }
      );

      const subject = "Password reset request";
      const html = await loadTemplate("resetPassword", {
        username: user.firstName,
        resetPasswordLink: generatePasswordResetLink(token),
      });

      await this.emailQueue.sendMessage({
        to: user.email,
        subject,
        body: html,
        isHtml: true,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      logger.error("Server::Service User::MFASecretGenerate");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async validateResetPasswordToken(token: string) {
    try {
      const verifiedToken = jwt.verify(
        token,
        process.env.RESET_PASSWORD_TOKEN_SECRET
      ) as ResetPasswordTokenData;

      if (!verifiedToken) {
        throw new APIError("Invalid token", RESPONSE_STATUS.UNAUTHENTICATED);
      }

      const conn = await dbConnection();
      const user = await conn.getRepository(User).findOne({
        where: {
          email: verifiedToken.email,
        },
      });

      if (!user) {
        throw new APIError("User not found", RESPONSE_STATUS.NOT_FOUND);
      }

      if (
        user.email !== verifiedToken.email ||
        user.passwordResetToken !== token
      ) {
        throw new APIError(
          "This link is invalid. Please try again.",
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      return user;
    } catch (error) {
      logger.error("Server::Service User::resetPassword");
      console.error(error);
      const errorMessage =
        (error as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (error as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async resetPassword(token: string, password: string) {
    try {

      if (validateAgainstSuspiciousPatterns(password)) {
        throw new APIError('Invalid password format. Password contains potentially malicious content.', RESPONSE_STATUS.UNPROCESSABLE_ENTITY);
      }
      const isPasswordValid =
        password.length >= 8 &&
        password.match(/[A-Z]/) &&
        password.match(/[0-9]/) &&
        password.match(/[^a-zA-Z0-9]/);
      if (!isPasswordValid) {
        throw new APIError(
          "Password must be at least 8 characters long and contain at least one capital letter, one number, and one special character.",
          RESPONSE_STATUS.BAD_REQUEST
        );
      }

      const user = await this.validateResetPasswordToken(token);

      const conn = await dbConnection();
      if (await bcrypt.compare(password, user.password)) {
        throw new APIError(
          "New password cannot be same as old password",
          RESPONSE_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      await conn.getRepository(User).update(
        {
          id: user.id,
        },
        {
          password: bcrypt.hashSync(password, 10),
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        }
      );
    } catch (error) {
      logger.error("Server::Service User::resetPassword");
      console.error(error);
      const errorMessage =
        (error as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (error as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async resetPassword2FA(email: string) {
    const conn = await dbConnection();
    const user = await conn.getRepository(User).findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new APIError("User not found", RESPONSE_STATUS.NOT_FOUND);
    }

    if (
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt > new Date()
    ) {
      throw new APIError(
        "Please wait for upto 5mins before trying again!",
        RESPONSE_STATUS.BAD_REQUEST
      );
    }

    const token = generateResetPasswordToken(
      {
        email: user.email,
      },
      5
    );
    await conn.getRepository(User).update(
      {
        id: user.id,
      },
      {
        passwordResetToken: token,
        passwordResetTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    );
    return token;
  }
}
