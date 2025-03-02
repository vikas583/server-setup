import { Service } from "typedi";
import { AddCustomerRequest } from "../../types";

@Service()
export class AdminCustomerService {
    async create(body: AddCustomerRequest, adminId: number) {
    }
}