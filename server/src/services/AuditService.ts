import { Inject, Service } from "typedi";
import {
  DocumentAuditStatus,
  DocumentDetailsForAuditGeneratedEmailNotification,
  DocumentStatus,
  RecentAuditResponse,
  UserAccountView,
  UserRoles,
} from "../types";
import { APIError } from "../utils/APIError";
import { dbConnection } from "../utils/dbConnection";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import logger from "../utils/logger";
import { AIBackendService } from "./AIBackendService";
import { Audits } from "../entity/audits";
import { AuditDocuments } from "../entity/auditDocuments";
import { Documents } from "../entity/documents";
import { loadTemplate } from "../utils/loadTemplate";
import EmailQueue from "../lib/rabbitmq/queues/email";

@Service()
export class AuditService {
  constructor(
    @Inject()
    private readonly aiBackendService: AIBackendService,
    @Inject()
    private readonly emailQueue: EmailQueue
  ) { }

  async recentAudits(user: UserAccountView, limit = 5) {
    try {
      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;
      const dataSource = await dbConnection();
      let query = `select ad.status, p."projectName", p.id as "projectId", aud.id as "auditId", reg."name" as "regulationName", aud."createdAt" from ${schemaName}.audits aud 
                            JOIN ${schemaName}.project p on p.id=aud."projectId"
                            JOIN ${schemaName}.project_regulation preg on p.id = preg."projectId"
                            JOIN ${process.env.DB_SCHEMA}.regulations reg on preg."regulationId" = reg.id 
                            JOIN ${schemaName}.audit_documents ad on ad."auditId" = aud.id
                            WHERE p."isArchive" = false`;

      let userAssignedProjects: { projectIds: number[] } = { projectIds: [] };
      if (user.userRole === UserRoles.project_owner) {
        [userAssignedProjects] = await dataSource.query(`
                                        select ARRAY_AGG("projectId") as "projectIds" from ${schemaName}.user_project_access upa 
                                        where "userId" =${user.id};
                                    `);
        if (userAssignedProjects.projectIds) {
          query += ` AND aud."projectId" = ANY($1) ORDER BY aud."createdAt" DESC LIMIT ${limit}`;
          return await dataSource.query(query, [userAssignedProjects.projectIds]);
        }
      }

      query += ` ORDER BY aud."createdAt" DESC LIMIT ${limit}`;
      const recentAudits: RecentAuditResponse[] = await dataSource.query(query);
      return recentAudits;
    } catch (err) {
      logger.error("Server::Service AuditService::recent");
      logger.error(err);
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async startAudit(user: UserAccountView, auditId: number, documentId: number) {
    try {
      const dataSource = await dbConnection();
      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

      const [auditDetails]: Audits[] = await dataSource.query(
        `SELECT * FROM ${schemaName}.audits WHERE id = $1`,
        [auditId]
      );

      if (!auditDetails) {
        throw new APIError("Audit not found", RESPONSE_STATUS.NOT_FOUND);
      }

      const [auditDocument]: AuditDocuments[] = await dataSource.query(
        `SELECT * FROM ${schemaName}.audit_documents as ad WHERE ad."auditId" = $1 and ad."documentId" = $2`,
        [auditId, documentId]
      );

      if (!auditDocument) {
        throw new APIError("Audit not found", RESPONSE_STATUS.NOT_FOUND);
      }

      if (auditDocument.status !== DocumentAuditStatus.NOT_STARTED) {
        throw new APIError("Audit already started", RESPONSE_STATUS.BAD_REQUEST);
      }

      const [document]: Documents[] = await dataSource.query(
        `SELECT * FROM ${schemaName}.documents WHERE id = $1`,
        [documentId]
      );

      if (!document) {
        throw new APIError("Document not found", RESPONSE_STATUS.NOT_FOUND);
      }

      if (document.status !== DocumentStatus.FINISHED) {
        let msg = "";
        if (document.status === DocumentStatus.PROCESSING) {
          msg = "Document is already in progress";
        } else if (document.status === DocumentStatus.ERROR) {
          msg = "Document is in error state";
        }
        throw new APIError(msg, RESPONSE_STATUS.BAD_REQUEST);
      }

      await this.updateAuditStatus(user.shortCode, auditId, documentId, DocumentAuditStatus.QUEUED);

      await this.aiBackendService.startPlaybook(
        user.shortCode,
        auditDetails.projectId,
        user.id,
        documentId,
        auditId
      );



      return auditDetails;
    } catch (err) {
      let errorMessage = "Something went wrong, try again later!";
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      console.log(err);
      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }
  }

  async updateAuditStatus(
    shortCode: string,
    auditId: number,
    documentId: number,
    documentAuditStatus: DocumentAuditStatus
  ) {
    const dataSource = await dbConnection();
    const schemaName = `${process.env.DB_INITIAL}_${shortCode}`;

    const queryRunner = dataSource.createQueryRunner();


    try {

      const updateStatus = await queryRunner.query(
        `
          UPDATE ${schemaName}.audit_documents 
          SET status = $1 
          WHERE "auditId" = $2 and "documentId" = $3`,
        [documentAuditStatus, auditId, documentId]
      );

      logger.info("updateStatus", updateStatus);

      if (documentAuditStatus === DocumentAuditStatus.AUDIT_GENERATED) {
        logger.info("Sending email notification for audit generated");
        const auditDocumentDetails = await this.getDocumentDetailsForAuditGeneratedEmailNotification(documentId, auditId, schemaName);


        const subject = "Your audit results are ready!"

        const html = await loadTemplate('auditCompleteTemplate',
          {
            documentName: auditDocumentDetails.documentName,
            projectName: auditDocumentDetails.projectName,
            username: auditDocumentDetails.uploadedByUsername,
          }
        );
        logger.info("Sending email notification for audit results ready", auditDocumentDetails.uploadedByEmail);

        await this.emailQueue.sendMessage({
          to: auditDocumentDetails.uploadedByEmail,
          subject,
          body: html,
          isHtml: true,
        });
      }

    } catch (error) {

      logger.error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getAuditDetails(
    user: UserAccountView,
    auditId: number | string,
    documentId: number | string
  ) {
    const dataSource = await dbConnection();
    const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

    let audit: any;
    try {
      const res = await dataSource.query(
        `
        SELECT a.id as "auditId",
        d.id as "documentId",
        ad.status as "auditStatus",
        r.result as "result"
        FROM ${schemaName}.audits a
        JOIN ${schemaName}.audit_documents ad on ad."auditId" = a.id
        JOIN ${schemaName}.documents d on d.id = ad."documentId"
        LEFT JOIN ${schemaName}.results r on r."auditId" = a.id
        WHERE a.id = $1 and d.id = $2
        `,
        [+auditId, +documentId]
      );

      if (res.length === 0) {
        throw new APIError("Audit not found", RESPONSE_STATUS.NOT_FOUND);
      }

      audit = res[0];
    } catch (error) {
      logger.error(error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "Please try again later.",
        RESPONSE_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return audit;
  }

  async restartAudit(user: UserAccountView, auditId: number) {
    const dataSource = await dbConnection();
    const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {

      const [auditDetails]: AuditDocuments[] = await queryRunner.query(`SELECT * FROM ${schemaName}.audit_documents WHERE "auditId" = $1`, [auditId]);

      if (!auditDetails) {
        throw new APIError("Audit not found", RESPONSE_STATUS.NOT_FOUND);
      }

      if (auditDetails.status !== DocumentAuditStatus.ERROR) {
        throw new APIError("Audit already started", RESPONSE_STATUS.BAD_REQUEST);
      }

      await queryRunner.query(`DELETE FROM ${schemaName}.results WHERE "auditId" = $1`, [auditId]);

      const result = await this.startAudit(user, auditId, auditDetails.documentId);

      await queryRunner.commitTransaction();

      return result;

    } catch (err) {
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

  async getDocumentDetailsForAuditGeneratedEmailNotification(documentId: number, auditId: number, schemaName: string) {
    const dataSource = await dbConnection();
    const [auditDocument]: DocumentDetailsForAuditGeneratedEmailNotification[] = await dataSource.query(`
                                                SELECT 
                                                d.id as "documentId",
                                                a.id as "auditId",
                                                d.name as "documentName",
                                                p."projectName" as "projectName",
                                                u.email as "uploadedByEmail",
                                                concat(u."firstName",' ',u."lastName") as "uploadedByUsername"
                                                FROM ${schemaName}.audit_documents ad 
                                                JOIN ${schemaName}.documents d on d.id = ad."documentId"
                                                JOIN ${schemaName}.project p on p.id = d."projectId"
                                                JOIN ${schemaName}.audits a on a.id = ad."auditId"
                                                JOIN ${process.env.DB_SCHEMA}.user u on u.id = d."uploadedBy" 
                                                WHERE "documentId" = $1 and "auditId" = $2;`,
      [documentId, auditId]
    );
    return auditDocument;
  }
}
