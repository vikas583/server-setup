import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "./user";
import { Project } from "./project";

@Entity({ schema: 'iva_ca_template' })
export class UserProjectAccess {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.userProjectAccess)
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ nullable: false })
    userId: number

    @ManyToOne(() => Project, (project) => project.userProjectAccess)
    @JoinColumn({ name: "projectId" })
    project: Project;

    @Column({ nullable: false })
    projectId: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}