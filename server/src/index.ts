import "reflect-metadata";
import { dbConnection } from "./utils/dbConnection";
import express, { Request } from "express";
import path from "path";
import morgan from "morgan";
import logger from "./utils/logger";
import { Action, useExpressServer, useContainer } from "routing-controllers";
import { CustomErrorHandler } from "./middleware/errorHandler";
import { AuthController } from "./controllers/auth";
import Container from "typedi";
import { ExtractController } from "./controllers/extract";
import { TokenData, UserAccountView, UserRoles } from "./types";
import { authChecker } from "./utils/authChecker";
import jwt from "jsonwebtoken";
import { AdminAuthController } from "./controllers/admin/adminAuth";
import { AdminController } from "./controllers/admin/admin";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AdminCustomerController } from "./controllers/admin/adminCustomer";
import { AdminCustomerRoles } from "./controllers/admin/adminCustomerRoles";
import { AdminDashboardController } from "./controllers/admin/adminDashboard";
import { AdminAccountsController } from "./controllers/admin/adminAccounts";
import { APIError } from "./utils/APIError";
import { RESPONSE_STATUS } from "./utils/ResponseStatus";
import { AdminRegulationsController } from "./controllers/admin/adminRegulations";
import { AdminRolesController } from "./controllers/admin/adminRoles";
import { ProjectController } from "./controllers/project";
import { UserController } from "./controllers/user";
import { RegulationController } from "./controllers/regulation";
import { RegulationDetailController } from "./controllers/regulationDetail";
import { AdminFeedbackController } from "./controllers/admin/adminFeedback";
import { FeedbackController } from "./controllers/feedback";
import { DocumentsController } from "./controllers/documents";
import { AuditController } from "./controllers/audit";
import { AccountController } from "./controllers/account";
import { RolesController } from "./controllers/role";
import { bootstrap } from "./bootstrap";
import { AdminProjectController } from "./controllers/admin/adminProject";
import { AdminAuditsController } from "./controllers/admin/adminAudits";
async function run() {
  try {
    const conn = await dbConnection();

    if (process.env.NODE_ENV === "development") {
      await bootstrap(conn);
    }
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


    useExpressServer(app, {
      defaultErrorHandler: false,
      middlewares: [CustomErrorHandler],
      controllers: [
        AdminAuthController,
        AdminController,
        AdminCustomerController,
        AdminCustomerRoles,
        AdminDashboardController,
        AdminAccountsController,
        AdminRegulationsController,
        AdminRolesController,
        AdminFeedbackController,
        AdminProjectController,
        AdminAuditsController,

        //user controllers
        AuthController,
        ExtractController,
        ProjectController,
        UserController,
        RegulationController,
        RegulationDetailController,
        FeedbackController,
        DocumentsController,
        AuditController,
        AccountController,
        RolesController,
      ],
      authorizationChecker: (action: Action, roles: UserRoles[]) =>
        authChecker(action.request, action.response, roles),
      currentUserChecker: async (action: Action) => {
        try {
          const { authorization } = (action.request as Request).headers || {};
          const { token: queryToken } = (action.request as Request).query || {};

          if (!authorization && typeof queryToken !== "string")
            throw new APIError(
              "Authentication token is missing!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );

          let token = authorization?.split("Bearer ")[1];
          if (!token) token = queryToken as string;
          if (!token) {
            throw new APIError(
              "Please login again!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }

          const userData = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
          ) as TokenData;
          if (!userData) {
            throw new APIError(
              "Please login again!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }
          const connection = await dbConnection();

          const userWithAccount: UserAccountView[] = await connection.query(
            `SELECT * FROM ${process.env.DB_SCHEMA}."userAccountView" WHERE email = $1 AND "accountId" = $2`,
            [userData.email, userData.accountId]
          );

          if (!userWithAccount) {
            throw new APIError(
              "Invalid account details!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }

          if (!userWithAccount.length) {
            throw new APIError(
              "Invalid account details!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }

          if (!userWithAccount[0].isMFAStepCompleted) {
            throw new APIError(
              "MFA setup is not completed!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }

          if (!userWithAccount[0].isPasswordResetCompleted) {
            throw new APIError(
              "Password setup is not completed!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }
          if (!userWithAccount[0].isUserInfoCompleted) {
            throw new APIError(
              "User info setup is not completed!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }

          if (!userWithAccount[0].isBillingInfoCompleted && userWithAccount[0].userRole === UserRoles.account_owner && userWithAccount[0].isPrimaryAccountOwner) {
            throw new APIError(
              "Billing info setup is not completed!",
              RESPONSE_STATUS.UNAUTHENTICATED
            );
          }

          return userWithAccount[0];
        } catch (err) {
          // console.error(err);
          return undefined;
        }
      },
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
