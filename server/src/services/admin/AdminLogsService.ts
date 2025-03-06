import { Service } from "typedi";
import { dbConnection } from "../../utils/dbConnection";
import { AdminLogs } from "../../entity/adminLogs";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";

@Service()
export class AdminLogsService {
    async create(adminId: number, log: string, requestType: string, requestBody?: string, comment?: string) {
        try {
            const dataSource = await dbConnection()
            const adminLogObj = new AdminLogs()
            adminLogObj.adminId = adminId;
            adminLogObj.log = log
            adminLogObj.requestType = requestType
            if (requestBody) {
                adminLogObj.requestBody = requestBody
            }
            if (comment) {
                adminLogObj.comment = comment
            }

            await dataSource.getRepository(AdminLogs).save(adminLogObj)
            return true
        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}