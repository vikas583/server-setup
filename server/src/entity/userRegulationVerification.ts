import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { UserRegulationVerificationStatus } from "../types";
import { User } from "./user";
import { Regulations } from "./regulations";
import { Account } from "./account";

@Entity({ schema: 'iva_ca_template' })
export class UserRegulationVerification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.userRegulationVerification)
    @JoinColumn({ name: "addedBy" })
    user!: User;

    @ManyToOne(() => Account, (account) => account.userRegulationVerification)
    @JoinColumn({ name: "accountId" })
    account!: Account;

    @Column({ nullable: false })
    accountId: number

    @ManyToOne(() => Regulations, (reg) => reg.userRegulationVerificaiton)
    @JoinColumn({ name: "regulationId" })
    regulation!: Regulations;

    @Column({ nullable: false })
    regulationId: number

    @Column({ nullable: false })
    docUrl: string;

    @Column({
        type: 'enum',
        enum: UserRegulationVerificationStatus,
        default: UserRegulationVerificationStatus.PENDING,
        nullable: false
    })
    status: UserRegulationVerificationStatus;

    @Column({ nullable: false })
    addedBy: number;


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}
