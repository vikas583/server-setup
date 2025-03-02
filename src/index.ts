import "reflect-metadata";
import { dbConnection } from "./utils/dbConnection";
import express, { Request } from "express";
import path from "path";
import morgan from "morgan";
import logger from "./utils/logger";
import { Action, useExpressServer, useContainer } from "routing-controllers";
// import { CustomErrorHandler } from "./middleware/errorHandler";
import { AuthController } from "./controllers/auth";
import Container from "typedi";
import { TokenData, UserAccountView, UserRoles } from "./types";

import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { APIError } from "./utils/APIError";
// import { RESPONSE_STATUS } from "./utils/ResponseStatus";



async function run() {
  try {
    const conn = await dbConnection();

    // Configure typedi container for routing-controllers
    useContainer(Container);

    const app = express();
    app.use(express.json({ limit: "200mb" }));
    app.use(express.urlencoded({ limit: '200mb', extended: true }));
    app.use(express.static(path.join(__dirname, "../public")));
    // app.use(
    //   express.urlencoded({
    //     extended: false,
    //   })
    // );
    app.use(cookieParser());
    app.use(
      morgan("combined", {
        stream: {
          write(text: string) {
            logger.info(text);
          },
        },
      })
    );

    app.use(
      cors({
        origin: process.env.CORS_DOMAINS.split(","),
        methods: "GET,PUT,POST,DELETE,PATCH,OPTIONS".split(","),
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    app.get("/health", async (_, res) => {
      await conn.query("select 1+1 as result;");
      res.send({
        status: "UP",
      });
    });


    // useExpressServer(app, {
    //   defaultErrorHandler: false,
    //   middlewares: [CustomErrorHandler],
    //   controllers: [
    //     AuthController,
    //   ],
    //   authorizationChecker: (action: Action, roles: UserRoles[]) =>
    //     authChecker(action.request, action.response, roles),
    //   currentUserChecker: async (action: Action) => {
    //     try {
    //       const { authorization } = (action.request as Request).headers || {};
    //       const { token: queryToken } = (action.request as Request).query || {};

    //       if (!authorization && typeof queryToken !== "string")
    //         throw new APIError(
    //           "Authentication token is missing!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );

    //       let token = authorization?.split("Bearer ")[1];
    //       if (!token) token = queryToken as string;
    //       if (!token) {
    //         throw new APIError(
    //           "Please login again!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }

    //       const userData = jwt.verify(
    //         token,
    //         process.env.ACCESS_TOKEN_SECRET
    //       ) as TokenData;
    //       if (!userData) {
    //         throw new APIError(
    //           "Please login again!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }
    //       const connection = await dbConnection();

    //       const userWithAccount: UserAccountView[] = await connection.query(
    //         `SELECT * FROM ${process.env.DB_SCHEMA}."userAccountView" WHERE email = $1 AND "accountId" = $2`,
    //         [userData.email, userData.accountId]
    //       );

    //       if (!userWithAccount) {
    //         throw new APIError(
    //           "Invalid account details!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }

    //       if (!userWithAccount.length) {
    //         throw new APIError(
    //           "Invalid account details!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }

    //       if (!userWithAccount[0].isMFAStepCompleted) {
    //         throw new APIError(
    //           "MFA setup is not completed!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }

    //       if (!userWithAccount[0].isPasswordResetCompleted) {
    //         throw new APIError(
    //           "Password setup is not completed!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }
    //       if (!userWithAccount[0].isUserInfoCompleted) {
    //         throw new APIError(
    //           "User info setup is not completed!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }

    //       if (!userWithAccount[0].isBillingInfoCompleted && userWithAccount[0].userRole === UserRoles.account_owner && userWithAccount[0].isPrimaryAccountOwner) {
    //         throw new APIError(
    //           "Billing info setup is not completed!",
    //           RESPONSE_STATUS.UNAUTHENTICATED
    //         );
    //       }

    //       return userWithAccount[0];
    //     } catch (err) {
    //       // console.error(err);
    //       return undefined;
    //     }
    //   },
    // });

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
