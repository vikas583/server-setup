import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permissions } from "./permissions";
import { Roles } from "./roles";
import { AdminPermissions } from "./adminPermissions";
import { AdminRoles } from "./adminRoles";


@Entity({ schema: process.env.DB_SCHEMA })
export class AdminRolePermissions {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => AdminPermissions, (adminPermissions) => adminPermissions.adminRolePermission)
    @JoinColumn({ name: 'adminPermissionId' })
    permission: Permissions;

    @Column({ nullable: false })
    adminPermissionId: number

    @ManyToOne(() => AdminRoles, (adminRoles) => adminRoles.adminRolePermission)
    @JoinColumn({ name: 'adminRoleId' })
    role: Roles;

    @Column({ nullable: false })
    adminRoleId: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}