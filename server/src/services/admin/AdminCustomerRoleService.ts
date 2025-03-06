import { Service } from "typedi";
import { dbConnection } from "../../utils/dbConnection";
import { Roles } from "../../entity/roles";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";

@Service()
export class AdminCustomerRoleService {


    async getRoles() {
        try {
            const dataSource = await dbConnection()
            const roles = await dataSource.getRepository(Roles).find({
                select: ['id', 'name', 'description']
            })

            return roles
        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async getRole(roleId: number) {
        const dataSource = await dbConnection()
        const role = await dataSource.getRepository(Roles).find({
            select: ['id', 'name', 'description'],
            where: {
                id: roleId
            }
        })

        return role
    }
}