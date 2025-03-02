import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { AdminRoles } from "./adminRoles";


@Entity({ schema: process.env.DB_SCHEMA })
export class Admin {
    @PrimaryGeneratedColumn()
    @Index()
    id: number

    @Column({ nullable: false })
    @Index()
    name: string;

    @Column({ nullable: false, unique: true })
    @Index()
    email: string

    @Column({ nullable: false })
    password: string

    @ManyToOne(() => AdminRoles, (adminRoles) => adminRoles.admin)
    @JoinColumn({ name: 'adminRoleId' })
    adminRole: AdminRoles;

    @Column({ nullable: false })
    adminRoleId: number

    @Column({ nullable: true, comment: "Refresh token" })
    @Index('refresh_token_idx')
    token: string

    @Column({ nullable: true })
    tokenExpiresAt: Date

    @Column({ nullable: false, default: false })
    isBlocked: Boolean

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @Column({ default: 0 })
    loginAttempts: number;

    @Column({ nullable: true })
    lastLoginAttempt: Date;

    @Column({ default: 0 })
    attemptCycles: number;
}