import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project';
import { RegulationDetails } from './regulationDetails';
import { Regulations } from './regulations';
import { ProjectRegulation } from './projectRegulation';

@Entity({ schema: 'iva_ca_template' })
export class ProjectRegulationDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => RegulationDetails, (regulationDetail) => regulationDetail.projectRegulationDetails, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'regulationDetailId' })
    regulationDetail: RegulationDetails;

    @Column({ nullable: false })
    regulationDetailId: number

    @ManyToOne(() => ProjectRegulation, (projRegulation) => projRegulation.projectRegulationDetail, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectRegulationId' })
    projectRegulation: ProjectRegulation;

    @Column({ nullable: false })
    projectRegulationId: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}
