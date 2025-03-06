import { Service } from "typedi";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import logger from "../utils/logger";
import { sanitizeString } from "../utils/sanitizeString";
import { dbConnection } from "../utils/dbConnection";
import { RegulationDetails } from "../entity/regulationDetails";

@Service()
export class RegulationDetailService {
    async list(regulationId: number, query?: string) {
        try {
            let sanitizedStr: string = '';

            if (query) {
                sanitizedStr = sanitizeString(query);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(RegulationDetails, 'regd');

            qb.where('regd."regulationId"=:regulationId', {
                regulationId
            })

            if (sanitizedStr) {
                qb.orWhere('regd.name ilike :name', {
                    name: `%${sanitizedStr}%`,
                }).orWhere('regd.description ilike :description', {
                    description: `%${sanitizedStr}%`
                }).andWhere('regd."isActive" = true')
            } else {
                qb.andWhere('regd."isActive"=true')
            }


            const regulationDetails = await qb.select([
                'regd.id as id',
                'regd.name as name',
                'regd.description as description',
                'regd.step as step',
                'regd.chapter as chapter',
                'regd."isActive" as "isActive"',
                'regd."createdAt" as "createdAt"',
                'regd."subChapterName" as "subChapterName"'
            ]).orderBy('CAST(SPLIT_PART(regd."chapter", \'.\', 1) AS INTEGER)', 'ASC')
                .addOrderBy('CAST(COALESCE(NULLIF(SPLIT_PART(regd."chapter", \'.\', 2), \'\'), \'0\') AS INTEGER)', 'ASC')
                .addOrderBy('CAST(NULLIF(SPLIT_PART(regd.step, \'.\', 1), \'\') AS INTEGER)', 'ASC')
                .addOrderBy('CAST(NULLIF(SPLIT_PART(regd.step, \'.\', 2), \'\') AS INTEGER)', 'ASC')
                .addOrderBy('CAST(COALESCE(NULLIF(SPLIT_PART(regd.step, \'.\', 3), \'\'), \'0\') AS INTEGER)', 'ASC')
                .getRawMany();

            return { regulationDetails }
        } catch (err: any) {
            logger.error('Server::Service RegulationDetail::List')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}