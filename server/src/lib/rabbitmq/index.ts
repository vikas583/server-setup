import amqp, { Connection, Channel } from "amqplib";
import logger from "../../utils/logger";

export type ExchangeType = "topic" | "direct" | "fanout" | "headers" | "match";

export class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private prefetchCount: number = 1;

  private constructor(prefetchCount = 1) {
    this.prefetchCount = prefetchCount;
  }

  static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  async getConnection(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await amqp.connect(process.env.RABBITMQ_CONN_STR);
      logger.info("Created new RabbitMQ connection");
    }
    return this.connection;
  }

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      const connection = await this.getConnection();
      this.channel = await connection.createChannel();
      await this.channel.prefetch(this.prefetchCount);
      logger.info("Created new RabbitMQ channel");
    }
    return this.channel;
  }

  async closeConnection(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
