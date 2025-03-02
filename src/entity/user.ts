import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Roles } from "./roles";


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


  @ManyToOne(() => Roles, (roles) => roles.userRole)
  @JoinColumn({ name: "roleId" })
  role: Roles;


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


  @Column({ nullable: true })
  refreshAuthToken: string;

  @Column({ nullable: true })
  refreshAuthTokenExpiresAt: Date;

  @Column({ nullable: true, type: "varchar" })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: "timestamp" })
  passwordResetTokenExpiresAt: Date | null;

  @Column({ type: "varchar", nullable: true })
  profilePicUrl: string | null;

  @Column({ nullable: false, default: 1 })
  createdBy: number;

  
  @Column({ nullable: true, default: 0 })
  failedLoginAttempts: number;
  
  @Column({ nullable: true, default: undefined })
  loginLockedUntil: Date;
  
  @Column({ nullable: true, default: 0 })
  loginLockCycles: number;

  @Column({ nullable: true })
  lastLoginAt: Date;
 
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;
}
