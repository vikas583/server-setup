import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolePermissions } from "./rolePermissions";
import { UserRoles } from "../types";
import { User } from "./user";


@Entity({ schema: process.env.DB_SCHEMA })
export class Roles {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    name: UserRoles;

    @Column({ nullable: true })
    description: string

    @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.roleId)
    rolePermission: RolePermissions[]

    @OneToMany(() => User, (usr) => usr.role)
    userRole: User[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}