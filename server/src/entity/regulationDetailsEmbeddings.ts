import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { EmbeddingChunkType } from "../types";

@Entity({
    schema: process.env.DB_SCHEMA,
    synchronize: false
})
export class RegulationDetailsEmbeddings {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    classification: string

    @Column({
        type: 'enum',
        enum: EmbeddingChunkType,
        nullable: false,
    })
    chunkType: EmbeddingChunkType

    @Column({ nullable: false })
    embedModel: string

    @Column({ nullable: false })
    pgNo: number

    @Column({ nullable: false })
    chapter: string

    @Column({ nullable: false })
    sentenceNo: number

    @Column({ nullable: false })
    sentenceLength: number

    @Column({ nullable: false })
    sentence: string


    @Column({
        nullable: false,
    })
    vector: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

} 