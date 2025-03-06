import { Service } from "typedi";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { ArchiveProjectRequest, ProjectCreationRequest, UpdateProjectRequest, UpdateProjectScope, UserAccountView, UserRoles } from "../types";
import { Project } from "../entity/project";
import { dbConnection } from "../utils/dbConnection";
import logger from "../utils/logger";
import { ProjectRegulation } from "../entity/projectRegulation";
import { UserProjectAccess } from "../entity/userProjectAccess";
const PROJECT_LIMIT = 2
const PROJECT_REGULATION_DETAIL_LIMIT = 5

@Service()
export class ProjectService {
    async create(body: ProjectCreationRequest, user: UserAccountView) {
        const dataSource = await dbConnection();
        const projectCount = await this.checkProjectCount(user)

        if (projectCount.count > PROJECT_LIMIT) {
            throw new APIError('You have reached the maximum number of projects!', RESPONSE_STATUS.BAD_REQUEST)
        }


        const queryRunner = dataSource.createQueryRunner();

        await queryRunner.startTransaction();

        try {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

            // Check if project name already exists within the transaction
            const checkIfProjectNameAlreadyTaken = await this.getProject(schemaName, 'projectName', body.projectName);

            if (checkIfProjectNameAlreadyTaken) {
                throw new APIError('Project with this name already exists!', RESPONSE_STATUS.CONFLICT);
            }



            // Insert project within the transaction
            const [createdProject]: Project[] = await queryRunner.manager.query(
                `INSERT INTO "${schemaName}".project("projectName", "description", "clientName", "createdBy", "createdAt")
                 VALUES ($1, $2, $3, $4, DEFAULT)
                 RETURNING "id", "createdAt", "updatedAt"`,
                [body.projectName.toLowerCase(), body.description, body.clientName, user.id]
            );

            if (!createdProject) {
                throw new APIError('Project creation failed!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR);
            }
            logger.info(`*************Entry in project table Done*************`)

            // Additional operations within the transaction
            // Add any other database operations here that should be part of the transaction

            // Extract collaborator IDs

            // Call the PostgreSQL function to add collaborators by IDs
            const collaboratorIds: number[] = body.collaborators?.length
                ? body.collaborators.map((collab: { id: number }) => collab.id)
                : [];

            // Add the default `user.id` whether or not `body.collaborators` exists
            collaboratorIds.push(user.id);

            logger.info(`Collaborators: ${collaboratorIds}`);

            await queryRunner.manager.query(
                `SELECT ${schemaName}.add_collaborators($1, $2::int[])`,
                [createdProject.id, collaboratorIds]
            );

            logger.info(`*************Collaborators added*************`);


            //Adding regulation details to project
            for (const regulation of body.regulations) {

                //adding regulation first to project_regulation table
                const [createdProjectRegulation]: ProjectRegulation[] = await queryRunner.manager.query(
                    `INSERT INTO ${schemaName}.project_regulation("projectId", "regulationId", "scope", "createdAt") 
                     VALUES ($1, $2, $3, DEFAULT)
                     RETURNING "id", "createdAt", "updatedAt"`,
                    [createdProject.id, regulation.id, regulation.scope]
                );

                if (regulation.regulationDetails.length > PROJECT_REGULATION_DETAIL_LIMIT) {
                    throw new APIError('You can only add 5 regulation details!', RESPONSE_STATUS.BAD_REQUEST)
                }
                //adding regulation_detail to project_regulation_detail table
                for (const regulationDetail of regulation.regulationDetails) {
                    await queryRunner.manager.query(
                        `INSERT INTO ${schemaName}.project_regulation_detail("projectRegulationId", "regulationDetailId", "createdAt") 
                         VALUES ($1, $2, DEFAULT)`,
                        [createdProjectRegulation.id, regulationDetail]
                    );
                }


            }

            logger.info('added project regulation details!')


            await queryRunner.commitTransaction();

            return true;
        } catch (err) {
            await queryRunner.rollbackTransaction();

            logger.error('Server::Service ProjectService::Create');
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
            throw new APIError(errorMessage, errorCode);
        } finally {
            await queryRunner.release();
        }
    }

    async getProject(schemaName: string, field: string, value: string) {
        try {
            const dataSource = await dbConnection()

            const project: Project[] = await dataSource.query(`select * from ${schemaName}.project where "${field}"='${value.toLowerCase()}'`)

            if (project) {
                return project[0]
            }
            return
        } catch (err) {
            logger.error('Server::Service ProjectService::GetProject')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async userProjectList(skip: string, limit: string, user: UserAccountView, query?: string, isArchive = false) {
        try {
            const dataSource = await dbConnection()
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`

            // Different base queries for account_owner vs other roles
            let totalQry = user.userRole === UserRoles.account_owner
                ? `select count(*) from ${schemaName}.project p where p."isArchive" = ${isArchive}`
                : `select count(*) from ${schemaName}."user_project_access" "upa" 
                   LEFT JOIN ${schemaName}.project p on p.id=upa."projectId" 
                   where upa."userId"=${user.id} and p."isArchive" = ${isArchive}`;

            let qry = `select 
                        p.id,
                        p."projectName", 
                        p."clientName", 
                        p.description, 
                        CONCAT(usr."firstName", ' ', usr."lastName") as createdBy,
                        array_agg(r."name") AS regulations,
                        p."createdAt" 
                        FROM ${user.userRole === UserRoles.account_owner
                    ? `${schemaName}.project p`
                    : `${schemaName}.user_project_access upa 
                               LEFT JOIN ${schemaName}.project p on p.id = upa."projectId"`} 
                        LEFT JOIN ${process.env.DB_SCHEMA}."user" usr on usr.id = p."createdBy" 
                        LEFT JOIN ${schemaName}.project_regulation pr on p.id = pr."projectId"
                        LEFT JOIN ${process.env.DB_SCHEMA}.regulations r on pr."regulationId" = r.id
                        where ${user.userRole === UserRoles.account_owner
                    ? `p."isArchive" = ${isArchive}`
                    : `upa."userId"=${user.id} and p."isArchive" = ${isArchive}`}`;

            if (query) {
                qry += ` and (p."projectName" like '%${query}%' or p."clientName" like '%${query}%' or p."description" like '%${query}%') `
                totalQry += ` and (p."projectName" like '%${query}%' or p."clientName" like '%${query}%' or p."description" like '%${query}%')`
            }

            const total: [{ count: number }] = await dataSource.query(totalQry)

            if (total) {

                qry += ` group by p.id, CONCAT(usr."firstName", ' ', usr."lastName")  order by p."createdAt" DESC offset ${skip} limit ${Number(limit)};`

                const projects: Project[] = await dataSource.query(qry)

                return { total: Number(total[0].count), projects }
            }


            return

        } catch (err) {
            logger.error('Server::Service ProjectService::Create')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async projectDetails(projectId: number, user: UserAccountView) {
        try {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`
            const dataSource = await dbConnection()
            if (user.userRole !== UserRoles.account_owner) {
                const [ifUserHasAccess] = await dataSource.query(`SELECT * from ${schemaName}.user_project_access upa where upa."userId"=${user.id} and upa."projectId"=${projectId}`)
                if (!ifUserHasAccess) {
                    throw new APIError('Un-Authorized!!!', RESPONSE_STATUS.FORBIDDEN)
                }
            }

            const [projectDetails] = await dataSource.query(`SELECT 
                                                            p.id,
                                                            p."projectName",
                                                            p.description,
                                                            p."clientName",
                                                            p."createdAt",
                                                            p."isArchive",
                                                            pr."regulationId",
                                                            r.name as "regulationName",
                                                            pr."id" as "projectRegulationId",
                                                            array_agg(DISTINCT prd."regulationDetailId") as "projectRegulationDetails",
                                                            (SELECT COUNT(*) 
                                                            FROM ${schemaName}.documents d 
                                                            WHERE d."projectId" = p.id) AS "documentsCount",
                                                            (
                                                                SELECT json_agg(
                                                                    json_build_object(
                                                                        'name', CONCAT(u2."firstName", ' ', u2."lastName"), 
                                                                        'email', u2.email,
                                                                        'id', u2.id
                                                                    )
                                                                )
                                                                FROM ${schemaName}.user_project_access upa2
                                                                JOIN ${process.env.DB_SCHEMA}."user" u2 ON upa2."userId" = u2.id
                                                                WHERE upa2."projectId" = p.id AND u2.id != ${user.id}
                                                            ) AS collaborators
                                                        FROM 
                                                            ${schemaName}.project p
                                                        LEFT JOIN 
                                                            ${schemaName}.project_regulation pr on p.id = pr."projectId"
                                                        LEFT JOIN
                                                            ${schemaName}.project_regulation_detail prd on pr.id = prd."projectRegulationId"
                                                        LEFT JOIN
                                                            ${process.env.DB_SCHEMA}.regulations r on pr."regulationId" = r.id
                                                        WHERE 
                                                            p.id = ${projectId}
                                                        GROUP BY 
                                                            p.id, 
                                                            p."projectName", 
                                                            p.description, 
                                                            p."clientName", 
                                                            p."createdAt",
                                                            p."isArchive",
                                                            pr."regulationId",
                                                            r.name,
                                                            pr.id;`)
            return projectDetails
        } catch (err) {
            let errorMessage = 'Something went wrong, try again later!';
            let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }

            throw new APIError(errorMessage, errorCode);
        }
    }

    async update(body: UpdateProjectRequest, user: UserAccountView) {
        const collaboratorsAddedSet = new Set(body.collaboratorsAdded)
        if (collaboratorsAddedSet.has(user.id)) {
            throw new APIError("User can't add it self!")
        }
        const collaboratorsDeletedSet = new Set(body.collaboratorsDeleted)
        if (collaboratorsDeletedSet.has(user.id)) {
            throw new APIError("User can't delete it self!")
        }
        if (user.userRole === UserRoles.project_owner) {
            const userHasAccess = await this.checkIfUserHasProjectAccess(user, body.projectId)
            if (!userHasAccess) {
                throw new APIError("User doesn't have access to perform this action!", RESPONSE_STATUS.FORBIDDEN)
            }
        }

        const dataSource = await dbConnection();
        const queryRunner = dataSource.createQueryRunner();

        await queryRunner.startTransaction();
        const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;
        try {

            const [updateStatus] = await queryRunner.manager.query(
                `UPDATE ${schemaName}.project p 
                                        SET "projectName"='${body.projectName}',
                                        description='${body.description}', 
                                        "clientName"='${body.clientName}'
                                        where p.id=${body.projectId};`,
            );

            if (!updateStatus) {
                await queryRunner.rollbackTransaction()
                throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
            }

            if (body.collaboratorsDeleted) {
                const collaboratorsDeteledIds = body.collaboratorsDeleted
                for (let i = 0; i < collaboratorsDeteledIds.length; i++) {

                    await queryRunner.query(`DELETE from ${schemaName}.user_project_access upa where upa."userId"=${collaboratorsDeteledIds[i]} and upa."projectId"=${body.projectId}`)
                }
                logger.info(`*********Collaborators Deleted***********88`)
            }

            if (body.collaboratorsAdded) {
                const collaboratorsAddedIds = body.collaboratorsAdded;
                await queryRunner.manager.query(
                    `SELECT ${schemaName}.add_collaborators($1, $2::int[])`,
                    [body.projectId, collaboratorsAddedIds]
                );

                logger.info(`*************Collaborators added*************`);
            }
            logger.info('added project regulation details!')


            await queryRunner.commitTransaction();

            return true
        } catch (err) {
            let errorMessage = 'Something went wrong, try again later!';
            let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }

            throw new APIError(errorMessage, errorCode);
        } finally {
            await queryRunner.release()
        }
    }

    async archive(body: ArchiveProjectRequest, user: UserAccountView) {
        try {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`
            const dataSource = await dbConnection();

            const [projectDetails]: Project[] = await dataSource.query(`
                                        SELECT * from ${schemaName}.project p
                                        WHERE p.id = ${body.projectId};
                                    `)

            if (!projectDetails) {
                throw new APIError('Project not found!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            if (projectDetails.isArchive === body.archive) {
                throw new APIError('Invalid input!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }

            // Archive the project
            const [archiveProject, updateStatus] = await dataSource.query(`
                                        UPDATE ${schemaName}.project
                                        SET "isArchive" = ${body.archive}
                                        WHERE id = ${body.projectId}
                                        RETURNING "isArchive";
                                    `);


            // Check if the project was successfully archived
            if (archiveProject.length > 0 && archiveProject[0].isArchive === body.archive && updateStatus) {
                return
            } else {
                throw new APIError('Something went wrong, while archivng project!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
            }
        } catch (err) {
            logger.error('Server::Service ProjectService::Archive')
            const errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            const errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR
            throw new APIError(errorMessage, errorCode);
        }
    }

    async checkIfUserHasProjectAccess(user: UserAccountView, projectId: number) {
        try {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

            const dataSource = await dbConnection()

            const [userHasAccess]: UserProjectAccess[] = await dataSource.query(`
                                        select * from ${schemaName}.user_project_access upa
                                        where 
                                        upa."userId" = ${user.id}
                                        and 
                                        upa."projectId" = ${projectId};
                                    `)



            return userHasAccess
        } catch (err) {
            let errorMessage = 'Something went wrong, try again later!';
            let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }

            throw new APIError(errorMessage, errorCode);
        }
    }

    async updateScope(body: UpdateProjectScope, user: UserAccountView) {
        const dataSource = await dbConnection();
        const queryRunner = dataSource.createQueryRunner();

        await queryRunner.startTransaction();
        const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;
        try {
            if (!body.regulationDetailsAdded && !body.regulationDetailsDeleted) {
                throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.BAD_REQUEST)
            }

            const projectRegulationDetailCount = await this.checkProjectRegulationDetailCount(body.projectRegulationId, user)

            const totalRegulationDetailCount = projectRegulationDetailCount + body.regulationDetailsAdded.length - body.regulationDetailsDeleted.length


            if (totalRegulationDetailCount > PROJECT_REGULATION_DETAIL_LIMIT) {
                throw new APIError(`You can only add ${PROJECT_REGULATION_DETAIL_LIMIT} regulation details!`, RESPONSE_STATUS.BAD_REQUEST)
            }

            if (user.userRole === UserRoles.project_owner) {
                const userHasAccess = await this.checkIfUserHasProjectAccess(user, body.projectId)
                if (!userHasAccess) {
                    throw new APIError("User doesn't have access to perform this action!", RESPONSE_STATUS.FORBIDDEN)
                }
            }


            if (body.regulationDetailsDeleted) {
                const regulationDeletedIds = body.regulationDetailsDeleted
                for (let i = 0; i < regulationDeletedIds.length; i++) {

                    await queryRunner.query(`DELETE from ${schemaName}.project_regulation_detail prd where prd."projectRegulationId"=${body.projectRegulationId} and prd."regulationDetailId"=${regulationDeletedIds[i]}`)
                }
                logger.info(`*********Regulation Details Deleted***********`)
            }


            if (body.regulationDetailsAdded) {
                const regulationAddedIds = body.regulationDetailsAdded
                for (let i = 0; i < regulationAddedIds.length; i++) {

                    await queryRunner.query(
                        `INSERT INTO ${schemaName}.project_regulation_detail("regulationDetailId", "projectRegulationId","createdAt") VALUES($1, $2, DEFAULT)`,
                        [regulationAddedIds[i], body.projectRegulationId]
                    )
                }
                logger.info(`*********Regulation Details Added***********`)
            }



            await queryRunner.commitTransaction();

            return true

        } catch (err) {
            await queryRunner.rollbackTransaction();
            let errorMessage = 'Something went wrong, try again later!';
            let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }

            throw new APIError(errorMessage, errorCode);
        } finally {
            await queryRunner.release();

        }
    }

    async checkProjectCount(user: UserAccountView) {
        try {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`
            const dataSource = await dbConnection()

            const [projectCount] = await dataSource.query(`SELECT COUNT(*) FROM ${schemaName}.project p;`)
            console.log(projectCount)
            return projectCount
        } catch (err) {
            let errorMessage = 'Something went wrong, try again later!';
            let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            throw new APIError(errorMessage, errorCode);
        }
    }

    async checkProjectRegulationDetailCount(projectRegulationId: number, user: UserAccountView) {
        try {
            const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`
            const dataSource = await dbConnection()
            const [projectRegulationDetailCount] = await dataSource.query(`
                                                    SELECT COUNT(*) FROM ${schemaName}.project_regulation_detail prd 
                                                    where prd."projectRegulationId"=${projectRegulationId}
                                                `)
            return Number(projectRegulationDetailCount.count)
        } catch (err) {
            let errorMessage = 'Something went wrong, try again later!';
            let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            throw new APIError(errorMessage, errorCode);
        }
    }
}