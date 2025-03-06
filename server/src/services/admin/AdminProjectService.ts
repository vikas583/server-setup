import { Inject, Service } from "typedi";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import logger from "../../utils/logger";
import { sanitizeString } from "../../utils/sanitizeString";
import { dbConnection } from "../../utils/dbConnection";
import { Project } from "../../entity/project";
import { AdminAccountService } from "./AdminAccountService";

@Service()
export class AdminProjectService {
    constructor(
        @Inject()
        private readonly adminAccountService: AdminAccountService
    ) {
    }

    async list(skip: number, limit: number, accountId: number, searchStr?: string) {
        try {

            const accountDetails = await this.adminAccountService.getAccountDetails(accountId);
            if (!accountDetails) {
                throw new APIError('Account not found', RESPONSE_STATUS.NOT_FOUND);
            }

            let sanitizedStr: string = '';

            if (searchStr) {
                sanitizedStr = sanitizeString(searchStr);
            }

            const schemaName = `${process.env.DB_INITIAL}_${accountDetails.shortCode}`


            const dataSource = await dbConnection()

            let query = `select 
                            p.id,
                            p."projectName", 
                            p."clientName", 
                            p.description, 
                            usr."firstName" || ' ' || usr."lastName" as "createdBy",
                            p."createdAt"  
                            FROM ${schemaName}.project p
                            LEFT JOIN ${process.env.DB_SCHEMA}.user usr on usr.id = p."createdBy"
                            `

            if (sanitizedStr) {
                query += ` where p."projectName" ilike '%${sanitizedStr}%'`
            }

            query += ` order by p."createdAt" DESC limit ${limit} offset ${skip}`

            const projects: Project[] = await dataSource.query(query)

            const total = projects.length

            return { total, projects }


        } catch (err) {
            logger.error('Admin::Service Project::List')
            logger.error(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}
