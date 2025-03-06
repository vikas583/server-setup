import { Inject, Service } from "typedi";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { sanitizeString } from "../../utils/sanitizeString";
import { dbConnection } from "../../utils/dbConnection";
import { User } from "../../entity/user";

import { Roles } from "../../entity/roles";
import { Account } from "../../entity/account";
import { AddCustomerRequest, CreatedByType } from "../../types";
import { AdminAccountService } from "./AdminAccountService";
import { AdminCustomerRoleService } from "./AdminCustomerRoleService";
import bcrypt from 'bcrypt'
import { loadTemplate } from "../../utils/loadTemplate";
import EmailQueue from "../../lib/rabbitmq/queues/email";
import logger from "../../utils/logger";
import { validateAgainstSuspiciousPatterns } from "../../utils/securityPatterns";


@Service()
export class AdminCustomerService {

    constructor(
        @Inject()
        private readonly adminAccountService: AdminAccountService,
        @Inject()
        private readonly adminCustomerRoleService: AdminCustomerRoleService,
        @Inject()
        private readonly emailQueue: EmailQueue
    ) { }

    async customerList(skip: string, limit: string, accountId?: number, searchStr?: string) {
        try {
            let sanitizedStr: string = '';

            if (searchStr) {
                sanitizedStr = sanitizeString(searchStr);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(User, 'usr')

            if (sanitizedStr) {
                qb.where('usr."firstName" ilike :firstName', {
                    firstName: `%${sanitizedStr}%`,
                }).orWhere('usr.email ilike :email', {
                    email: `%${sanitizedStr}%`
                }).orWhere('usr."lastName" ilike :lastName', {
                    lastName: `%${sanitizedStr}%`
                }).orWhere('acc.name ilike :accountName', {
                    accountName: `%${sanitizedStr}%`
                })
            }

            if (accountId) {
                if (searchStr) {
                    qb.andWhere('usr."accountId" = :accountId', {
                        accountId
                    })
                } else {
                    qb.where('usr."accountId" = :accountId', {
                        accountId
                    })
                }
            }

            const total = await qb.clone().leftJoin(Account, 'acc', 'usr."accountId"=acc.id').getCount();
            const customers = await qb.select([
                'usr.id as id',
                `CONCAT(usr."firstName",' ',usr."lastName") as name`,
                'usr.email as email',
                'usr."isBlocked" as "isBlocked"',
                'usr."isDeleted" as "isDeleted"',
                'usr."createdAt" as "createdAt"',
                'roles.name as "roleName"',
                'acc.name as "accountName"',
                'usr."isFirstLogin" as "isFirstLogin"',
                'usr."isUserInfoCompleted" as "isUserInfoCompleted"',

            ])
                .leftJoin(Account, 'acc', 'usr."accountId"=acc.id')
                .leftJoin(Roles, 'roles', 'usr."roleId"=roles.id')
                .orderBy('usr.id', "DESC")
                .limit(Number(limit))
                .offset(Number(skip))
                .getRawMany();

            return {
                customers,
                total,
            };

        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            console.log(err)
            throw new APIError(errorMessage, errorCode);
        }
    }

    async create(body: AddCustomerRequest, adminId: number) {
        try {
            const dataSource = await dbConnection()
            const account = await this.adminAccountService.getAccountDetails(body.accountId)
            if (!account) {
                throw new APIError('Invalid account details!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            const role = await this.adminCustomerRoleService.getRole(body.roleId)

            if (!role) {
                throw new APIError('Invalid account details!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            const user = await this.checkForUniqueEmail(body.email)

            if (user) {
                throw new APIError('Email alreaedy taken!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            const userObj = new User()

            const isUserPrimary = await this.checkIfPrimaryAccountOwner(body.accountId)
            if (isUserPrimary) {
                userObj.isPrimaryAccountOwner = true
            }

            if (validateAgainstSuspiciousPatterns(body.password)) {
                throw new APIError('Invalid password format. Password contains potentially malicious content.', RESPONSE_STATUS.UNPROCESSABLE_ENTITY);
            }

            userObj.firstName = body.firstName
            userObj.lastName = body.lastName
            userObj.email = body.email.toLowerCase()
            userObj.password = bcrypt.hashSync(body.password, 10);
            userObj.accountId = body.accountId
            userObj.roleId = body.roleId
            userObj.createdByType = CreatedByType.ADMIN
            userObj.createdBy = adminId

            logger.info('password', body.password)
            logger.info('Email', body.email)

            const addUser = await dataSource.getRepository(User).save(userObj)

            if (addUser) {
                const subject = "Your account has been created!"

                // Load the email template and replace placeholders
                const html = await loadTemplate('register',
                    {
                        email: body.email,
                        password: body.password,
                        username: body.firstName + ' ' + body.lastName
                    });

                await this.emailQueue.sendMessage({
                    to: body.email,
                    subject,
                    body: html,
                    isHtml: true,
                });

                return true
            }

            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)


        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            console.log(err)
            throw new APIError(errorMessage, errorCode);
        }
    }

    async checkForUniqueEmail(email: string) {
        const dataSource = await dbConnection()
        const user = await dataSource.getRepository(User).findOne({
            where: {
                email
            }
        })

        return user
    }

    async blockUnblockUser(userId: number, isBlocked: boolean) {
        try {
            const dataSource = await dbConnection()

            const updateUser = await dataSource.getRepository(User).update(
                {
                    id: userId
                },
                {
                    isBlocked
                }
            )

            if (updateUser) {
                return true
            } else {
                return false
            }

        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async deleteUser(userId: number) {
        try {
            const dataSource = await dbConnection()

            const deleteUser = await dataSource.getRepository(User).update(
                {
                    id: userId,
                },
                {
                    isDeleted: true
                }
            )

            if (deleteUser) {
                return true
            } else {
                return false
            }


        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async checkIfPrimaryAccountOwner(accountId: number) {
        const dataSource = await dbConnection()
        const checkIfUserExist = await dataSource.getRepository(User).count({
            where: {
                accountId
            }
        })
        if (checkIfUserExist) {
            return false
        }
        return true
    }

    async resendWelcomeEmail(customerId: number) {
        try {
            const dataSource = await dbConnection()
            const customer = await dataSource.getRepository(User).findOne({
                where: {
                    id: customerId
                }
            })

            if (!customer) {
                throw new APIError('Customer not found!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            if (!customer.isFirstLogin) {
                throw new APIError('Customer already logged in!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }
            if (customer.isBlocked === true) {
                throw new APIError('Customer is blocked!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }
            if (customer.isUserInfoCompleted) {
                throw new APIError('Customer already logged in!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }
            // Generate a new random password
            const newPassword = Math.random().toString(36).slice(-8); // generates an 8-character random string

            logger.info('newPassword', newPassword)
            logger.info('customer.email', customer.email)
            // Update the user's password in the database with the new hashed password
            await dataSource.getRepository(User).update(
                { id: customerId },
                { password: bcrypt.hashSync(newPassword, 10) }
            );

            const subject = "Your account password has been reset!"

            const html = await loadTemplate('register',
                {
                    email: customer.email,
                    password: newPassword, // Send the plain text password in the email
                    username: customer.firstName + ' ' + customer.lastName
                });

            await this.emailQueue.sendMessage({
                to: customer.email,
                subject,
                body: html,
                isHtml: true,
            });

            return true
        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}