import { IsNotIn, IsNumber, IsString, Matches, IsOptional, IsBoolean, IsObject, IsArray, ValidateNested, IsEnum } from "class-validator";

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
