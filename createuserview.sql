-- public."userAccountView" source

CREATE OR REPLACE VIEW public."userAccountView"
AS SELECT u.id,
    u."firstName",
    u."lastName",
    u.email,
    u."createdAt",
    u."isBlocked",
    u."isDeleted",
    u."isLoggedIn",
    u."isUserInfoCompleted",
    u."isPasswordResetCompleted",
    a."isBillingInfoCompleted",
    u."isMFAStepCompleted",
    u."isPrimaryAccountOwner",
    u."isFirstLogin",
    u."position",
    a.id AS "accountId",
    a.name AS "accountName",
    a."shortCode",
    a."isActive" AS "accountIsActive",
    a."createdAt" AS "accountCreatedAt",
    r.name AS "userRole",
    u."profilePicUrl"
   FROM "user" u
     JOIN account a ON u."accountId" = a.id
     JOIN roles r ON u."roleId" = r.id;
