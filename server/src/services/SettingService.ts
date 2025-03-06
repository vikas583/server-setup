import { Service } from "typedi";
import { dbConnection } from "../utils/dbConnection";
import { Settings } from "../entity/settings";

@Service()
export class SettingService {
    async getValue(key: string) {
        const dataSource = await dbConnection()
        const result = await dataSource.getRepository(Settings).findOne({
            where: {
                key
            },
            select: ['value']
        })
        if (result) {
            return result.value
        } else {
            return
        }
    }
}