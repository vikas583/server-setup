import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolePermissions } from "./rolePermissions";
import { AdminRolePermissions } from "./AdminRolePermissions";


@Entity({ schema: process.env.DB_SCHEMA })
export class AdminPermissions {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => AdminRolePermissions, (adminRolePermission) => adminRolePermission.adminPermissionId)
    adminRolePermission: RolePermissions[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}