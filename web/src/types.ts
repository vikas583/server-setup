import { FieldErrors, UseFormRegister } from "react-hook-form"

export type LoginRequest = {
    email: string,
    password: string
}

export type LoginResponseWithMFA = {
    status: boolean
    msg: string
    tempToken: string
    nextStep: UserInitialSteps,
    mfaRequired: boolean
    isFirstLogin: boolean
}

export type LoginResponseWithoutMFA = {
    status: boolean,
    msg: string,
    data: {
        token: string,
        user: {
            id: number,
            name: string,
            email: string,
            role: string
        }
    }
}

export type RefreshTokenResponse = {
    status: Boolean,
    msg: string,
    data: {
        accessToken: string
    }
}


export interface LoginFormInputs {
    email: string;
    password: string;
}

export type ValidatedLoginResponseAfterMfa = {
    status: false,
    msg: string,
    data: {
        nextStep: UserInitialSteps,
        token: string,
        user: {
            id: number,
            name: string,
            email: string,
            role: string
        }
    }
}
export type ValidatedLoginResponseAfterMfaFirstTime = {
    status: boolean,
    msg: string,
    nextStep: UserInitialSteps

}
export type InitialPageUserInfo = {
    status: false,
    msg: string,
    data: {
        firstName: string,
        lastName: string,
        position: string,
        email: string,
    }
}
export type InitialPageBillingInfo = {

    status: boolean,
    msg: string,
    data: {
        id: number,
        companyName: string,
        addressLine1: string,
        addressLine2: string,
        co: string,
        city: string,
        state: string,
        country: string,
        postalCode: string,

    }
}

export type MFASetupResponse = {
    status: boolean,
    msg: string,
    data: {
        secret: string,
        qr_code: string
    }
}

export type LogoutResponse = {
    "status": boolean,
    "msg": string
}

export enum UserRoles {
    Contributor = "contributor",
    ProjectOwner = "project_owner",
    AccountOwner = "account_owner",
}

export interface RoleProtectedRouteProps {
    allowedRoles: UserRoles[]; // List of roles allowed for this route (based on enum)
    userRole: UserRoles; // Current user's role (based on enum)
}

export type Collaborators = {
    id?: number,
    name: string,
    email: string
}


export type CollaboratorsListResponse = {
    status: boolean,
    msg: string,
    data: Collaborators[]
}
export type BillingDetailsInfo = {
    status: boolean,
    msg: string,
    data: {
        id: number,
        companyName: string,
        addressLine1: string,
        addressLine2: string | null,
        co: string | null,
        city: string,
        state: string,
        country: string,
        postalCode: string
    }
}
export interface BillingDetailsInterface {
    id: number,
    companyName: string,
    addressLine1: string,
    addressLine2: string | null,
    co: string | null,
    city: string,
    state: string,
    country: string,
    postalCode: string

}

export interface CreateProjectFormInput {
    projectName: string,
    clientName: string,
    description?: string
    selectedRegulations: Number[];
    collaborators: any,
    regulations: any,
    isSelected?: boolean

}
export interface EditProjectDetails {
    projectName: string,
    clientName: string,
    description: string
    collaborators: Collaborators[],
}
export type StepProps = {
    register: UseFormRegister<CreateProjectFormInput>;
    errors: FieldErrors<CreateProjectFormInput>;
    setValue: any
    getValues: any
};

export type Regulations = {
    id: number,
    name: string,
    version: string,
    regVersion: number,
    isActive: boolean,
    createdAt: string,
    category: string
}

export type RegulationsListResponse = {
    status: boolean,
    msg: string,
    data: {
        total: number,
        regulations: Regulations[]
    }
}

export type RegulationDetails = {
    chapter: string,
    createdAt: string,
    description: string,
    id: 3,
    isActive: boolean,
    name: string,
    step: string,
    subChapterName: string
}


export type RegulationDetailsListResponse = {
    status: boolean,
    msg: string,
    data: { regulationDetails: RegulationDetails[] }
}

export type checkUserLoggedIn = {
    status: boolean,
    data: {
        id: number,
        name: string,
        email: string,
        role: string,
    }
}
export type userDetails = {
    id: number,
    name: string,
    email: string,
    role: string,
}

export type ProjectDetailsResponse = {

    status: boolean,
    msg: string,
    data: {
        id: 1,
        projectName: string,
        description: string,
        clientName: string,
        createdAt: string,
        documentsCount: string,
        isArchive: boolean,
        regulationId: number,
        collaborators: [
            {
                name: string,
                email: string,
            }
        ],
        projectRegulationDetails: number[],
        projectRegulationId: number,
        regulationName:string
    }


}
export type DocumentListingResponse = {

    data: [
        {
            id: number,
            name: string,
            docSize: string,
            status: string,
            uploadedBy: string,
            createdAt: string,
        }
    ]
}
export type DocumentListingData = {
    id: number,
    name: string,
    docSize: string,
    status: string,
    uploadedBy: string,
    createdAt: string,
}

export type User = {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    userRole: keyof typeof UserRolesDisplayListing,
    projects: string[]
}

export type UserListingResponse = {
    status: boolean,
    msg: string,
    data: User[]
}


export enum UserRolesDisplayListing {
    "contributor" = "Contributor",
    "project_owner" = "Project Owner",
    "account_owner" = "Account Owner",
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

export type InitialUserInfoRequest = {
    firstName?: string,
    lastName?: string,
    position?: string
}

export type InitialUserInfoResponse = {
    status: boolean,
    msg: string,
    nextStep: UserInitialSteps
}

export type InitialBillingInfoUpdateRequest = {
    companyName: string,
    addressLine1: string,
    addressLine2?: string,
    country: string,
    co?: string,
    city: string,
    state: string,
    postalCode: string
}

export type InitialBillingInfoUpdateResponse = {
    status: boolean,
    msg: string,
    nextStep: UserInitialSteps
}

export type InitialSetPasswordRequest = {
    password: string;
}

export type InitialSetPasswordResponse = {
    status: boolean,
    msg: string,
    data: {
        nextStep: UserInitialSteps,
        token: string,
        user: {
            id: number,
            name: string,
            email: string,
            role: string
        }
    }
}

export interface UserInfoFormData {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
}
export interface UserCreateFormData {
    firstName: string;
    lastName: string;
    email: string;
    roleId: number | string;
    userId?: number | undefined
}

export interface UserSetPasswordFormData {
    password: string;
    confirmPassword: string
    currentPassword?: string
}
export type UserCreateResponse = {

    status: boolean,
    msg: string,
    data: {
        firstName: string,
        lastName: string,
        email: string,
        roleId: number
    }


}
export type UserRoleResponse = {
    status: boolean,
    msg: string,
    data: UserRoleData[]
}
export type UserRoleData = {
    id: number,
    name: string
}

export interface userDetailsInfo {
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    companyName: string,
    profilePicUrl?: string | null

}
export type userDetailsInfoResponse = {
    status: false,
    msg: string,
    data: {
        firstName: string,
        lastName: string,
        email: string,
        role: string,
        companyName: string,
    }
}

export interface RegulationDetailCustomizeScope {
    open: boolean;
    onClose: () => void;
    onReceiveData: any,//(data[]: number) => void;
    dialogData: RegulationDetails[]; // Data passed from the parent
    optionalArgs?: any;
    isAddOrEdit: string
    scopeName?:string
}

export enum ProjectRegulationScope {
    FULL_SCOPE = "Full",
    REDUCED_SCOPE = "Reduced Scope",
}
export type RecentAuditResponse = {
    status: boolean,
    msg: string,
    data: [
        {
            status: string,
            projectName: string,
            regulationName: string,
            createdAt: string,
            projectId: number,
            auditId: number,
        }
    ]

}
export interface RecentAuditInterface {
    status: string,
    projectName: string,
    regulationName: string,
    createdAt: string,
}
export type RegulationsVerificationListResponse = {
    status: boolean,
    msg: string,
    data: [
        {
            id: number,
            name: string,
            version: string,
            category: string,
            count: string,
            status: string | null
        }
    ]
}
export interface RegulationsVerificationListInterface {
    id: number,
    name: string,
    version: string,
    category: string,
    count: string,
    status: string | null
}
export interface projectDetailsBodyData {
    projectId: Number,
    clientName: string,
    projectName: string,
    description: string,
    collaboratorsAdded: (number | undefined)[],
    collaboratorsDeleted: (number | undefined)[]

}
export interface projectScopeBodyData {
    projectId: number | undefined,
    projectRegulationId: number | undefined,
    regulationDetailsAdded: (number | undefined)[],
    regulationDetailsDeleted: (number | undefined)[]

}

export interface projectDocumentBodyData {
    docId: number | undefined,
    projectId: number | undefined,

}

export enum DocumentStatus {
    NOT_STARTED = "Not Started",
    PROCESSING = "Processing",
    FINISHED = "Finished",
    ERROR = "Error",
}
export enum AuditStatus {
    NOT_STARTED = "Not Started",
    PROCESSING = "Processing",
    AUDIT_GENERATED = "Audit Generated",
    ERROR = "Error",
    QUEUED = "Queued",
}

//Audit details types
export type AuditResult = {
    auditId: number;
    documentId: number;
    auditStatus: string;
    result: ResultDetails;
};

export type ResultDetails = {
    num_gaps: number;
    num_majors: number;
    num_minors: number;
    overall_summary: string,
    pagewise_audit: PagewiseAudit[];
};

export type PagewiseAudit = {
    page: PageDetails;
    result: string; // Detailed string with markdown-like formatting
    iso_name: string;
    subchapter_name: string;
};

export type PageDetails = {
    number: number;
    num_gaps: number;
    num_majors: number;
    num_minors: number;
};
export interface UploadDocumentData {
    projectId: number;
    files: File[];
}

export type DocumentDetailsResponse = {
    status: boolean,
    msg: string,
    data: DocumentDetails
}

export type DocumentDetails = {
    id: number,
    name: string,
    documentStatus: DocumentStatus,
    auditId: number,
    auditStatus: AuditStatus,
    docSize: number,
    uploadedBy: string,
    createdAt: string,
    docUrl: string,
    scopes: [
        {
            name: string,
            version: string
        }
    ]
}

export type AuditDetailsResponse = {
    status: boolean,
    msg: string,
    data: {
        auditId: number,
        documentId: number,
        auditStatus: AuditStatus,
        result: {
            num_gaps: number,
            num_majors: number,
            num_minors: number,
            pagewise_audit: AuditPagewiseAudit[],
            overall_summary: string
        }
    }
}

export type AuditPagewiseAudit = {
    page: {
        number: number,
        num_gaps: number,
        num_majors: number,
        num_minors: number
    },
    result: string,
    iso_name: string,
    subchapter_name: string
}
