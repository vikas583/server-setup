import { Inject, Service } from "typedi";
import { dbConnection } from "../../utils/dbConnection";
import { Admin } from "../../entity/admin";
import { AdminLoginRequest, AdminRegisterRequest, AdminTokenData } from "../../admin-types";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import bcrypt from 'bcrypt'
import { AdminRoles } from "../../entity/adminRoles";
import { comparePassword, generateAccessToken, generateExpiryDate, generateRefreshToken } from "../../utils/authUtils";
import jwt from "jsonwebtoken"
import { loadTemplate } from "../../utils/loadTemplate";
import EmailQueue from "../../lib/rabbitmq/queues/email";

@Service()
export class AdminAuthSerivce {

    constructor(
        @Inject()
        private readonly emailQueue: EmailQueue
    ) {

    }

    async login(body: AdminLoginRequest) {
        try {
            const dataSource = await dbConnection()
            const adminRepo = dataSource.getRepository(Admin)

            const admin = await dataSource.getRepository(Admin).createQueryBuilder('admin')
                .leftJoinAndSelect('admin.adminRole', 'adminRole', 'admin."adminRoleId"=adminRole.id')
                .select([
                    'admin.id as "id"',
                    'admin.name as name',
                    'admin.password as "password"',
                    'admin.email as "email"',
                    'admin."isBlocked" as "isBlocked"',
                    'admin."loginAttempts" as "loginAttempts"',
                    'admin."lastLoginAttempt" as "lastLoginAttempt"',
                    'admin."attemptCycles" as "attemptCycles"',
                    '"adminRole"."name" as "role"'
                ])
                .where('admin.email = :email', { email: body.email })
                .getRawOne()

            if (!admin) {
                throw new APIError(`User doesn't exist!`, RESPONSE_STATUS.UNAUTHENTICATED)
            }

            if (admin.isBlocked) {
                throw new APIError("Account is permanently blocked. Please contact support.", RESPONSE_STATUS.UNAUTHENTICATED)
            }

            // Check if temporary block period (10 minutes) has passed
            if (admin.lastLoginAttempt) {
                const blockDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
                const timeSinceLastAttempt = Date.now() - new Date(admin.lastLoginAttempt).getTime();

                if (timeSinceLastAttempt < blockDuration && admin.loginAttempts >= 3) {
                    const remainingMinutes = Math.ceil((blockDuration - timeSinceLastAttempt) / 60000);
                    throw new APIError(`Account is temporarily blocked. Please try again in ${remainingMinutes} minutes.`, RESPONSE_STATUS.UNAUTHENTICATED);
                }

                // Reset attempts if block period has passed
                if (timeSinceLastAttempt >= blockDuration && admin.loginAttempts >= 3) {
                    admin.loginAttempts = 0;
                    admin.attemptCycles += 1;
                }
            }

            const validatePassword = comparePassword(body.password, admin.password)

            if (!validatePassword) {
                // Increment login attempts
                const loginAttempts = admin.loginAttempts + 1;
                const updates: any = {
                    loginAttempts,
                    lastLoginAttempt: new Date()
                };

                // Check if we need to block the account permanently
                if (admin.attemptCycles >= 2 && loginAttempts >= 3) {
                    updates.isBlocked = true;
                    await adminRepo.update({ id: admin.id }, updates);
                    throw new APIError("Account has been permanently blocked due to multiple failed attempts.", RESPONSE_STATUS.UNAUTHENTICATED);
                }

                await adminRepo.update({ id: admin.id }, updates);
                
                // Modified error message logic
                if (loginAttempts >= 3) {
                    throw new APIError("Account temporarily blocked. Please try again after 10 minutes.", RESPONSE_STATUS.UNAUTHENTICATED);
                } else {
                    throw new APIError(`Invalid password! ${3 - loginAttempts} attempts remaining before temporary block.`, RESPONSE_STATUS.UNAUTHENTICATED);
                }
            }

            // Reset attempts on successful login
            await adminRepo.update({ id: admin.id }, {
                loginAttempts: 0,
                lastLoginAttempt: new Date(0)
            });

            const adminTokenData: AdminTokenData = {
                email: admin.email,
                role: admin.role
            }

            const refreshToken = generateRefreshToken(adminTokenData)
            const accessToken = generateAccessToken(adminTokenData)
            const refreshTokenExpiresAt = generateExpiryDate()

            await adminRepo.update(
                { id: admin.id },
                {
                    token: refreshToken,
                    tokenExpiresAt: refreshTokenExpiresAt
                }
            )
            return { admin, accessToken, refreshToken }
        }
        catch (err) {
            console.log(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async register(body: AdminRegisterRequest) {
        try {

            const dataSource = await dbConnection()

            const role = await dataSource.getRepository(AdminRoles).findOne({ where: { id: body.adminRoleId } });

            if (!role) {
                throw new APIError('Invalid admin role ID', RESPONSE_STATUS.BAD_REQUEST);
            }


            const alreadyRegisteredAdmin = await dataSource.getRepository(Admin).findOne({ where: { email: body.email } })

            if (alreadyRegisteredAdmin) {
                throw new APIError('Email Address already registered!', RESPONSE_STATUS.CONFLICT)
            }

            const emailDomain = body.email.toLowerCase().split('@')[1];
            const allowedDomain = "tiebreaker-ai.com"

            if (emailDomain !== allowedDomain) {
                throw new APIError('Email Address must be tiebreaker account!', RESPONSE_STATUS.CONFLICT)
            }

            const adminObj = new Admin()
            adminObj.email = body.email.toLowerCase()
            adminObj.name = body.name;
            adminObj.password = bcrypt.hashSync(body.password, 10)
            adminObj.adminRoleId = body.adminRoleId

            const adminRegistered = await dataSource.getRepository(Admin).save(adminObj)

            if (!adminRegistered) {
                throw new APIError('Something went wrong, while adding admin!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
            } else {
                const subject = "Your account has been created!"

                // Load the email template and replace placeholders
                const html = await loadTemplate('register', { email: body.email, password: body.password, username: body.name });

                await this.emailQueue.sendMessage({
                    to: body.email,
                    subject,
                    body: html,
                    isHtml: true,
                });

                return true
            }

        }
        catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }


    async getAdminDetails(value: string, type: string) {

        try {
            console.log(type)
            let obj: { [key: string]: string } = {};
            if (type === 'email') {
                obj.email = value
            } else if (type === 'token') {
                obj.token = value
            }

            const dataSource = await dbConnection()

            return await dataSource.getRepository(Admin).createQueryBuilder('admin')
                .leftJoinAndSelect('admin.adminRole', 'adminRole', 'admin."adminRoleId"=adminRole.id')
                .select([
                    'admin.id as "id"',
                    'admin.name as name',
                    'admin.password as "password"',
                    'admin.email as "email"',
                    'admin."isBlocked" as "isBlocked"',
                    '"adminRole"."name" as "role"'     // Specific fields from Role
                ])
                .where(`admin.${type}=:${type}`, obj)
                .getRawOne()
        } catch (err) {
            throw new APIError('Something went wrong, try again later', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
    }


    async refreshToken(token: string) {
        try {
            const adminDetails = await this.getAdminDetails(token, 'token')

            if (!adminDetails) {
                throw new APIError('Invalid token', RESPONSE_STATUS.UNAUTHENTICATED)
            }

            const verifyToken = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
            if (!verifyToken) {
                throw new APIError('Token Expired!', RESPONSE_STATUS.UNAUTHENTICATED)
            }

            if (adminDetails.isBlocked) {
                throw new APIError('Access Revoked', RESPONSE_STATUS.FORBIDDEN)
            }
            const tokenData: AdminTokenData = {
                email: adminDetails.email,
                role: adminDetails.role
            }

            const accessToken = generateAccessToken(tokenData)

            return accessToken
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                    throw new APIError('Forbidden: Invalid or expired token', RESPONSE_STATUS.UNAUTHENTICATED);
                }
            }

            // Now, assert the type of err as APIError if applicable
            const errorMessage = (err instanceof APIError ? err.msg : 'Something went wrong, try again later!');
            const errorCode = (err instanceof APIError ? err.httpCode : RESPONSE_STATUS.INTERNAL_SERVER_ERROR);

            throw new APIError(errorMessage, errorCode);
        }

    }

    async logout(id: number) {
        try {
            const dataSource = await dbConnection()
            await dataSource.getRepository(Admin).update(
                {
                    id
                },
                {
                    token: '',
                    tokenExpiresAt: undefined
                }
            )

            return true
        }
        catch (error: any) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
    }
}