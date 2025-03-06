import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DocumentAuditStatus } from "../types";
import { Audits } from "./audits";
import { Documents } from "./documents";

@Entity({ schema: 'iva_ca_template' })
export class AuditDocuments {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'enum',
        enum: DocumentAuditStatus,
        default: DocumentAuditStatus.NOT_STARTED,
        nullable: false
    })
    status: DocumentAuditStatus

    @ManyToOne(() => Audits, (audits) => audits.auditDocuments)
    @JoinColumn({ name: 'auditId' })
    audit: Audits;

    @Column({ nullable: false })
    auditId: number

    @ManyToOne(() => Documents, (documents) => documents.auditDocuments)
    @JoinColumn({ name: 'documentId' })
    document: Documents;

    @Column({ nullable: false })
    documentId: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}