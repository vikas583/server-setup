import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Admin } from "./admin";


@Entity({ schema: process.env.DB_SCHEMA })
export class AdminLogs {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Admin, (admin) => admin.adminLogs)
    @JoinColumn({ name: 'adminId' })
    admin: Admin;

    @Column({ nullable: false })
    adminId: number

    @Column({ nullable: false })
    log: string

    @Column({ nullable: false })
    requestType: string

    @Column({ nullable: true })
    requestBody: string

    @Column({ nullable: true })
    comment: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

}

