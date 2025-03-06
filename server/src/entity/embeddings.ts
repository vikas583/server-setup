import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { EmbeddingChunkType } from "../types";

@Entity({ schema: 'iva_ca_template' })
export class Embeddings {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    userId: number

    @Column({ nullable: false })
    documentId: number

    @Column({ nullable: false })
    classfication: string

    @Column({
        type: 'enum',
        enum: EmbeddingChunkType,
        nullable: false,
    })
    chunkType: EmbeddingChunkType

    @Column({ nullable: false })
    embedModel: string

    @Column({ nullable: true })
    pgNo: number

    @Column({ nullable: true })
    chapter: number

    @Column({ nullable: true })
    sentenceNo: number

    @Column({ nullable: true })
    sentenceLength: number

    @Column({ nullable: true })
    sentence: string

    @Column({
        type: 'jsonb',
        nullable: true,
        array: false
    })
    vector: number[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}   