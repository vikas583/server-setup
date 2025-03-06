import { Service } from "typedi";
import { APIError } from "../../utils/APIError";
import { logger } from "@azure/keyvault-secrets";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { sanitizeString } from "../../utils/sanitizeString";
import { dbConnection } from "../../utils/dbConnection";
import { RegulationDetails } from "../../entity/regulationDetails";
import { ReglationDetailListResponse, RegulationDetailCreateRequest } from "../../admin-types";

@Service()
export class AdminRegulationDetailService {
    async create(body: RegulationDetailCreateRequest) {
        try {
            const dataSource = await dbConnection()

            const regDetailObj = []
            for (let i = 0; i < body.details.length; i++) {
                const obj = new RegulationDetails()
                obj.name = body.details[i].name
                obj.chapter = body.details[i].chapter
                obj.step = body.details[i].step
                obj.description = body.details[i].description
                obj.topic = body.details[i].topic
                obj.regulationId = body.details[i].regulationId

                regDetailObj.push(obj)
            }

            await dataSource.getRepository(RegulationDetails).save(regDetailObj)

            return true


        } catch (err) {
            logger.error('Admin::Service RegulationDetail::Create')
            logger.error(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async list(skip: number, limit: number, searchStr?: string, regulationId?: string) {
        try {
            let sanitizedStr: string = '';

            if (searchStr) {
                sanitizedStr = sanitizeString(searchStr);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(RegulationDetails, 'regd');

            if (sanitizedStr) {
                qb.where('regd.name ilike :name', {
                    name: `%${sanitizedStr}%`,
                })
            }
            if (regulationId) {
                if (sanitizedStr) {
                    qb.orWhere('regd."regulationId" = :id', {
                        id: Number(regulationId),
                    })
                } else {
                    qb.where('regd."regulationId" = :id', {
                        id: Number(regulationId),
                    })
                }
            }

            const total = await qb.clone().getCount();
            const regulationdetails = await qb
                .select([
                    'regd.id as id',
                    'regd.name as name',
                    'regd.step as step',
                    'regd.description as description',
                    'regd.chapter as chapter',
                    'regd.topic as topic',
                    'regd."regulationId" as "regulationId"'
                ])
                .groupBy('regd.id')
                .orderBy('regd."step"', 'ASC')
                .limit(Number(limit))
                .offset(Number(skip))
                .getRawMany<ReglationDetailListResponse>();


            return {
                total,
                regulationdetails,
            };
        } catch (err) {
            logger.error('Admin::Service RegulationDetail::List')
            logger.error(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}