import { BeforeInsert, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
import { generateUniqueShortCode } from '../utils/generateUniqueShortCode'
import { UserRegulationVerification } from "./userRegulationVerification";


@Entity({ schema: process.env.DB_SCHEMA })
export class Account {
    @PrimaryGeneratedColumn()
    @Index()
    id: number

    @Column({ nullable: false, unique: true })
    @Index()
    name: string;

    @Column({ unique: true })
    shortCode: string

    @Column({ nullable: true })
    companyName: string

    //one account can have multiple users.
    @OneToMany(() => User, (user) => user.account)
    user: User[]

    @OneToMany(() => UserRegulationVerification, (usrRegVerification) => usrRegVerification.account)
    userRegulationVerification: UserRegulationVerification[]

    @Column({ nullable: true })
    addressLine1: string;

    @Column({ nullable: true })
    addressLine2: string

    @Column({ nullable: true })
    co: string

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column({ nullable: false, default: false })
    isBillingInfoCompleted: boolean

    @Column({ nullable: false, default: false, comment: "Account won't be marked active untill or unless it contains atleast one user." })
    isActive: Boolean

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @BeforeInsert()
    async setShortCode() {
        this.shortCode = await generateUniqueShortCode();
    }

}