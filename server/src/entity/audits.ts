import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AuditDocuments } from "./auditDocuments";
import { Project } from "./project";
import { Results } from "./results";

@Entity({ schema: 'iva_ca_template' })
export class Audits {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    name?: string

    @ManyToOne(() => Project, (project) => project.projectAudits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: false })
    projectId: number


    @OneToMany(() => AuditDocuments, (auditDocuments) => auditDocuments.audit)
    auditDocuments: AuditDocuments[]

    @OneToMany(() => Results, (result) => result.audit)
    results: Results[]

    
    @Column({ nullable: false })
    createdBy: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}