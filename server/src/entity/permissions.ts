import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolePermissions } from "./rolePermissions";


@Entity({ schema: process.env.DB_SCHEMA })
export class Permissions {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    name: string;

    @Column({nullable: false, unique: true})
    value: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => RolePermissions, (rolePermissions) => rolePermissions.permissionId)
    rolePermission: RolePermissions[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}