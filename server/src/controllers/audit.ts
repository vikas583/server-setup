import {
  Authorized,
  Body,
  Controller,
  CurrentUser,
  Get,
  Params,
  Post,
  QueryParams,
  Res,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { AuditService } from "../services/AuditService";
import { UserAccountView, UserRoles, StartAuditRequest } from "../types";
import { Response } from "express";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";

@Controller("/audits")
@Service()
export class AuditController {
  constructor(
    @Inject()
    private readonly auditService: AuditService
  ) { }

  @Get("/recent")
  @Authorized([UserRoles.account_owner, UserRoles.project_owner])
  async recentAudits(
    @QueryParams({ required: false }) { limit }: { limit: number },
    @CurrentUser() user: UserAccountView,
    @Res() res: Response
  ) {
    const audits = await this.auditService.recentAudits(user, limit);

    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Successfully fetched!",
      data: audits,
    });
  }

  @Post("/start")
  @Authorized([UserRoles.account_owner, UserRoles.project_owner])
  async startAudit(
    @CurrentUser() user: UserAccountView,
    @Body() { auditId, documentId }: StartAuditRequest,
    @Res() res: Response
  ) {
    const audit = await this.auditService.startAudit(user, auditId, documentId);

    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Audit started successfully!",
      data: {
        id: audit.id,
      },
    });
  }

  @Get("/details/:auditId")
  @Authorized([UserRoles.account_owner, UserRoles.project_owner])
  async getAuditDetails(
    @CurrentUser() user: UserAccountView,
    @Params({ required: true }) { auditId }: { auditId: string },
    @QueryParams({ required: true }) { documentId }: { documentId: string },
    @Res() res: Response
  ) {
    const auditDetails = await this.auditService.getAuditDetails(
      user,
      auditId,
      documentId
    );

    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Successfully fetched!",
      data: auditDetails,
    });
  }

  @Post("/restart")
  @Authorized([UserRoles.account_owner, UserRoles.project_owner])
  async restartAudit(
    @CurrentUser() user: UserAccountView,
    @Body() { auditId }: { auditId: number },
    @Res() res: Response
  ) {

    const audit = await this.auditService.restartAudit(user, auditId);

    return res.status(RESPONSE_STATUS.SUCCESS).send({
      status: true,
      msg: "Audit restarted successfully!",
      data: audit,
    });
  }
}

