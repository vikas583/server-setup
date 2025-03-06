import { ConsumeMessage } from "amqplib";
import { Service } from "typedi";
import {
  EmailClient,
  KnownEmailSendStatus,
  EmailMessage,
} from "@azure/communication-email";
import { AbstractQueue } from "../abstractQueue";
import logger from "../../../utils/logger";

export type EmailQueueMessage = {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  isHtml: boolean;
};

@Service()
class EmailQueue extends AbstractQueue<EmailQueueMessage> {
  private emailClient: EmailClient;
  private readonly POLLER_WAIT_TIME_SECONDS = 10;
  private readonly MAX_POLLING_ATTEMPTS = 18;
  private readonly MAX_RETRIES = 3;

  constructor() {
    super({
      queueName: "email-queue",
      exchangeName: "audit-email-exchange",
      routingKey: "email-routing-key",
      noAck: false,
      exchangeType: 'direct',
    });

    const connectionString = process.env.ACS_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("ACS_CONNECTION_STRING environment variable is not set");
    }

    this.emailClient = new EmailClient(connectionString);
  }

  protected async processMessage(message: ConsumeMessage) {
    const channel = await this.channel;
    try {
      const emailMessage = JSON.parse(
        message.content.toString()
      ) as EmailQueueMessage;

      const azureEmailMessage: EmailMessage = {
        senderAddress: process.env.EMAIL_SENDER_ADDRESS,
        recipients: {
          to: Array.isArray(emailMessage.to)
            ? emailMessage.to.map((address) => ({ address }))
            : [{ address: emailMessage.to }],
          cc: emailMessage.cc
            ? Array.isArray(emailMessage.cc)
              ? emailMessage.cc.map((address) => ({ address }))
              : [{ address: emailMessage.cc }]
            : undefined,
          bcc: emailMessage.bcc
            ? Array.isArray(emailMessage.bcc)
              ? emailMessage.bcc.map((address) => ({ address }))
              : [{ address: emailMessage.bcc }]
            : undefined,
        },
        content: {
          subject: emailMessage.subject,
          ...(emailMessage.isHtml
            ? { html: emailMessage.body }
            : { plainText: emailMessage.body }),
        },
      };

      const poller = await this.emailClient.beginSend(azureEmailMessage);

      if (!poller.getOperationState().isStarted) {
        throw new Error("Email poller was not started");
      }

      let attempts = 0;
      while (!poller.isDone()) {
        poller.poll();
        logger.debug("Email send polling in progress");

        await new Promise((resolve) =>
          setTimeout(resolve, this.POLLER_WAIT_TIME_SECONDS * 1000)
        );
        attempts += 1;

        if (attempts > this.MAX_POLLING_ATTEMPTS) {
          throw new Error("Polling timed out");
        }
      }

      const result = poller.getResult();
      if (result?.status === KnownEmailSendStatus.Succeeded) {
        logger.info(`Successfully sent email (operation id: ${result.id})`);
        channel.ack(message);
      } else {
        throw result?.error;
      }
    } catch (error) {
      logger.error("Error processing email message:", error);
      await this.retryMessage(message, this.MAX_RETRIES);
    }
  }

  async sendMessage(message: EmailQueueMessage): Promise<void> {
    logger.info("send message to email queue", message);
    await this.sendMessageInternal(message);
  }
}
export default EmailQueue;
