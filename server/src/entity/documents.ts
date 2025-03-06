import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Project } from "./project";
import { DocumentMetaData } from "./documentMetaData";
import { User } from "./user";
import { AuditDocuments } from "./auditDocuments";
import { DocumentType, DocumentStatus } from "../types";

@Entity({ schema: 'iva_ca_template' })
export class Documents {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Project, (project) => project.projectDocuments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ nullable: false })
    projectId: number

    @OneToMany(() => DocumentMetaData, (docMetaData) => docMetaData.documents)
    documentMetaData: DocumentMetaData[]

    @OneToMany(() => AuditDocuments, (auditDocuments) => auditDocuments.document)
    auditDocuments: AuditDocuments[]

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: false })
    docUrl: string

    @Column({ nullable: false })
    docSize: number

    // type of document like application/pdf
    @Column({ nullable: false })
    docType: string

    // type of document like what it's for project or regulation verification
    @Column({
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.PROJECT,
        nullable: false
    })
    type: DocumentType

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.NOT_STARTED,
        nullable: false
    })
    status: DocumentStatus

    @Column({ nullable: true, type: 'text' })
    markdown: string

    @ManyToOne(() => User, (user) => user.documents)
    @JoinColumn({ name: "uploadedBy" })
    user!: User;

    @Column({ nullable: false })
    uploadedBy: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}