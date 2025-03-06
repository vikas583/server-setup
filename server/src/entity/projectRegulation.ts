import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Project } from './project';
import { ProjectRegulationScope } from "../types"
import { Regulations } from './regulations';
import { ProjectRegulationDetail } from './projectRegulationDetails';

@Entity({ schema: 'iva_ca_template' })
export class ProjectRegulation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Project, (project) => project.projectRegulation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: false })
    projectId: number

    @ManyToOne(() => Regulations, (regulation) => regulation.projectRegulation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'regulationId' })
    regulation: Regulations;

    @Column({ nullable: false })
    regulationId: number

    @Column({
        type: 'enum',
        enum: ProjectRegulationScope,
        default: ProjectRegulationScope.FULL_SCOPE, // Set a default value if needed
    })
    scope: ProjectRegulationScope;

    @OneToMany(() => ProjectRegulationDetail, (projectRegulationDetail) => projectRegulationDetail.projectRegulation)
    projectRegulationDetail: ProjectRegulationDetail[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}
