import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";

import { Admin } from "./entity/admin";
import { Roles } from "./entity/roles";
import { AdminPermissions } from "./entity/adminPermissions";
import { UserRoles } from "./types";
import { Permissions } from "./entity/permissions";
import { RolePermissions } from "./entity/rolePermissions";
import { AdminRoles } from "./entity/adminRoles";
import { AdminRoles as AdminRolesEnum } from "./admin-types";
import { AdminRolePermissions } from "./entity/AdminRolePermissions";

export const bootstrap = async (dataSource: DataSource) => {
  const p = path.join(__dirname, "../bootstrap.sql");
  const initQuery = await fs.readFile(p, { encoding: "utf-8" });

  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.startTransaction();
  try {
    await queryRunner.query(initQuery);

    // insert data
    const adminRepo = queryRunner.manager.getRepository(Admin);
    const existing = await adminRepo.findOneBy({
      email: process.env.ADMIN_EMAIL,
    });

    if (!existing) {
      const admin = new Admin();
      admin.name = process.env.ADMIN_NAME;
      admin.email = process.env.ADMIN_EMAIL;
      admin.password = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      admin.adminRoleId = 1;

      await adminRepo.save(admin);
    }

    const rolesRepo = queryRunner.manager.getRepository(Roles);
    const rolesToInsert = [
      {
        id: 1,
        name: UserRoles.account_owner,
        description:
          "add or remove contributors, view stats, assign or reassign project owner, create projects,archiving projects, changing scope, start auditing, view audit results, add comments, upload & delete doucments, access all assigned project documents, view all documents",
      },
      {
        id: 2,
        name: UserRoles.project_owner,
        description:
          "add or remove contributors, view stats, archiving projects, changing scope, start auditing, view audit results, add comments, upload & delete doucments, access all assigned project documents.",
      },
      {
        id: 3,
        name: UserRoles.contributor,
        description:
          "view audit results, add comments to audit results & upload documents.",
      },
    ];

    for (const r of rolesToInsert) {
      const existing = await rolesRepo.findOneBy({
        id: r.id,
      });

      if (!existing) {
        await rolesRepo.save({
          name: r.name,
          description: r.description,
        });
      }
    }

    const permissionsRepo = queryRunner.manager.getRepository(Permissions);
    const permissionsToInsert = [
      {
        id: 1,
        name: "Changing Scope",
        value: "changing_scope",
        description: "Permission to change project scope",
      },
      {
        id: 2,
        name: "Create Project",
        value: "create_project",
        description: "Permission to create project",
      },
      {
        id: 3,
        name: "View Archive Project",
        value: "view_archive_project",
        description: "Permission to view archive project.",
      },
      {
        id: 4,
        name: "Start Audit",
        value: "start_audit",
        description: "Permission to start audit",
      },
      {
        id: 5,
        name: "View Audit Results",
        value: "view_audit_results",
        description: "Permission to view audit results",
      },
      {
        id: 6,
        name: "Add Comments",
        value: "add_audit_comments",
        description: "Permission to add audit comments",
      },
      {
        id: 7,
        name: "Upload Documents",
        value: "upload_documents",
        description: "Permission to upload documents",
      },
      {
        id: 8,
        name: "Delete Documents",
        value: "delete_documents",
        description: "Permission to delete documents",
      },
      {
        id: 9,
        name: "Access All Documents",
        value: "access_all_documents",
        description: "Permission to access all documents",
      },
      {
        id: 10,
        name: "Access Project Documents",
        value: "access_project_documents",
        description: "Permission to access all project documents",
      },
      {
        id: 11,
        name: "Add new regulations",
        value: "add_new_regulations",
        description: "Permssion to add new regulations",
      },
      {
        id: 12,
        name: "Add new standards",
        value: "add_new_standards",
        description: "Permission to add new standards",
      },
      {
        id: 13,
        name: "Update regulations",
        value: "update_regulations",
        description: "Permission to update regulations",
      },
      {
        id: 14,
        name: "View all stats",
        value: "view_all_stats",
        description: "Permission to view stats",
      },
      {
        id: 15,
        name: "View project stats",
        value: "view_project_stats",
        description: "Permission to project stats",
      },
      {
        id: 16,
        name: "Assign project",
        value: "assign_project",
        description: "Permission to assign projects.",
      },
      {
        id: 17,
        name: "Reassign project",
        value: "reassign_project",
        description: "Permission to reassign projects",
      },
      {
        id: 18,
        name: "Adding contributors",
        value: "add_contributors",
        description: "Permission to add contributors",
      },
      {
        id: 19,
        name: "Remove contributors",
        value: "remove_contributors",
        description: "Permission to remove contributors",
      },
      {
        id: 20,
        name: "Archive Project",
        value: "archive_project",
        description: "Permission to archive project",
      },
    ];

    for (const p of permissionsToInsert) {
      const existing = await permissionsRepo.findOneBy({
        id: p.id,
      });

      if (!existing) {
        await permissionsRepo.save({
          name: p.name,
          value: p.value,
          description: p.description,
        });
      }
    }

    const rolePermissionsRepo =
      queryRunner.manager.getRepository(RolePermissions);
    const rolePermissionsToInsert = [
      {
        permissionId: 1,
        roleId: 1,
      },
      {
        permissionId: 2,
        roleId: 1,
      },
      {
        permissionId: 3,
        roleId: 1,
      },
      {
        permissionId: 5,
        roleId: 1,
      },
      {
        permissionId: 6,
        roleId: 1,
      },
      {
        permissionId: 7,
        roleId: 1,
      },
      {
        permissionId: 9,
        roleId: 1,
      },
      {
        permissionId: 10,
        roleId: 1,
      },
      {
        permissionId: 11,
        roleId: 1,
      },
      {
        permissionId: 12,
        roleId: 1,
      },
      {
        permissionId: 13,
        roleId: 1,
      },
      {
        permissionId: 14,
        roleId: 1,
      },
      {
        permissionId: 15,
        roleId: 1,
      },
      {
        permissionId: 16,
        roleId: 1,
      },
      {
        permissionId: 17,
        roleId: 1,
      },
      {
        permissionId: 18,
        roleId: 1,
      },
      {
        permissionId: 19,
        roleId: 1,
      },
      {
        permissionId: 20,
        roleId: 1,
      },
      {
        permissionId: 1,
        roleId: 2,
      },
      {
        permissionId: 3,
        roleId: 2,
      },
      {
        permissionId: 4,
        roleId: 2,
      },
      {
        permissionId: 5,
        roleId: 2,
      },
      {
        permissionId: 6,
        roleId: 2,
      },
      {
        permissionId: 7,
        roleId: 2,
      },
      {
        permissionId: 8,
        roleId: 2,
      },
      {
        permissionId: 10,
        roleId: 2,
      },
      {
        permissionId: 15,
        roleId: 2,
      },
      {
        permissionId: 18,
        roleId: 2,
      },
      {
        permissionId: 19,
        roleId: 2,
      },
      {
        permissionId: 20,
        roleId: 2,
      },
      {
        permissionId: 5,
        roleId: 3,
      },
      {
        permissionId: 6,
        roleId: 3,
      },
      {
        permissionId: 7,
        roleId: 3,
      },
    ];

    for (const rp of rolePermissionsToInsert) {
      const existing = await rolePermissionsRepo.findOneBy({
        permissionId: rp.permissionId,
        roleId: rp.roleId,
      });

      if (!existing) {
        await rolePermissionsRepo.save({
          permissionId: rp.permissionId,
          roleId: rp.roleId,
        });
      }
    }

    const adminRolesRepo = queryRunner.manager.getRepository(AdminRoles);
    const adminRolesToInsert = [
      {
        name: AdminRolesEnum.ADMIN,
        description: "has all permissions",
      },
    ];

    for (const ar of adminRolesToInsert) {
      const existing = await adminRolesRepo.findOneBy({
        name: ar.name,
      });

      if (!existing) {
        await adminRolesRepo.save({
          name: ar.name,
          description: ar.description,
        });
      }
    }

    const adminPermissionsRepo =
      queryRunner.manager.getRepository(AdminPermissions);
    const adminPermissionsToInsert = [
      {
        name: "manage_users",
        description: "Permission to manage users",
      },
      {
        name: "view_reports",
        description: "Permission to view reports",
      },
      {
        name: "edit_content",
        description: "Permission to edit content",
      },
    ];

    for (const ap of adminPermissionsToInsert) {
      const existing = await adminPermissionsRepo.findOneBy({
        name: ap.name,
      });

      if (!existing) {
        await adminPermissionsRepo.save({
          name: ap.name,
          description: ap.description,
        });
      }
    }

    const adminRolePermissionsRepo =
      queryRunner.manager.getRepository(AdminRolePermissions);
    const adminRolePermissionsToInsert = [
      {
        adminPermissionId: 1,
        adminRoleId: 1,
      },
      {
        adminPermissionId: 2,
        adminRoleId: 1,
      },
      {
        adminPermissionId: 3,
        adminRoleId: 1,
      },
    ];

    for (const arp of adminRolePermissionsToInsert) {
      const existing = await adminRolePermissionsRepo.findOneBy({
        adminPermissionId: arp.adminPermissionId,
        adminRoleId: arp.adminRoleId,
      });

      if (!existing) {
        await adminRolePermissionsRepo.save({
          adminPermissionId: arp.adminPermissionId,
          adminRoleId: arp.adminRoleId,
        });
      }
    }

    await queryRunner.commitTransaction();
    console.log("Database initialized");
  } catch (error) {
    console.error(error);
    await queryRunner.rollbackTransaction();
  }
};
