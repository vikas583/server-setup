import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RegulationDetails } from "./regulationDetails";
import { Admin } from './admin'
import { RegulationCategoryType } from '../types'
import { ProjectRegulation } from "./projectRegulation";
import { UserRegulationVerification } from "./userRegulationVerification";




@Entity({ schema: process.env.DB_SCHEMA })
export class Regulations {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    regVersion: number;

    @Column({ nullable: false })
    version: string;

    @OneToMany(() => RegulationDetails, (regulationDetail) => regulationDetail.regulation)
    regulationDetails: RegulationDetails[]

    @OneToMany(() => UserRegulationVerification, (usrRegVerification) => usrRegVerification.regulation)
    userRegulationVerificaiton: UserRegulationVerification[]

    @ManyToOne(() => Admin, (admin) => admin.regulations)
    @JoinColumn({ name: 'addedBy' })
    added: Admin;

    @Column({
        type: 'enum',
        enum: RegulationCategoryType,
        default: RegulationCategoryType.REGULATION, // Set a default value if needed
    })
    category: RegulationCategoryType;

    @OneToMany(() => ProjectRegulation, (projectRegulation) => projectRegulation.regulation)
    projectRegulation: ProjectRegulation[];

    @Column({ nullable: false })
    addedBy: number

    @Column({ nullable: false, default: false })
    isActive: boolean

    @Column({ nullable: false, default: true })
    isVerificationRequired: boolean

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

}