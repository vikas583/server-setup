import {
    Authorized,
    Body,
    Controller,
    CurrentUser,
    Get,
    Params,
    Patch,
    Post,
    QueryParam,
    Res,
    UseBefore
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { Response } from "express"
import {
    ProjectCreationRequest,
    UserAccountView,
    UserRoles,
    SkipLimitURLParamsUser,
    ArchiveProjectRequest,
    UpdateProjectRequest,
    UpdateProjectScope
} from "../types";
import { ProjectService } from "../services/ProjectService";
import { validate } from "../middleware/validate";
import { projectCreationSchema, projectScopeEditSchema, projectUpdationSchema } from "../validation/projectValidation";


@Service()
@Controller('/project')
export class ProjectController {

    constructor(
        @Inject()
        private readonly projectService: ProjectService
    ) { }

    @Get('/list/:skip/:limit')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async list(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Params({ required: true }) { skip, limit }: SkipLimitURLParamsUser,
        @Res() res: Response,
        @QueryParam('query') query?: string,
        @QueryParam('isArchive') isArchive?: boolean,

    ) {

        const data = await this.projectService.userProjectList(skip, limit, user, query, isArchive)

        if (data?.projects) {
            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "Project list fetched successfully!",
                data
            })
        } else {
            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "No data found!",
            })
        }
    }

    @Post('/create')
    @Authorized([UserRoles.account_owner])
    @UseBefore(validate(projectCreationSchema))
    async create(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Res() res: Response,
        @Body() body: ProjectCreationRequest
    ) {
        await this.projectService.create(body, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Project created successfully!"
        })
    }

    @Get('/details/:projectId')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async details(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Params({ required: true }) { projectId }: { projectId: number },
        @Res() res: Response,
    ) {
        const data = await this.projectService.projectDetails(projectId, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Project Details fetched successfully!",
            data
        })
    }

    @Patch('/archive')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    async archive(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Body()
        body: ArchiveProjectRequest,
        @Res()
        res: Response,
    ) {
        await this.projectService.archive(body, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Project Updated Successfully!",
        })
    }

    @Patch('/update')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    @UseBefore(validate(projectUpdationSchema))
    async update(
        @CurrentUser({ required: true }) user: UserAccountView,
        @Res() res: Response,
        @Body() body: UpdateProjectRequest
    ) {
        const projectDetailsUpdated = await this.projectService.update(body, user)

        if (projectDetailsUpdated) {

            return res.status(RESPONSE_STATUS.SUCCESS).send({
                status: true,
                msg: "Updated successfully!"
            })
        } else {

            return res.status(RESPONSE_STATUS.INTERNAL_SERVER_ERROR).send({
                status: false,
                msg: "Something went wrong, try again later!"
            })
        }
    }

    @Patch('/update/scope')
    @Authorized([UserRoles.account_owner, UserRoles.project_owner])
    @UseBefore(validate(projectScopeEditSchema))
    async editScope(
        @Body()
        body: UpdateProjectScope,
        @CurrentUser()
        user: UserAccountView,
        @Res()
        res: Response
    ) {
        await this.projectService.updateScope(body, user)

        return res.status(RESPONSE_STATUS.SUCCESS).send({
            status: true,
            msg: "Successfully updated!"
        })


    }

}