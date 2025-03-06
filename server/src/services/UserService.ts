import { Inject, Service } from "typedi";
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
import { dbConnection } from "../utils/dbConnection";
import { User } from "../entity/user";
import {
  CreateUserRequest,
  InitialSetPasswordRequest,
  InitialUserUpdateRequest,
  ResetPasswordRequestLoggedInUser,
  TokenData,
  UpdateUserDetails,
  UserAccountView,
  UserRoles,
} from "../types";
import logger from "../utils/logger";

import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateExpiryDate,
  generateRefreshToken,
} from "../utils/authUtils";
import BlobService from "./BlobService";
import fs from "fs"
import { Roles } from "../entity/roles";
import { ProjectService } from "./ProjectService";
import { RoleService } from "./RoleService";
import { loadTemplate } from "../utils/loadTemplate";
import EmailQueue from "../lib/rabbitmq/queues/email";


@Service()
export class UserService {

  constructor(
    @Inject()
    private readonly blobService: BlobService,
    @Inject()
    private readonly projectService: ProjectService,
    @Inject()
    private readonly roleService: RoleService,
    @Inject()
    private readonly emailQueue: EmailQueue
  ) { }

  /**
   * Handles getting active users list.
   *
   * This method get list of users belonging to same account.
   *
   * @returns {Promise<User>} - The created User entity.
   */
  async getActiveAccountUser(accountId: number, userId: number) {
    try {
      const dataSource = await dbConnection();

      const users: User[] = await dataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .where(`"user"."accountId" = :accountId`, { accountId })
        .andWhere(`("user"."isBlocked" = false and "user"."isDeleted" = false)`)
        .andWhere(`user.id  != :userId`, { userId })
        .select([
          '"user".id as id',
          `CONCAT("user"."firstName",concat(' ',"user"."lastName")) as name`,
          `"user".email as email`,
        ])
        .getRawMany();

      return users;
    } catch (err) {
      logger.error("Server::Service UserService::GetActiveAccountUser");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async getUserDetails(userId: number) {
    try {
      const dataSource = await dbConnection();

      const [userDetails]: UserAccountView[] = await dataSource.query(
        `select * from ${process.env.DB_SCHEMA}."userAccountView" uav where uav.id = ${userId};`
      );

      return userDetails;
    } catch (err) {
      logger.error("Server::Service User::Details");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async initialUpdateUser(
    body: InitialUserUpdateRequest,
    user: UserAccountView
  ) {
    try {
      const dataSource = await dbConnection();

      let obj: {
        firstName?: string;
        lastName?: string;
        position?: string;
        isUserInfoCompleted: boolean;
      } = {
        isUserInfoCompleted: true,
      };

      if (user.firstName !== body.firstName) {
        obj.firstName = body.firstName;
      }
      if (user.lastName !== body.lastName) {
        obj.lastName = body.lastName;
      }
      if (user.position !== body.position) {
        obj.position = body.position;
      }

      const updateUser = await dataSource.getRepository(User).update(
        {
          id: user.id,
        },
        obj
      );

      if (!updateUser)
        throw new APIError(
          "Something went wrong, try again later!",
          RESPONSE_STATUS.INTERNAL_SERVER_ERROR
        );

      return;
    } catch (err) {
      logger.error("Server::Service Regulation::List");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async list(user: UserAccountView) {
    try {
      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`;
      const dataSource = await dbConnection();

      const users =
        await dataSource.query(`SELECT u.id, u."firstName",u."lastName",u.email,r."name" as "userRole", array_agg(p."projectName") 
                                                    as projects from ${process.env.DB_SCHEMA}."user" u 
                                                    left join ${schemaName}.user_project_access upa on upa."userId" = u.id
                                                    left join ${schemaName}.project p on p.id = upa."projectId"
                                                    left join ${process.env.DB_SCHEMA}.roles r ON u."roleId" = r.id
                                                    where u."accountId" =${user.accountId} and u.id != ${user.id} and u."isDeleted"=false and u."isBlocked" = false group by u.id, r."name" ;
                                                `);

      return users;
    } catch (err) {
      logger.error("Server::Service UserService::list");
      logger.error(err);
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async revokeAccess(userId: number, user: UserAccountView) { }

  async create(body: CreateUserRequest, user: UserAccountView) {
    try {
      const dataSource = await dbConnection();
      const userAlreadyExist = await dataSource.getRepository(User).findOne({
        where: {
          email: body.email,
        },
      });

      if (userAlreadyExist) {
        throw new APIError("Email already exist!", RESPONSE_STATUS.CONFLICT);
      }

      const role = await this.roleService.getRoleById(body.roleId)
      if (!role) {
        throw new APIError("Invalid role!", RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
      }

      const checkUser = await dataSource.getRepository(User).findOne({
        where: {
          roleId: role.id,
          accountId: user.accountId,
          isDeleted: false,
        }
      })

      if (checkUser) {
        throw new APIError("User with this role already exists!", RESPONSE_STATUS.CONFLICT)
      }

      // generatePassword()
      const password = "test@123";

      const userObj = new User();
      userObj.firstName = body.firstName;
      userObj.lastName = body.lastName;
      userObj.email = body.email;
      userObj.roleId = body.roleId;
      userObj.createdBy = user.id;
      userObj.password = bcrypt.hashSync(password, 10);
      userObj.accountId = user.accountId;

      const isCreated = await dataSource.getRepository(User).save(userObj);

      if (isCreated) {

        const subject = "Your account has been created!"

        // Load the email template and replace placeholders
        const html = await loadTemplate('register',
          {
            email: userObj.email,
            password: userObj.password,
            username: userObj.firstName + ' ' + userObj.lastName
          });

        await this.emailQueue.sendMessage({
          to: userObj.email,
          subject,
          body: html,
          isHtml: true,
        });

        return true;
      }

      throw new APIError(
        "Something went wrong, try again later!",
        RESPONSE_STATUS.UNPROCESSABLE_ENTITY
      );
    } catch (err) {
      console.log(err);
      logger.error("Server::Service UserService::Create");


      let errorMessage = "Something went wrong, try again later!";
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }
  }

  async update(body: UpdateUserDetails, user: UserAccountView) {
    try {
      const userDetails = await this.getUserDetails(body.userId)

      if (userDetails.isPrimaryAccountOwner) {
        throw new APIError('You can\'t update primary account owner!', RESPONSE_STATUS.BAD_REQUEST)
      }

      if (!userDetails) {
        throw new APIError('Invalid user to update!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
      }
      let obj: { roleId?: number, firstName?: string, lastName?: string, email?: string } = {}
      const dataSource = await dbConnection()
      if (body.roleId) {

        const roleDetails = await dataSource.getRepository(Roles).findOne({
          where: {
            id: body.roleId
          }
        })

        if (!roleDetails) {
          throw new APIError('Invalid user role!', RESPONSE_STATUS.UNPROCESSABLE_ENTITY)

        }
        obj.roleId = roleDetails.id
      }

      if (body.firstName) obj.firstName = body.firstName
      if (body.lastName) obj.lastName = body.lastName
      if (body.email) obj.email = body.email

      if (Object.keys(obj).length === 0) {
        throw new APIError('Nothing to update', RESPONSE_STATUS.BAD_REQUEST)
      }

      const updateUser = await dataSource.getRepository(User).update(
        {
          id: body.userId
        },
        obj
      )
      if (updateUser) {
        return true
      }

      throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)

    } catch (err) {
      let errorMessage = 'Something went wrong, try again later!';
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }
  }

  async updatePassword(body: InitialSetPasswordRequest, user: UserAccountView) {
    try {
      const dataSource = await dbConnection();

      let obj: {
        password: string;
        isPasswordResetCompleted: boolean;
      } = {
        password: bcrypt.hashSync(body.password, 10),
        isPasswordResetCompleted: true,
      };

      const setPassword = await dataSource.getRepository(User).update(
        {
          id: user.id,
        },
        obj
      );

      if (!setPassword)
        throw new APIError(
          "Something went wrong, try again later!",
          RESPONSE_STATUS.INTERNAL_SERVER_ERROR
        );

      return;
    } catch (err) {
      logger.error("Server::Service Regulation::List");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async authenticateUser(userId: number) {
    try {
      const dataSource = await dbConnection();

      const user = await this.getUserDetails(userId);

      if (!user) {
        throw new APIError(
          `User doesn't exist!`,
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      const tokenData: TokenData = {
        accountId: user.accountId,
        email: user.email,
        role: user.userRole,
      };

      const refreshToken = generateRefreshToken(tokenData, "60m");
      const accessToken = generateAccessToken(tokenData);
      const refreshTokenExpiresAt = generateExpiryDate();

      await dataSource.getRepository(User).update(
        {
          id: user.id,
        },
        {
          lastLoginAt: new Date(),
          refreshAuthToken: refreshToken,
          refreshAuthTokenExpiresAt: refreshTokenExpiresAt,
          isLoggedIn: true,

        }
      );

      return { accessToken, refreshToken, user };
    } catch (error: any) {
      console.log(error);
      throw new APIError(
        "Something went wrong, try again later!",
        RESPONSE_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async AfterMFASecretGenerated(userId: number) {
    try {
      return await (await dbConnection())
        .getRepository(User)
        .update({ id: userId }, { isMFAStepCompleted: true });
    } catch (err) {
      logger.error("Server::Service User::MFASecretGenerate");
      const errorMessage =
        (err as APIError).msg || "Something went wrong, try again later!";
      const errorCode =
        (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;
      throw new APIError(errorMessage, errorCode);
    }
  }

  async updateProfilePic(user: UserAccountView, file: any) {
    try {

      if (user.profilePicUrl) {
        await this.removeProfilePic(user)
      }

      const fileUrl: string = await this.blobService.upload(file.path, `${user.shortCode}/${process.env.PROFILE_PIC_BLOB_DIRECTORY_NAME}`);
      if (!fileUrl) {
        throw new APIError('Something went wrong, try again later!', RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
      }
      await fs.promises.unlink(file.path)
      const dataSource = await dbConnection()
      const updateUser = await dataSource.getRepository(User).update({
        id: user.id
      }, {
        profilePicUrl: fileUrl
      })

      if (updateUser) {
        return true
      }

      return false


    } catch (err) {
      let errorMessage = 'Something went wrong, try again later!';
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      await fs.promises.unlink(file.path)
      await this.blobService.delete(file.path, `/${user.shortCode}/${process.env.PROFILE_PIC_BLOB_DIRECTORY_NAME}`)

      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }
  }

  async removeProfilePic(user: UserAccountView) {
    try {
      if (user.profilePicUrl) {
        const fileArr = user.profilePicUrl.split('/')
        const fileName = fileArr[fileArr.length - 1]

        const deleteFile = await this.blobService.delete(fileName, `${user.shortCode}/${process.env.PROFILE_PIC_BLOB_DIRECTORY_NAME}`)

        if (deleteFile) {
          const dataSource = await dbConnection()
          const updateUser = await dataSource.getRepository(User).update({
            id: user.id
          }, {
            profilePicUrl: null
          })

          if (updateUser) {
            return true
          }

          return false

        } else {
          throw new APIError("Something went wrong, while deleting the file", RESPONSE_STATUS.INTERNAL_SERVER_ERROR)
        }

      } else {
        throw new APIError("Profile pic doesn't exsist, you can't perform this action!!!", RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
      }

    } catch (err) {
      let errorMessage = 'Something went wrong, try again later!';
      let errorCode = RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

      if (err instanceof APIError) {
        errorMessage = err.msg;
        errorCode = err.httpCode;
      }

      throw new APIError(errorMessage, errorCode);
    }
  }

  async removeUser(userId: number, user: UserAccountView) {
    const dataSource = await dbConnection()
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {

      const schemaName = `${process.env.DB_INITIAL}_${user.shortCode}`

      const userToDelete = await queryRunner.manager.getRepository(User).findOne({
        where: { id: userId, isDeleted: false }
      });

      if (!userToDelete) {
        throw new APIError('User not found or already deleted', RESPONSE_STATUS.NOT_FOUND);
      }

      if (userToDelete.isPrimaryAccountOwner) {
        throw new APIError('You can\'t delete primary account owner', RESPONSE_STATUS.BAD_REQUEST)
      }



      await dataSource.query(`delete from ${schemaName}.user_project_access where "userId" = ${userId}`)

      await queryRunner.manager.getRepository(User).update({
        id: userId
      }, {
        isDeleted: true,
        deletedBy: user.id,
      })

      await queryRunner.commitTransaction();

      return true


    } catch (err) {
      await queryRunner.rollbackTransaction();
      let errorMessage = 'Something went wrong, try again later!';
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

  async resetPasswordLoggedIn(body: ResetPasswordRequestLoggedInUser, user: UserAccountView) {
    try {
      const dataSource = await dbConnection();

      const userDetails = await dataSource.getRepository(User).findOne({
        where: { id: user.id },
        select: ['id', 'password']
      });

      if (!userDetails) {
        throw new APIError("User not found", RESPONSE_STATUS.NOT_FOUND);
      }

      // Validate old password
      const isValidOldPassword = bcrypt.compareSync(body.oldPassword, userDetails.password);
      if (!isValidOldPassword) {
        throw new APIError('Current password is incorrect', RESPONSE_STATUS.BAD_REQUEST);
      }

      // Check if new password is same as old
      if (body.newPassword === body.oldPassword) {
        throw new APIError("New password must be different from current password", RESPONSE_STATUS.BAD_REQUEST);
      }

      // Validate password strength
      if (!this.isPasswordStrong(body.newPassword)) {
        throw new APIError(
          "Password must be at least 8 characters long and contain uppercase, lowercase, number and special characters",
          RESPONSE_STATUS.BAD_REQUEST
        );
      }

      // Update password
      const updateResult = await dataSource.getRepository(User).update(
        { id: userDetails.id },
        {
          password: bcrypt.hashSync(body.newPassword, 10),
          passwordUpdatedAt: new Date() // Track when password was changed
        }
      );

      if (!updateResult.affected) {
        throw new APIError('Failed to update password', RESPONSE_STATUS.INTERNAL_SERVER_ERROR);
      }

      return true;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }

      logger.error('Password reset failed:', err);
      throw new APIError('Failed to reset password', RESPONSE_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  private isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar;
  }

  async stepAfterInitialSetupMFAValidation(userId: number) {
    try {
      const dataSource = await dbConnection();

      const user = await this.getUserDetails(userId);

      if (!user) {
        throw new APIError(
          `User doesn't exist!`,
          RESPONSE_STATUS.UNAUTHENTICATED
        );
      }

      await dataSource.getRepository(User).update(
        {
          id: user.id,
        },
        {
          isLoggedIn: true,
          isMFAEnabled: true,
          isFirstLogin: false,
          isMFAStepCompleted: true,
        }
      );

      return { user };
    } catch (error: any) {
      console.log(error);
      throw new APIError(
        "Something went wrong, try again later!",
        RESPONSE_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
