import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolePermissions } from "./rolePermissions";
import { AdminRoles as adminRolesType } from "../admin-types";
import { AdminRolePermissions } from "./AdminRolePermissions";
import { Admin } from './admin'


@Entity({ schema: process.env.DB_SCHEMA })
export class AdminRoles {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    name: adminRolesType;

    @Column({ nullable: true })
    description: string

    @OneToMany(() => Admin, (admin) => admin.adminRole)
    admin: Admin

    @OneToMany(() => AdminRolePermissions, (adminRolePermission) => adminRolePermission.adminRoleId)
    adminRolePermission: RolePermissions[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}