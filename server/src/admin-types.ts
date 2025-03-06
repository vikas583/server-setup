import { Type } from "class-transformer";
import { IsNotIn, IsNumber, IsString, Matches, IsOptional, IsBoolean, IsObject, IsArray, ValidateNested, IsEnum } from "class-validator";
import { FeedbackFormQuestionType, FeedbackFormType } from "./types";

export class AdminLoginRequest {
    @IsString()
    email: string;

    @IsString()
    password: string
}

export class AdminRegisterRequest {
    @IsString()
    name: string;

    @IsString()
    email: string

    @IsString()
    password: string;

    @IsNumber()
    adminRoleId: number;
}

export enum AdminRoles {
    ADMIN = "admin",
    EDITOR = "editor",
    VIEWER = "viewer"
}

export type AdminTokenData = {
    email: string;
    role: AdminRoles;
};



export class SkipLimitURLParams {
    @Matches(/^\d+$/)
    skip!: string;

    @Matches(/^\d+$/)
    @IsNotIn(['0'])
    limit!: string;
}

export class CreateAccountRequest {
    @IsString()
    accountName: string

    @IsOptional()
    addressLine1?: string;

    @IsOptional()
    city?: string

    @IsOptional()
    state?: string

    @IsOptional()
    country?: string

    @IsOptional()
    postalCode?: string
}

export class BlockCustomerRequest {
    @IsNumber()
    userId: number

    @IsBoolean()
    isBlocked: boolean
}

export class RegulationCreateRequest {

    @IsString()
    name: string

    @IsString()
    version: string

    @IsString()
    regVersion: string
}

export class Detail {
    @IsString()
    step: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    chapter: string;

    @IsString()
    topic: string;

    @IsNumber()
    regulationId: number
}

export class RegulationDetailCreateRequest {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Detail)
    details: Detail[];
}

export type ReglationDetailListResponse = {
    id: number,
    name: string,
    step: string,
    description: string,
    chapter: string,
    topic: string,
    regulationId: number
}

export class AdminFeedbackFormRequest {
    @IsEnum(FeedbackFormType)
    formType: FeedbackFormType
}

export class AdminFeedbackFormQuestionRequest {
    @IsString()
    question: string

    @IsEnum(FeedbackFormQuestionType)
    questionType: FeedbackFormQuestionType

    @IsNumber()
    feedbackId: number

    @IsNumber()
    @IsOptional()
    minRating: number

    @IsNumber()
    @IsOptional()
    maxRating: number
}