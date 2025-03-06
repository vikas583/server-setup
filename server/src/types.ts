import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotIn,
  IsArray,
  IsEmail,
} from "class-validator";

export class LoginRequest {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class SignupRequest {
  @IsString()
  companyName: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}

export enum UserRoles {
  account_owner = "account_owner",
  project_owner = "project_owner",
  contributor = "contributor",
}

export type TokenData = {
  email: string;
  accountId: number;
  role: UserRoles;
};

export interface QueueRequest {
  task: string;
  url: string;
}

export interface QueueResponse {
  // Define the structure of the response object here
  data: any;
  error?: string;
}

export type LoginUserResponse = {
  id: number;
  accountId: number;
  isBlocked: boolean;
  isDeleted: boolean;
  password: string;
  email: string;
  role: UserRoles;
  name: string;
  accountIsActive: boolean;
  isFirstLogin: boolean;
  lastLoginAt: Date;
  isLoggedIn: boolean;
  isMFAEnabled: boolean;
  isMFAStepCompleted: boolean;
  isBillingInfoCompleted: boolean;
  isUserInfoCompleted: boolean;
  isPasswordResetCompleted: boolean;
  isPrimaryAccountOwner: boolean;
  failedLoginAttempts: number;
  loginLockedUntil: Date;
  loginLockCycles: number;
};

export class AddCustomerRequest {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsNumber()
  accountId: number;

  @IsNumber()
  roleId: number;
}

export class UpdateAccountStatusRequest {
  @IsNumber()
  accountId: number;

  @IsBoolean()
  isActive: boolean;
}

export type TempTokenData = {
  id: number;
  type: string;
};

export type ResetPasswordTokenData = {
  email: string;
};

export enum CreatedByType {
  USER = "user",
  ADMIN = "admin",
}

export interface UserAccountView {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  createdAt: string;
  isBlocked: boolean;
  isDeleted: boolean;
  isLoggedIn: boolean;
  accountId: number;
  accountName: string;
  accountIsActive: boolean;
  accountCreatedAt: string;
  shortCode: string;
  userRole: UserRoles;
  isUserInfoCompleted: boolean;
  isPasswordResetCompleted: boolean;
  isBillingInfoCompleted: boolean;
  isMFAStepCompleted: boolean;
  profilePicUrl?: string;
  isPrimaryAccountOwner: boolean;
  isFirstLogin: boolean;
}

export class ProjectCreationRequest {
  @IsString()
  projectName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  clientName: string;

  @IsArray()
  @IsOptional()
  collaborators: Collaborator[];

  @IsArray()
  regulations: RegulationCreateProjectRequest[];
}

export class SkipLimitURLParamsUser {
  // @Matches(/^\d+$/)
  skip!: string;

  // @Matches(/^\d+$/)
  @IsNotIn(["0"])
  limit!: string;
}

export class SkipLimitSearchParamsUser extends SkipLimitURLParamsUser {
  @IsOptional()
  @IsString()
  query?: string;
}

export class ParamRegulationDetailList {
  query?: string;
  regulationId!: string;
}

export enum RegulationCategoryType {
  GUIDELINE = "GUIDELINE",
  REGULATION = "REGULATION",
}

export type Collaborator = {
  id: number;
  name: string;
  email: string;
};

export type RegulationCreateProjectRequest = {
  id: number;
  name: string;
  scope: string;
  regulationDetails: number[];
};

export enum ProjectRegulationScope {
  FULL_SCOPE = "Full",
  REDUCED_SCOPE = "Reduced Scope",
}

export enum FeedbackFormType {
  DASHBOARD = "dashboard",
  PROJECT = "project",
  AUDIT = "audit",
}

export enum FeedbackFormQuestionType {
  RATING = "RATING",
  TEXT = "TEXT",
}

export enum EmbeddingChunkType {
  TEXT = "text",
  IMAGE = "image",
}

export type FeedbackResp = {
  questionId: number;
  response: string;
  feedbackId: number;
};

export class FeedbackCaptureRequest {
  @IsArray()
  feedbackResp: FeedbackResp[];
}

export enum DocumentAuditStatus {
  NOT_STARTED = "Not Started",
  QUEUED = "Queued",
  PROCESSING = "Processing",
  AUDIT_GENERATED = "Audit Generated",
  ERROR = "Error",
}


export class InitialUserUpdateRequest {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  position?: string;
}

export enum UserInitialSteps {
  UPDATE_USER_INITIALS = "UPDATE_USER_INITIALS",
  UPDATE_BILLING_DETAILS = "UPDATE_BILLING_DETAILS",
  SETUP_PASSWORD = "SETUP_PASSWORD",
  SETUP_MFA = "SETUP_MFA",
  ENTER_MFA = "ENTER_MFA",
  SETUP_DONE = "SETUP_DONE",
  OPEN_DASHBOARD = "OPEN_DASHBOARD",
}

export type RecentAuditResponse = {
  status: DocumentAuditStatus;
  projectName: string;
  regulationName: string;
  createdAt: string;
};

export class InitialBillingInfoUpdateRequest {
  @IsString()
  companyName: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  addressLine2: string;

  @IsString()
  country: string;

  @IsOptional()
  co: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;
}

export class InitialSetPasswordRequest {
  @IsString()
  password: string;
}

export class CreateUserRequest {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  roleId: number;
}

export class SendPasswordResetLinkRequest {
  @IsString()
  @IsEmail()
  email: string;
}

export class ResetPasswordRequest {
  @IsString()
  token: string;

  @IsString()
  password: string;
}

export class ResetPasswordRequest2FA {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

export class UpdateProjectRequest {
  @IsNumber()
  projectId: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  clientName: string;

  @IsString()
  @IsOptional()
  projectName: string;

  @IsOptional()
  @IsArray()
  collaboratorsAdded: number[];

  @IsOptional()
  @IsArray()
  collaboratorsDeleted: number[];
}

export class ArchiveProjectRequest {
  @IsNumber()
  projectId: number;

  @IsBoolean()
  archive: boolean;
}

export enum UserRegulationVerificationStatus {
  PENDING = "Pending",
  INPROGRESS = "In Progress",
  READY_TO_USE = "Ready to use",
  OUT_OF_DATE = "Out-of-date",
}

export type RegulationVerification = {
  id: number;
  name: string;
  version: string;
  category: RegulationCategoryType;
  count: string;
  status: UserRegulationVerificationStatus;
};

export class UpdateProjectScope {
  @IsNumber()
  projectId: number;

  @IsNumber()
  projectRegulationId: number;

  @IsOptional()
  @IsArray()
  regulationDetailsAdded: number[];

  @IsOptional()
  @IsArray()
  regulationDetailsDeleted: number[];
}

export enum DocumentType {
  PROJECT = "PROJECT",
  REGULATION_VERIFICATION = "REGULATION_VERIFICATION",
}

export class UpdateUserDetails {
  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsOptional()
  roleId: number;
}

export enum DocumentStatus {
  NOT_STARTED = "Not Started",
  PROCESSING = "Processing",
  FINISHED = "Finished",
  ERROR = "Error",
}

export class StartAuditRequest {
  @IsNumber()
  auditId: number;

  @IsNumber()
  documentId: number;
}

export enum PlaybookNotificationStatus {
  PROCESSING = "Processing",
  COMPLETED = "Completed",
  ERROR = "Error",
}

export class ResetPasswordRequestLoggedInUser {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}

export type DocumentDetailsForEmailNotification = {
  id: number;
  name: string;
  uploadedByUsername: string;
  uploadedByEmail: string;
  projectName: string;
};

export type DocumentDetailsForAuditGeneratedEmailNotification = {
  documentId: number;
  auditId: number;
  documentName: string;
  projectName: string;
  uploadedByEmail: string;
  uploadedByUsername: string;
}
