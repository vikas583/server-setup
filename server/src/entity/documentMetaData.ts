import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Documents } from "./documents";

@Entity({ schema: 'iva_ca_template' })

export class DocumentMetaData {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Documents, (documents) => documents.documentMetaData)
    @JoinColumn({ name: 'documentId' })
    documents: Documents;

    @Column({ nullable: false })
    documentId: number

    @Column({ nullable: false })
    key: string;

    @Column({ nullable: false })
    value: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}