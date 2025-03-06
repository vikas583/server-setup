import { ConsumeMessage } from "amqplib";
import { Inject, Service } from "typedi";
import { AbstractQueue } from "../abstractQueue";
import logger from "../../../utils/logger";
import { DocumentStatus } from "../../../types";
import { DocumentService } from "../../../services/DocumentService";

export type DocProcessNotificationQueueMessage = {
  ca_id: string;
  proj_id: number;
  doc_id: number;
  user_id: number;
  status: DocumentStatus;
  message: string;
};

@Service()
class DocProcessNotificationQueue extends AbstractQueue<DocProcessNotificationQueueMessage> {
  private readonly MAX_RETRIES = 3;

  constructor(
    @Inject()
    private readonly documentService: DocumentService
  ) {
    super({
      queueName: "doc_process_notification_queue",
      exchangeName: "iva_doc_process_notification_durable",
      routingKey: "doc_process_notification_routing_key",
      noAck: false,
    });
  }

  protected async processMessage(message: ConsumeMessage) {
    const channel = await this.channel;
    try {
      const docProcessNotificationMessage = JSON.parse(
        message.content.toString()
      ) as DocProcessNotificationQueueMessage;
      logger.info(
        "Doc process notification message",
        docProcessNotificationMessage
      );
      await this.documentService.updateDocumentStatus(
        docProcessNotificationMessage.ca_id,
        docProcessNotificationMessage.doc_id,
        docProcessNotificationMessage.status
      );

      channel.ack(message);
    } catch (error) {
      logger.error("Error processing doc process notification message:", error);
      await this.retryMessage(message, this.MAX_RETRIES);
    }
  }

  async sendMessage(
    message: DocProcessNotificationQueueMessage
  ): Promise<void> {
    logger.info("send message to doc process notification queue", message);
    await this.sendMessageInternal(message);
  }
}

export default DocProcessNotificationQueue;
