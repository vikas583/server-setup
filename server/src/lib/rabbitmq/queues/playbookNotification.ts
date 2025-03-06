import { ConsumeMessage } from "amqplib";
import { Inject, Service } from "typedi";
import { AbstractQueue } from "../abstractQueue";
import logger from "../../../utils/logger";
import {
  PlaybookNotificationStatus,
  DocumentAuditStatus,
} from "../../../types";
import { AuditService } from "../../../services/AuditService";

export type PlaybookNotificationQueueMessage = {
  user_id: number;
  ca_id: string;
  proj_id: number;
  doc_id: number;
  audit_id: number;
  status: PlaybookNotificationStatus;
  message: string;
};

@Service()
class PlaybookNotificationQueue extends AbstractQueue<PlaybookNotificationQueueMessage> {
  private readonly MAX_RETRIES = 3;

  constructor(
    @Inject()
    private readonly auditService: AuditService
  ) {
    super({
      queueName: "playbook_notification_queue",
      exchangeName: "playbook_notification_exchange_durable",
      routingKey: "playbook_notification_routing_key",
      noAck: false,
    });
  }

  protected async processMessage(message: ConsumeMessage) {
    const channel = await this.channel;
    try {
      const playbookNotificationMessage = JSON.parse(
        message.content.toString()
      ) as PlaybookNotificationQueueMessage;
      logger.info("Playbook notification message", playbookNotificationMessage);


      let documentAuditStatus: DocumentAuditStatus =
        DocumentAuditStatus.AUDIT_GENERATED;

      if (
        playbookNotificationMessage.status ===
        PlaybookNotificationStatus.PROCESSING
      ) {

        documentAuditStatus = DocumentAuditStatus.PROCESSING;
      } else if (
        playbookNotificationMessage.status ===
        PlaybookNotificationStatus.COMPLETED
      ) {

        documentAuditStatus = DocumentAuditStatus.AUDIT_GENERATED;
      } else if (
        playbookNotificationMessage.status === PlaybookNotificationStatus.ERROR
      ) {

        documentAuditStatus = DocumentAuditStatus.ERROR;
      }

      await this.auditService.updateAuditStatus(
        playbookNotificationMessage.ca_id,
        playbookNotificationMessage.audit_id,
        playbookNotificationMessage.doc_id,
        documentAuditStatus
      );

      channel.ack(message);
    } catch (error) {
      logger.error("Error processing playbook notification message:", error);
      await this.retryMessage(message, this.MAX_RETRIES);
    }
  }

  async sendMessage(_: PlaybookNotificationQueueMessage): Promise<void> {
    logger.info("NOT IMPLEMENTED");
  }
}

export default PlaybookNotificationQueue;
