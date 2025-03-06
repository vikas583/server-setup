import { Inject, Service } from "typedi";
import BlobService from "./BlobService";
import { DocumentAuditStatus, DocumentDetailsForEmailNotification, DocumentStatus, UserAccountView, UserRoles } from "../types";
import { dbConnection } from "../utils/dbConnection";
import logger from "../utils/logger";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { Documents } from "../entity/documents";
import { removeFile } from "../utils/removeFile";
import { Audits } from "../entity/audits";
import { ProjectService } from "./ProjectService";
import { AIBackendService } from "./AIBackendService";
import { loadTemplate } from "../utils/loadTemplate";
import EmailQueue from "../lib/rabbitmq/queues/email";

const MAX_DOC_LIMIT_PER_PROJECT = 5;

@Service()
export class DocumentService {
  constructor(
    @Inject()
    private readonly blobService: BlobService,
    @Inject()
    private readonly projectService: ProjectService,
    @Inject()
    private readonly aiBackendService: AIBackendService,
    @Inject()
    private readonly emailQueue: EmailQueue
  ) { }

  async uploadDocuments(files: any, projectId: number, user: UserAccountView) {
    const dataSource = await dbConnection();
    const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

    const projectDetails = await this.projectService.getProject(
      schemaName,
      "id",
      projectId.toString()
    );
    if (!projectDetails) {
      throw new APIError(
        "Project not found!",
        RESPONSE_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    if (projectDetails.isArchive) {
      throw new APIError(
        `You can't upload document in archived project!`,
        RESPONSE_STATUS.CONFLICT
      );
    }

    const documentCount = await this.documentsCountAganistProject(
      projectId,
      user
    );

    if (documentCount && Number(documentCount) > MAX_DOC_LIMIT_PER_PROJECT) {
      throw new APIError(
        `${MAX_DOC_LIMIT_PER_PROJECT} allowed per project!`,
        RESPONSE_STATUS.CONFLICT
      );
    }
    if (Number(documentCount) + files.length > MAX_DOC_LIMIT_PER_PROJECT) {
      throw new APIError(
        `Your project already have ${documentCount} documents and you trying to upload ${files.length} document which will exceed the limit of ${MAX_DOC_LIMIT_PER_PROJECT} documents per project!`,
        RESPONSE_STATUS.CONFLICT
      );
    }

    const queryRunner = dataSource.createQueryRunner();

    const insertedDocuments: Documents[] = [];
    const insertedAudits: Audits[] = [];
    let canRollback = true;
    await queryRunner.startTransaction();
    try {
      const fileUrls: string[] = await Promise.all(
        files!.map((f: any) => this.blobService.upload(f.path, user.shortCode))
      );

      const documentsObj: Documents[] = [];

      // First we will be saving audit again all the documents - but for MVP the document is only one.
      const [auditDetails]: Audits[] = await queryRunner.manager.query(
        `
          INSERT INTO ${schemaName}.audits("projectId","createdBy","createdAt")
          VALUES ($1, $2 , DEFAULT)
          RETURNING "id"`,
        [projectId, user.id]
      );
      insertedAudits.push(auditDetails);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUrl = fileUrls[i];

        const [document]: Documents[] = await queryRunner.manager.query(
          `
            INSERT INTO ${schemaName}.documents("projectId", "name" ,"docSize" ,"docUrl" ,"uploadedBy","docType" ,"createdAt") 
            VALUES ($1, $2, $3, $4, $5, $6, DEFAULT)
            RETURNING "id", "docUrl", "createdAt"`,
          [
            projectId,
            file.originalname,
            file.size,
            fileUrl,
            user.id,
            file.mimetype,
          ]
        );

        await queryRunner.manager.query(
          `
            INSERT INTO ${schemaName}.audit_documents("auditId","documentId","status")
            VALUES ($1,$2,DEFAULT)`,
          [auditDetails.id, document.id]
        );
        documentsObj.push(document);
        insertedDocuments.push(document);
      }
      await Promise.all(files.map((f: any) => removeFile(f.path)));

      await queryRunner.commitTransaction();

      canRollback = false;
      if (insertedDocuments.length > 0) {
        try {
          await Promise.all(
            insertedDocuments.map((doc) =>
              this.aiBackendService.processDocument(
                user.shortCode,
                projectId,
                doc.id,
                user.id
              )
            )
          );
        } catch (error) {
          throw error;
        }
      }
      return documentsObj;
    } catch (err) {
      console.log('err', err);
      
      if (canRollback) {
        await queryRunner.rollbackTransaction();
      } else {
        if (insertedDocuments.length > 0) {
          const documentIds = insertedDocuments.map((doc) => doc.id);

          // Delete from audit_documents
          await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from(`${schemaName}.audit_documents`)
            .where(`"documentId" IN (:...ids)`, { ids: documentIds })
            .execute();

          // Delete from documents
          await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from(`${schemaName}.documents`)
            .where("id IN (:...ids)", { ids: documentIds })
            .execute();
        }
        if (insertedAudits.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from(`${schemaName}.audits`)
            .where("id IN (:...ids)", { ids: insertedAudits.map((a) => a.id) })
            .execute();
        }
      }

      //if it comes in catch block delete all the files from local space.
      await Promise.all(files.map((f: any) => removeFile(f.path)));

      //if it comes in catch block delete all the files from blob as well.
      await Promise.all(
        files!.map((f: any) => this.blobService.delete(f.path, user.shortCode))
      );
      logger.error("Server::Service DocumentService::uploadDocuments");

      let errorMessage = "Something went wrong, try again later!";
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

  async documentsCountAganistProject(projectId: number, user: UserAccountView) {
    try {
      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

      const dataSource = await dbConnection();

      const [documentsPerProject]: { count: string }[] = await dataSource.query(
        `
            select count(*) from ${schemaName}.documents d
            where d."projectId" = $1`,
        [projectId]
      );

      return documentsPerProject.count;
    } catch (err) {
      let errorMessage = "Something went wrong, try again later!";
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }
  }

  async list(projectId: number, user: UserAccountView) {
    try {
      const dataSource = await dbConnection();
      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

      const documents: Documents[] = await dataSource.query(
        `
        SELECT 
            d.id, 
            d."name",
            d.status as "documentStatus",
            ROUND((d."docSize"/1000.0), 2) as "docSize",
            ad."auditId" as "auditId",
            ad.status as status,
            CONCAT(u."firstName",' ',u."lastName") as "uploadedBy",
            d."createdAt" as "createdAt"
        from ${schemaName}.documents d
            join ${process.env.DB_SCHEMA}."user" u on u.id = d."uploadedBy"
            join ${schemaName}.audit_documents ad on ad."documentId" = d.id
        where d."projectId" = $1
        order by d."createdAt" desc`,
        [projectId]
      );

      return documents;
    } catch (err) {
      logger.error("Server::Service DocumentService::list");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async updateDocumentStatus(
    shortCode: string,
    docId: number,
    status: DocumentStatus
  ) {
    logger.info("updateDocumentStatus", shortCode, docId, status);
    const dataSource = await dbConnection();
    const schemaName = `${process.env.DB_INITIAL}_${shortCode}`;
    await dataSource.query(
      `
      UPDATE ${schemaName}.documents
      SET status = $1
      WHERE id = $2
    `,
      [status, docId]
    );

    if (status === DocumentStatus.FINISHED) {
      logger.info("Sending email notification for document ready for audit");
      const documentDetails = await this.getDocumentDetailsForEmailNotification(docId, schemaName);


      const subject = "Your document is ready for Audit!"

      const html = await loadTemplate('readyForAudit',
        {
          documentName: documentDetails.name,
          projectName: documentDetails.projectName,
          username: documentDetails.uploadedByUsername,
        }
      );
      logger.info("Sending email notification for document ready for audit", documentDetails.uploadedByEmail);

      await this.emailQueue.sendMessage({
        to: documentDetails.uploadedByEmail,
        subject,
        body: html,
        isHtml: true,
      });
    }

  }

  async getDocumentDetails(docId: number, user: UserAccountView) {
    try {
      const dataSource = await dbConnection();
      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

      const documents: Documents[] = await dataSource.query(`
        SELECT 
          d.id, 
          d.name,
          d.status as "documentStatus",
          a.id as "auditId",
          ad.status as "auditStatus",
          ROUND((d."docSize"/1000.0), 2) as "docSize",
          u.email as "uploadedBy",
          d."createdAt" as "createdAt",
          d."docUrl" as "docUrl",
          ARRAY_AGG(JSON_BUILD_OBJECT('name', r.name, 'version', r.version)) as scopes
        FROM ${schemaName}.documents d
          JOIN ${process.env.DB_SCHEMA}."user" u on u.id = d."uploadedBy"
          JOIN ${schemaName}.audit_documents ad on ad."documentId" = d.id
          JOIN ${schemaName}.audits a on a.id = ad."auditId"
          JOIN ${schemaName}.project_regulation pr on pr."projectId" = d."projectId"
          JOIN ${process.env.DB_SCHEMA}.regulations r on r.id = pr."regulationId"
        WHERE d.id = ${docId}
        GROUP BY d.id, 
          d.name, 
          d.status, 
          ad.status, 
          a.id,
          d."docSize", 
          u.email, 
          d."createdAt",
          d."docUrl";
      `);

      if (!documents || documents.length === 0) {
        throw new APIError("Document not found!", RESPONSE_STATUS.NOT_FOUND);
      }

      const parts = documents[0].docUrl.split("/");
      const blobPath = parts[parts.length - 1];

      const docUrl = await this.blobService.generateSASURL(
        `${user.shortCode}/${blobPath}`
      );

      documents[0].docSize = Number(documents[0].docSize);
      documents[0].docUrl = docUrl;

      return documents[0];
    } catch (err) {
      console.log(err);
      logger.error("Server::Service DocumentService::getDocumentDetails");
      let errorMessage = "Something went wrong, try again later!";
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }

  }

  async deleteDocument(docId: number, projectId: number, user: UserAccountView) {

    const dataSource = await dbConnection();
    const queryRunner = dataSource.createQueryRunner();

    if (user.userRole !== UserRoles.account_owner) {
      const userHasAccess = await this.projectService.checkIfUserHasProjectAccess(user, projectId);

      if (!userHasAccess) {
        throw new APIError("You don't have access to this project!", RESPONSE_STATUS.UNAUTHENTICATED);
      }

    }


    const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;
    const documents = await dataSource.query(`
                      select * from ${schemaName}.documents where id = ${docId}
                    `);


    const document = documents[0];  // Get first result from array

    if (!document || documents.length === 0) {
      throw new APIError("Document not found!", RESPONSE_STATUS.NOT_FOUND);
    }

    if (document.status === DocumentStatus.PROCESSING) {
      throw new APIError("Document is still processing!", RESPONSE_STATUS.CONFLICT);
    }

    const [auditDocument] = await dataSource.query(`
                        select * from ${schemaName}.audit_documents where "documentId" = $1
                        `, [docId]);

    if (auditDocument.status === DocumentAuditStatus.PROCESSING) {
      throw new APIError("Audit is still processing!", RESPONSE_STATUS.CONFLICT);
    }
    try {
      await queryRunner.startTransaction();

      await queryRunner.manager.query(`
        DELETE FROM ${schemaName}.documents WHERE id = $1
      `, [docId]);

      await queryRunner.manager.query(`
        DELETE FROM ${schemaName}.audit_documents WHERE "documentId" = $1 and "auditId" = $2
      `, [docId, auditDocument.auditId]);

      await queryRunner.manager.query(`
        DELETE FROM ${schemaName}.audits WHERE id = $1
      `, [auditDocument.auditId]);

      await queryRunner.manager.query(`
        DELETE FROM ${schemaName}.embeddings WHERE "documentId" = $1
      `, [docId]);

      if (auditDocument.status === DocumentAuditStatus.AUDIT_GENERATED || auditDocument.status === DocumentAuditStatus.ERROR) {
        await queryRunner.manager.query(`
          DELETE FROM ${schemaName}.results WHERE "auditId" = $1
        `, [auditDocument.auditId]);
      }



      const result = await this.blobService.delete(document.docUrl, user.shortCode);

      if (!result) {
        throw new APIError("Failed to delete document!", RESPONSE_STATUS.INTERNAL_SERVER_ERROR);
      }
      await queryRunner.commitTransaction();

      return true;


    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      let errorMessage = "Something went wrong, try again later!";
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


  async getDocumentDetailsForEmailNotification(docId: number, schemaName: string): Promise<DocumentDetailsForEmailNotification> {
    const dataSource = await dbConnection();

    console.log("Getting document details for email notification");
    const documents: DocumentDetailsForEmailNotification[] = await dataSource.query(`
                                    select 
                                    d.id,
                                    d.name,
                                    concat(u."firstName",' ',u."lastName") as "uploadedByUsername",
                                    u.email as "uploadedByEmail",
                                    p."projectName" as "projectName" 
                                    from ${schemaName}.documents d 
                                    left join ${process.env.DB_SCHEMA}."user" u on u.id = d."uploadedBy"
                                    left join ${schemaName}.project p on p.id = d."projectId" where d.id = $1;
                                  `, [docId]);

    return documents[0];
  }
}
