import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ schema: process.env.DB_SCHEMA })
export class Settings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    key: string

    @Column({ nullable: false, unique: true })
    value: string
}