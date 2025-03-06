import { Service } from "typedi";
import { sanitizeString } from "../../utils/sanitizeString";
import { dbConnection } from "../../utils/dbConnection";
import { Admin } from "../../entity/admin";
import { AdminRoles } from "../../entity/adminRoles";

@Service()
export class AdminService {
    constructor() { }

    async list(skip: string, limit: string, name?: string) {
        try {

            let sanitizedStr: string = '';

            if (name) {
                sanitizedStr = sanitizeString(name);
            }

            const dataSource = await dbConnection()

            const qb = dataSource.createQueryBuilder(Admin, 'admin');

            if (sanitizedStr) {
                qb.where('admin.name ilike :name', {
                    name: `%${sanitizedStr}%`,
                }).orWhere('admin.email ilike :email', {
                    email: `%${sanitizedStr}%`
                })
            }


            const total = await qb.clone().getCount();
            const users = await qb
                .leftJoinAndSelect(AdminRoles, 'adr', 'admin."adminRoleId" = adr.id')
                .select('admin.id,admin.name,admin.email,admin."isBlocked",admin."createdAt",adr.name as "adminRole"')
                .orderBy('admin."createdAt"', 'DESC')
                .limit(Number(limit))
                .offset(Number(skip))
                .getRawMany();

            return {
                users,
                total,
            };
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async create() {

    }

}