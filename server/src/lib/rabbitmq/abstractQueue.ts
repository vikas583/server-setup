import logger from "../../utils/logger";
import { RabbitMQConnection, type ExchangeType } from ".";
import { Channel, ConsumeMessage } from "amqplib";

export type QueueConfig = {
  queueName: string;
  exchangeName: string;
  routingKey: string;
  exchangeType?: ExchangeType;
  noAck?: boolean;
  prefetchCount?: number;
};

// when you set noAck to true it means automatic acknowledgement of messages
// even if the worker is not able to process the message it will be deleted from the queue,
// when you set noAck to false that means untill you manually acknowledge that you have
// successfully processed/acknowledged the message, it will remain in the queue and after
// certain amount of time it will be requeued and delivered to a different consumer

type QueueConfigInternal = Required<QueueConfig>;
export abstract class AbstractQueue<T> {
  private connection: RabbitMQConnection;
  private config: QueueConfigInternal;
  private _channel: Promise<Channel>;

  protected constructor(config: QueueConfig) {
    this.connection = RabbitMQConnection.getInstance();
    this._channel = this.connection.getChannel();
    this.config = {
      ...{ exchangeType: "topic", noAck: false, prefetchCount: 1 },
      ...config,
    };
  }

  // Getters
  protected get queue(): string {
    return this.config.queueName;
  }

  protected get exchange(): string {
    return this.config.exchangeName;
  }

  protected get routing(): string {
    return this.config.routingKey;
  }

  protected get channel(): Promise<Channel> {
    return this._channel;
  }

  private async bindQueue(): Promise<void> {
    const channel = await this.channel;

    await channel.assertExchange(this.exchange, this.config.exchangeType, {
      durable: true,
    });
    const queue = await channel.assertQueue(this.queue, {
      durable: true,
    });
    await channel.bindQueue(queue.queue, this.exchange, this.routing);
  }

  async consumeMessages(): Promise<void> {
    await this.bindQueue();
    const channel = await this.channel;
    logger.info(`Consumer started for queue: ${this.queue}`);

    await channel.consume(
      this.queue,
      async (message) => {
        if (message) {
          try {
            await this.processMessage(message);
          } catch (error) {
            logger.error(`Error processing message: ${error}`);
          }
        }
      },
      {
        noAck: this.config.noAck,
      }
    );
  }

  protected async sendMessageInternal(message: T): Promise<void> {
    const channel = await this.channel;

    await channel.assertExchange(this.exchange, this.config.exchangeType, {
      durable: true,
    });

    const messageBuffer = Buffer.isBuffer(message)
      ? message
      : Buffer.from(JSON.stringify(message));
    channel.publish(this.exchange, this.routing, messageBuffer, {
      persistent: true,
    });

    logger.info(`Sent message to queue: ${this.queue}`);
  }

  protected async retryMessage(message: ConsumeMessage, maxRetries: number) {
    if (this.config.noAck) {
      logger.warn(
        `Custom retry is not supported for queue: ${this.queue} because noAck is true`
      );
      return false;
    }

    const channel = await this.channel;
    channel.ack(message);

    const headers = message.properties.headers || {};
    const currentRetries = Number(headers["x-retry-count"] || "0");

    if (currentRetries >= maxRetries) {
      logger.warn(`Max retries reached`);
      return false;
    }

    const newHeaders = { ...headers, "x-retry-count": currentRetries + 1 };
    channel.publish(this.exchange, this.routing, message.content, {
      headers: newHeaders,
    });
    logger.info(`Retry count: #${currentRetries + 1}`);

    return true;
  }

  protected abstract processMessage(message: ConsumeMessage): Promise<void>;

  abstract sendMessage(message: T): Promise<void>;
}
