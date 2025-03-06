import { Service } from "typedi";
import logger from "../utils/logger";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { dbConnection } from "../utils/dbConnection";
import { Regulations } from "../entity/regulations";
import { sanitizeString } from "../utils/sanitizeString";
import { RegulationVerification, UserAccountView } from "../types";

@Service()
export class RegulationService {

    async list(skip: number, limit: number, query?: string) {
        try {
            let sanitizedStr: string = '';

            if (query) {
                sanitizedStr = sanitizeString(query);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(Regulations, 'reg');

            if (sanitizedStr) {
                qb.where('reg.name ilike :name', {
                    name: `%${sanitizedStr}%`,
                }).orWhere('acc.version ilike :version', {
                    version: `%${sanitizedStr}%`
                }).andWhere('reg."isActive" = true')
            } else {
                qb.where('reg."isActive"=true')
            }

            const total = await qb.clone().getCount();

            const regulations = await qb.select([
                'reg.id as id',
                'reg.name as name',
                'reg.version as version',
                'reg."regVersion" as "regVersion"',
                'reg."isActive" as "isActive"',
                'reg."createdAt" as "createdAt"',
                'reg.category as category',
            ]).orderBy('reg."id"', 'ASC')
                .limit(Number(limit))
                .offset(Number(skip))
                .getRawMany();

            return { total, regulations }

        } catch (err: any) {
            logger.error('Server::Service Regulation::List')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async requiredVerificationList(user: UserAccountView) {
        try {
            const SCHEMA_NAME = `${process.env.DB_INITIAL}_${user.shortCode}`


            const dataSource = await dbConnection()

            const result: RegulationVerification[] = await dataSource.query(`
                            select r.id, r.name, r.version, r.category,count(rd.id), urv.status from regulations r 
                            left join ${SCHEMA_NAME}.user_regulation_verification urv on urv."regulationId" = r.id 
                            join regulation_details rd ON r.id = rd."regulationId" where r."isVerificationRequired" = true 
                            and r."isActive" = true group by rd."regulationId" , r.id,urv.status ;
                        `)

            return result


        } catch (err) {
            logger.error('Server::Service Regulation::VerificationList')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

}