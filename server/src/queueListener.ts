import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { useContainer, useExpressServer } from "routing-controllers";
import Container from "typedi";
import { dbConnection } from "./utils/dbConnection";
import logger from "./utils/logger";
import EmailQueue from "./lib/rabbitmq/queues/email";
import { AbstractQueue } from "./lib/rabbitmq/abstractQueue";
import DocProcessNotificationQueue from "./lib/rabbitmq/queues/docProcessNotification";
import PlaybookNotificationQueue from "./lib/rabbitmq/queues/playbookNotification";

async function run() {
  try {
    await dbConnection();
    // Configure typedi container for routing-controllers
    useContainer(Container);

    // Get queue name from command line arguments
    const queueName = process.argv[2];
    if (!queueName) {
      throw new Error("Queue name must be provided as a command line argument");
    }

    let queue: AbstractQueue<unknown>;
    switch (queueName) {
      case "email":
        queue = Container.get(EmailQueue);
        break;
      case "doc_process_notification":
        queue = Container.get(DocProcessNotificationQueue);
        break;
      case "playbook_notification":
        queue = Container.get(PlaybookNotificationQueue);
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
    await queue.consumeMessages();

    const app = express();
    app.use(
      morgan("combined", {
        stream: {
          write(text: string) {
            logger.info(text);
          },
        },
      })
    );
    let date = new Date()

    app.get("/health", async (_, res) => {
      if(Date.now() - date.getTime() > (120 * 1000)){
        throw new Error("Health check failed");
      }
      res.send({
        status: "UP",
      });
    });

    useExpressServer(app, {
      defaultErrorHandler: false,
      middlewares: [],
      controllers: [],
    });

    let port = process.env.PORT ? +parseInt(process.env.PORT) : NaN;

    port = isNaN(port) ? 5000 : port;
    app.listen(port, () => {
      logger.info(`env is ${process.env.NODE_ENV}`);
      logger.info(`Listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
