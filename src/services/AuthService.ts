import { Service } from "typedi";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { APIError } from "../utils/APIError";
import { LoginRequest, LoginUserResponse, TokenData } from "../types";
import { dbConnection } from "../utils/dbConnection";
import bcrypt from "bcrypt";
import { User } from "../entity/user";
import { Roles } from "../entity/roles";
import { generateAccessToken, generateExpiryDate, generateRefreshToken } from "../utils/authUtils";
import logger from "../utils/logger";
const MAX_FAILED_ATTEMPTS = 3;
const MAX_LOGIN_LOCK_CYCLES = 3;


@Service()
export default class AuthService {

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

    async getUserDetails(fieldType: string, value: string) {
        const dataSource = await dbConnection();

        const query = await dataSource
            .getRepository(User)
            .createQueryBuilder("usr")
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

    async login(user: LoginUserResponse) {
        try {
            const tokenData: TokenData = {
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
}