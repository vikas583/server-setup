import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permissions } from "./permissions";
import { Roles } from "./roles";


@Entity({ schema: process.env.DB_SCHEMA })
export class RolePermissions {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Permissions, (permissions) => permissions.rolePermission)
    @JoinColumn({ name: 'permissionId' })
    permission: Permissions;

    @Column({ nullable: false })
    permissionId: number

    @ManyToOne(() => Roles, (roles) => roles.rolePermission)
    @JoinColumn({ name: 'roleId' })
    role: Roles;

    @Column({ nullable: false })
    roleId: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}