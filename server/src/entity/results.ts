import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Audits } from "./audits";

@Entity({ schema: 'iva_ca_template' })
export class Results {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Audits, (audits) => audits.results)
    @JoinColumn({ name: 'auditId' })
    audit: Audits;

    @Column({ nullable: false })
    auditId: number

    @Column({ type: 'jsonb', nullable: false })
    result: any;

    @Column({ nullable: false })
    createdBy: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}