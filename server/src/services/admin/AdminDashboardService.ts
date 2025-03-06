import { Service } from "typedi";
import { APIError } from "../../utils/APIError";
import { RESPONSE_STATUS } from "../../utils/ResponseStatus";
import { dbConnection } from "../../utils/dbConnection";
import { User } from "../../entity/user";
import { Account } from "../../entity/account";
import { Admin } from "../../entity/admin";

@Service()
export class AdminDashboardService {
    async dashboardCardCount() {
        try {
            const dataSource = await dbConnection()
            const userCount = await dataSource.getRepository(User).count()
            const adminCount = await dataSource.getRepository(Admin).count()
            const accountsCount = await dataSource.getRepository(Account).count()
            return { userCount, adminCount, accountsCount }

        } catch (err) {
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            console.log(err)
            throw new APIError(errorMessage, errorCode);
        }
    }
}