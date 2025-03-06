import multer from "multer";
import path from "path";
import {
    Authorized,
    Body,
    Controller,
    CurrentUser,
    Post,
    Res,
    UploadedFiles,
    Get,
    Params,
    UseBefore,
    QueryParam,
    QueryParams,
    Delete
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { UserAccountView, UserRoles } from "../types";
import { APIError } from "../utils/APIError";
import { DocumentService } from "../services/DocumentService";
import { Response } from "express";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { CheckUserProjectAccess } from "../middleware/checkUserProjectAccess";
import BlobService from "../services/BlobService";


@Controller('/documents')
@Service()
export class DocumentsController {
    constructor(
        @Inject()
        private readonly documentService: DocumentService,
        @Inject()
        private readonly blobSerivce: BlobService
    ) { }


    @Post('/upload')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async upload(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Body({ required: true }) { projectId }: { projectId: number },
        @Res() response: Response,
        @UploadedFiles('files', {
            options: {
                storage: multer.diskStorage({
                    destination: path.join(__dirname, '../../public/assets'),
                    filename: (_, file, cb) => {
                        cb(
                            null,
                            `${Date.now()}_${file.originalname
                                .replace(/[^a-zA-Z0-9\.]/g, '')
                                .replace(/\s+/g, '_')}`
                        );
                    },
                }),
                fileFilter: async (_req: any, file: any, cb: any) => {
                    if (
                        !['application/pdf'].includes(
                            file.mimetype
                        )
                    ) {
                        return cb(new APIError('Only pdf files are allowed', 400));
                    }
                    return cb(null, true);
                },
                limits: {
                    files: 10,
                    fieldNameSize: 255,
                    fileSize: 20 * 1024 * 1024, // 20MB
                    fieldSize: Infinity,
                },
            },
            required: true,
        })
        files?: any
    ) {
        if (Array.isArray(files) && files.length === 0) {
            return new APIError('Files are required.', 400);
        }
        console.log("Files upload on local storage!")

        const docuemnts = await this.documentService.uploadDocuments(files, projectId, user)

        return response.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Documents uploaded successfully!",
            data: { docuemnts }
        })

    }

    @Get('/list/:projectId')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    @UseBefore(CheckUserProjectAccess())
    async list(
        @Params({ required: true }) { projectId }: { projectId: number },
        @CurrentUser({ required: true }) user: UserAccountView,
        @Res() res: Response
    ) {
        const documents = await this.documentService.list(projectId, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!",
            data: documents
        })

    }

    @Get('/view')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner, UserRoles.contributor])
    async generateSASURL(
        @CurrentUser() user: UserAccountView,
        @QueryParams({ required: true })
        { blobPath }: { blobPath: string },
        @Res() res: Response
    ) {
        try {
            const blobUrl = await this.blobSerivce.generateSASURL(`${user.shortCode}/${blobPath}`);
            return res.redirect(blobUrl); // Ensure this is the only response method called
        } catch (error) {
            console.error('Error generating SAS URL:', error);
            res.status(500).json({ error: 'Failed to generate SAS URL' }); // Fallback error response
        }

    }

    @Get('/details/:docId')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner, UserRoles.contributor])
    async getDocumentDetails(
        @CurrentUser() user: UserAccountView,
        @Params({ required: true }) { docId }: { docId: number },
        @Res() res: Response
    ) {
        const documentDetails = await this.documentService.getDocumentDetails(docId, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully fetched!",
            data: documentDetails
        })
    }

    @Delete('/delete/:docId/:projectId')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async deleteDocument(
        @CurrentUser() user: UserAccountView,
        @Params({ required: true }) { docId, projectId }: { docId: number, projectId: number },
        @Res() res: Response
    ) {
        const isDeleted = await this.documentService.deleteDocument(docId, projectId, user)
        if (!isDeleted) {
            return res.status(RESPONSE_STATUS.INTERNAL_SERVER_ERROR).send({
                status: false,
                msg: "Failed to delete document!",
            })
        }
        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Document deleted successfully!",
        })
    }
}
