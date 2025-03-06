import { Service } from "typedi";
import { dbConnection } from "../../utils/dbConnection";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { Regulations } from "../../entity/regulations";
import { RegulationCreateRequest } from "../../admin-types";
import { logger } from "@azure/keyvault-secrets";
import { sanitizeString } from "../../utils/sanitizeString";
import { RegulationDetails } from "../../entity/regulationDetails";

@Service()
export class AdminRegulationService {
    constructor() { }


    async create(body: RegulationCreateRequest, adminId: number) {
        try {

            const dataSource = await dbConnection()

            const ifRegulationNameAlreadyExist = await dataSource.getRepository(Regulations).findOne({
                where: {
                    name: body.name.toUpperCase()
                }
            })

            if (ifRegulationNameAlreadyExist) {
                throw new APIError('Regulation with this name already exist!', RESPONSE_STATUS.CONFLICT)
            }
            const regulationObj = new Regulations()
            regulationObj.addedBy = adminId
            regulationObj.name = body.name.toUpperCase()
            regulationObj.version = body.version
            regulationObj.regVersion = Number(body.regVersion)
            const isCreated = await dataSource.getRepository(Regulations).save(regulationObj)

            if (isCreated) {
                return true
            }
            throw new APIError("Something went wrong, try again later!", RESPONSE_STATUS.INTERNAL_SERVER_ERROR)


        } catch (err) {
            logger.error('Admin::Service Regulation::Create')
            logger.error(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async list(skip: number, limit: number, searchStr?: string) {
        try {
            let sanitizedStr: string = '';

            if (searchStr) {
                sanitizedStr = sanitizeString(searchStr);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(Regulations, 'reg');

            if (sanitizedStr) {
                qb.where('reg.name ilike :name', {
                    name: `%${sanitizedStr.toUpperCase()}%`,
                })
            }

            const total = await qb.clone().getCount();
            const regulations = await qb
                .select([
                    'reg.id as id',
                    'reg.name as name',
                    'reg.version as version',
                    'reg."regVersion" as "regVersion"',
                    'reg."isActive" as "isActive"',
                    'reg."createdAt" as "createdAt"',
                    'COUNT(regd.id) AS "regulationDetailsCount"'
                ])
                .leftJoin(RegulationDetails, 'regd', 'regd."regulationId" = reg.id')
                .groupBy('reg.id')
                .orderBy('reg."createdAt"', 'DESC')
                .limit(Number(limit))
                .offset(Number(skip))
                .getRawMany();


            return {
                regulations,
                total,
            };

        } catch (err) {
            logger.error('Admin::Service Regulation::List')
            logger.error(err)
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async activateInactivate(regulationId: number, status: boolean) {

    }

}