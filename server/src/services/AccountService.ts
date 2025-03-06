import { Service } from "typedi";
import { Account } from "../entity/account";
import { InitialBillingInfoUpdateRequest, UserAccountView } from "../types";
import { APIError } from "../utils/APIError";
import { dbConnection } from "../utils/dbConnection";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import logger from "../utils/logger";

@Service()
export class AccountService {
    async updateBillingInfo(body: InitialBillingInfoUpdateRequest, user: UserAccountView) {
        try {
            const dataSource = await dbConnection()

            let obj: {
                companyName: string,
                addressLine1: string,
                country: string,
                city: string,
                state: string,
                postalCode: string,
                isBillingInfoCompleted: boolean,
                addressLine2?: string,
                co?: string,


            } = {
                isBillingInfoCompleted: true,
                companyName: body.companyName,
                addressLine1: body.addressLine1,
                country: body.country,
                city: body.city,
                state: body.state,
                postalCode: body.postalCode
            }

            if (body.addressLine2) obj.addressLine2 = body.addressLine2
            if (body.co) obj.co = body.co

            const updateBillingInfo = await dataSource.getRepository(Account).update(
                {
                    id: user.accountId
                },
                obj
            )

            if (!updateBillingInfo) throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)

            return
        } catch (err) {
            console.log(err)
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
    }

    async billingInfo(accountId: number) {
        try {
            const dataSource = await dbConnection()
            const accountDetails: Account | null = await dataSource.getRepository(Account).findOne({
                where: {
                    id: accountId
                },
                select: [
                    'id',
                    'companyName',
                    'addressLine1',
                    'addressLine2',
                    'city',
                    'co',
                    'state',
                    'country',
                    'postalCode'
                ]
            })

            if (!accountDetails) {
                throw new APIError('No account found!', RESPONSE_STATUS.BAD_REQUEST)
            }

            return accountDetails
        } catch (err) {
            logger.error('Server::Service Regulation::List')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

}