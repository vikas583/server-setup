import axios from "axios";
import { Service } from "typedi";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";

@Service()
export class TotpService {
    private client = axios.create({
        baseURL: process.env.TOTP_BASE_URL,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 2 * 60 * 1000, // 2mins timeout
    });

    constructor() { }

    async generateTotp(
        userId: number,
        email: string
    ) {
        try {
            const { data } = await this.client.post<{
                secret: string,
                qr_code: string
            }>('/generate-totp', {
                "api_key": process.env.TOTP_API_KEY,
                "user_id": userId.toString(),
                "user_email": email
            })

            return data
        } catch (error: any) {
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

    }

    async verifyTotp(userId: number, token: string) {
        try {
            const { data } = await this.client.post<{
                valid: boolean,
            }>('/verify-totp', {
                "api_key": process.env.TOTP_API_KEY,
                "user_id": userId.toString(),
                "token": token
            })

            return data
        } catch (error: any) {
            console.log(error)
            throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }
    }
}