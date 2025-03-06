import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "./account";
import { Roles } from "./roles";
import { Project } from "./project";
import { CreatedByType } from "../types";
import { UserProjectAccess } from "./userProjectAccess";
import { UserFeedback } from "./userFeedback";
import { Documents } from "./documents";
import { UserRegulationVerification } from "./userRegulationVerification";
// import { UserRoles } from "./userroles";

@Entity({ schema: process.env.DB_SCHEMA })
export class User {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false, unique: true })
  @Index()
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  passwordUpdatedAt: Date;

  @Column({ nullable: true })
  position: string;

  @OneToMany(
    () => UserProjectAccess,
    (userProjectAccess) => userProjectAccess.user
  )
  userProjectAccess: UserProjectAccess[];

  @OneToMany(() => UserFeedback, (userFeedback) => userFeedback.user)
  userFeedback: UserFeedback[];

  @ManyToOne(() => Roles, (roles) => roles.userRole)
  @JoinColumn({ name: "roleId" })
  role: Roles;

  @Column({ nullable: false })
  roleId: number;

  @ManyToOne(() => Account, (account) => account.user)
  @JoinColumn({ name: "accountId" })
  account!: Account;

  @Column({ nullable: false })
  accountId: number;

  @Column({ nullable: false, default: false })
  isBlocked: boolean;

  @Column({ nullable: false, default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedBy: number

  // this will be turned true only if user logged in
  @Column({ nullable: false, default: false })
  isLoggedIn: boolean;

  @Column({ nullable: false, default: false })
  isMFAEnabled: boolean;

  // as there can be multiple account the first user who will registered that will be the primary owner of the account.
  @Column({ nullable: false, default: false })
  isPrimaryAccountOwner: boolean;

  @Column({ nullable: false, default: false })
  isMFAStepCompleted: boolean;

  @Column({ nullable: false, default: true })
  isFirstLogin: boolean;

  @Column({ nullable: false, default: false })
  isUserInfoCompleted: boolean;

  @Column({ nullable: false, default: false })
  isPasswordResetCompleted: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  refreshAuthToken: string;

  @Column({ nullable: true })
  refreshAuthTokenExpiresAt: Date;

  @Column({ nullable: true, type: "varchar" })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: "timestamp" })
  passwordResetTokenExpiresAt: Date | null;

  @OneToMany(() => Project, (project) => project.added)
  project: Project[];

  @OneToMany(() => Documents, (documents) => documents.user)
  documents: Documents[];

  @OneToMany(
    () => UserRegulationVerification,
    (usrRegVerification) => usrRegVerification.user
  )
  userRegulationVerification: UserRegulationVerification[];

  @Column({
    type: "enum",
    enum: CreatedByType,
    default: CreatedByType.USER, // Default to 'user'
    nullable: false,
  })
  createdByType: CreatedByType;

  @Column({ type: "varchar", nullable: true })
  profilePicUrl: string | null;

  @Column({ nullable: false, default: 1 })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;

  @Column({ nullable: true, default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true, default: undefined })
  loginLockedUntil: Date;

  @Column({ nullable: true, default: 0 })
  loginLockCycles: number;
}
