import { Service } from "typedi";
import { Roles } from "../entity/roles";
import { dbConnection } from "../utils/dbConnection";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";

@Service()
export class RoleService {
    async getRoles() {
        try {
            const dataSource = await dbConnection()
            const roles = await dataSource.getRepository(Roles).find({
                select: ['id', 'name']
            })

            return roles
        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async getRoleById(id: number) {
        try {
            const dataSource = await dbConnection()
            const role = await dataSource.getRepository(Roles).findOne({
                where: { id }
            })
            return role
        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }
}