import { Inject, Service } from "typedi";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { sanitizeString } from "../../utils/sanitizeString";
import { dbConnection } from "../../utils/dbConnection";
import { Account } from "../../entity/account";
import { User } from "../../entity/user";
import { CreateAccountRequest } from "../../admin-types";
import { generateUniqueShortCode } from "../../utils/generateUniqueShortCode";
import { UpdateAccountStatusRequest } from "../../types";
import { generateAccountKey } from "../../utils/generateAccountKey";
import { KeyVaultService } from "../KeyVaultService";

@Service()
export class AdminAccountService {

    constructor(
        @Inject()
        private readonly keyVaultService: KeyVaultService
    ) {

    }

    async accountList(skip: string, limit: string, searchStr?: string) {
        try {

            let sanitizedStr: string = '';

            if (searchStr) {
                sanitizedStr = sanitizeString(searchStr);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(Account, 'acc');

            if (sanitizedStr) {
                qb.where('acc.name ilike :name', {
                    name: `%${sanitizedStr}%`,
                }).orWhere('acc."postalCode" ilike :postalCode', {
                    postalCode: `%${sanitizedStr}%`
                }).orWhere('acc."country" ilike :country', {
                    country: `%${sanitizedStr}%`
                })
            }

            const total = await qb.clone().getCount();
            const accounts = await qb
                .select([
                    'acc.id as id',
                    'acc.name as name',
                    'acc."addressLine1" as "addressLine1"',
                    'acc.city as city',
                    'acc.state as state',
                    'acc.country as country',
                    'acc."postalCode" as "postalCode"',
                    'acc."createdAt" as "createdAt"',
                    'acc."isActive" as "isActive"',
                    'COUNT(u.id) AS "userCount"'
                ])
                .leftJoin(User, 'u', 'u."accountId" = acc.id')
                .groupBy('acc.id')
                .orderBy('acc."createdAt"', 'DESC')
                .limit(Number(limit))
                .offset(Number(skip))
                .getRawMany();


            return {
                accounts,
                total,
            };
        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async accountCreate(body: CreateAccountRequest) {
        const dataSource = await dbConnection()
        const queryRunner = dataSource.createQueryRunner()

        await queryRunner.startTransaction();
        try {

            const account = await queryRunner.manager.getRepository(Account).findOne({
                where: {
                    name: body.accountName
                }
            })
            if (account) {
                throw new APIError('Account already registered!', RESPONSE_STATUS.CONFLICT)
            }

            let accountObj: { [key: string]: any } = {}
            accountObj.name = body.accountName.toLowerCase()
            accountObj.shortCode = await generateUniqueShortCode()

            if (body.addressLine1) {
                accountObj.addressLine1 = body.addressLine1
            }

            if (body.city) {
                accountObj.city = body.city
            }

            if (body.state) {
                accountObj.state = body.state
            }

            if (body.country) {
                accountObj.country = body.country
            }


            const accountCreated = await queryRunner.manager.getRepository(Account).save(accountObj)

            // Call the database function to create schema based on shortCode
            await queryRunner.query(
                `SELECT ${process.env.DB_SCHEMA}.create_schema_from_template($1)`,
                [accountObj.shortCode]
            );


            if (accountCreated) {
                const accountKeyValue = generateAccountKey()
                await this.keyVaultService.storeKey(accountCreated.id.toString(), accountKeyValue)

            } else {

                throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
            }

            await queryRunner.commitTransaction();
            return true;

        } catch (err) {

            await queryRunner.rollbackTransaction();
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        } finally {
            await queryRunner.release();
        }
    }

    async getAccountDetails(accountId: number) {

        const dataSource = await dbConnection()
        const account = await dataSource.getRepository(Account).findOne({
            where: {
                id: accountId
            }
        })

        return account

    }

    async activeDeactiveAccount(body: UpdateAccountStatusRequest) {
        try {
            const dataSource = await dbConnection()

            const getUserCount = await dataSource.getRepository(User).count({ where: { accountId: body.accountId } })

            if (!getUserCount) {
                throw new APIError('Account must have atleast one active user in order to make it active!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            const updateAccount = await dataSource.getRepository(Account).update(
                {
                    id: body.accountId
                },
                {
                    isActive: body.isActive
                }
            )

            if (updateAccount) {
                return true
            } else {
                throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR);
            }


        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}