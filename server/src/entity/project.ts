import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
import { Documents } from "./documents";
import { UserProjectAccess } from "./userProjectAccess";
import { ProjectRegulation } from "./projectRegulation";
import { Audits } from "./audits";

@Entity({ schema: 'iva_ca_template' })
export class Project {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    projectName: string

    @Column({ nullable: true })
    description: string

    @Column({ nullable: false })
    clientName: string

    @ManyToOne(() => User, (user) => user.project)
    @JoinColumn({ name: 'createdBy' })
    added: User;

    @Column({ nullable: false })
    createdBy: number

    // One-to-Many relationship with ProjectRegulationDetail
    @OneToMany(() => ProjectRegulation, (projectRegulation) => projectRegulation.project)
    projectRegulation: ProjectRegulation[];

    // One-to-Many relationship with Documents
    @OneToMany(() => Audits, (audits) => audits.project)
    projectAudits: Audits[]

    // One-to-Many relationship with Documents
    @OneToMany(() => Documents, (documents) => documents.project)
    projectDocuments: Documents[]

    // One-to-Many relationship with user project access
    @OneToMany(() => UserProjectAccess, (userProjectAccess) => userProjectAccess.project)
    userProjectAccess: UserProjectAccess[];

    @Column({ nullable: false, default: false })
    isArchive: boolean

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}
