import { Inject, Service } from "typedi";
import { AdminAccountService } from "./AdminAccountService";
import { APIError } from "../../utils/APIError";
import logger from "../../utils/logger";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { dbConnection } from "../../utils/dbConnection";
import { sanitizeString } from "../../utils/sanitizeString";
import { AuditDocuments } from "../../entity/auditDocuments";


@Service()
export class AdminAuditService {

    constructor(
        @Inject()
        private readonly adminAccountService: AdminAccountService
    ) {

    }

    async list(skip: number, limit: number, accountId: number, projectId?: number, searchStr?: string) {
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


            let query = `
                            select 
                            ad."auditId",
                            ad."documentId",
                            ad."createdAt",
                            ad.status as "auditStatus",
                            d.status as "documentStatus",
                            d.name as "documentName"
                            from 
                            ${schemaName}.audit_documents ad
                            LEFT JOIN
                            ${schemaName}.documents d on d.id = ad."documentId"
                        `

            if (projectId?.toString() !== "undefined") {
                query += ` where d."projectId" = ${projectId}`
            }
            if (sanitizedStr) {
                if (projectId?.toString() !== "undefined") {
                    query += ` and d."name" ilike '%${sanitizedStr}%'`
                } else {
                    query += ` where d."name" ilike '%${sanitizedStr}%'`
                }
            }

            query += ` order by ad."createdAt" DESC limit ${limit} offset ${skip}`

            const auditDocuments: AuditDocuments[] = await dataSource.query(query)

            const total = auditDocuments.length

            return { total, auditDocuments }
        } catch (err) {
            logger.error('Admin::Service Project::List')
            console.log(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

}