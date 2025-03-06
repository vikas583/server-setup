import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Regulations } from "./regulations";
import { ProjectRegulationDetail } from "./projectRegulationDetails";

@Entity({ schema: process.env.DB_SCHEMA })
export class RegulationDetails {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    regulationId: number

    @Column({ nullable: false })
    step: string

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    description: string

    @Column({ nullable: false })
    chapter: string

    @Column({ nullable: false })
    topic: string

    @Column({ nullable: true })
    subChapterName: string

    @ManyToOne(() => Regulations, (regulation) => regulation.regulationDetails)
    @JoinColumn({ name: 'regulationId' })
    regulation: Regulations;

    @OneToMany(() => ProjectRegulationDetail, (projectRegulationDetail) => projectRegulationDetail.regulationDetail)
    projectRegulationDetails: ProjectRegulationDetail[];

    @Column({ nullable: false, default: true })
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

}
