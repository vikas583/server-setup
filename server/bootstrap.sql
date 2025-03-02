-- create view
-- iva_vikas."userAccountView" source

CREATE OR REPLACE VIEW iva_vikas."userAccountView"
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
   FROM iva_vikas."user" u
     JOIN iva_vikas.account a ON u."accountId" = a.id
     JOIN iva_vikas.roles r ON u."roleId" = r.id;

-- create function
DROP FUNCTION IF EXISTS iva_vikas.create_schema_from_template(text);

CREATE
OR REPLACE FUNCTION iva_vikas.create_schema_from_template(shortcode text) RETURNS void LANGUAGE plpgsql AS $$ DECLARE new_schema_name TEXT;

tbl RECORD;

fk RECORD;

idx RECORD;

func RECORD;

BEGIN -- Define the new schema name based on the provided shortcode
new_schema_name := format('iva_ca_%s', shortcode);

-- Step 1: Create the new schema
EXECUTE format(
  'CREATE SCHEMA IF NOT EXISTS %I',
  new_schema_name
);

-- Step 2: Copy tables from the template schema to the new schema
FOR tbl IN
SELECT
  table_name
FROM
  information_schema.tables
WHERE
  table_schema = 'iva_ca_template' LOOP -- Create table structure in the new schema
  EXECUTE format(
    'CREATE TABLE %I.%I (LIKE iva_ca_template.%I INCLUDING ALL)',
    new_schema_name,
    tbl.table_name,
    tbl.table_name
  );

END LOOP;

-- Step 3: Copy indexes for each table in the new schema
FOR idx IN
SELECT
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'iva_ca_template' LOOP EXECUTE replace(idx.indexdef, 'iva_ca_template', new_schema_name);

END LOOP;

-- Step 4: Copy foreign key constraints for each table in the new schema
FOR fk IN
SELECT
  conname AS constraint_name,
  conrelid :: regclass :: text AS table_name,
  pg_get_constraintdef(oid) AS constraint_def
FROM
  pg_constraint
WHERE
  connamespace = 'iva_ca_template' :: regnamespace
  AND contype = 'f' -- Foreign key constraint
  LOOP -- Check if the referenced table exists in the new schema
  IF EXISTS (
    SELECT
      1
    FROM
      information_schema.tables
    WHERE
      table_schema = new_schema_name
      AND table_name = split_part(fk.constraint_def, 'REFERENCES ', 2) :: text
  ) THEN -- Create the foreign key constraint referencing the new schema
  EXECUTE format(
    'ALTER TABLE %I.%I ADD CONSTRAINT %I %s',
    new_schema_name,
    fk.table_name,
    fk.constraint_name,
    replace(
      fk.constraint_def,
      'iva_ca_template.',
      format('%I.', new_schema_name)
    )
  );

ELSE -- Optionally, you can choose to handle the error or log it
RAISE WARNING 'Referenced table % does not exist in schema %; constraint % will not be created.',
split_part(fk.constraint_def, 'REFERENCES ', 2),
new_schema_name,
fk.constraint_name;

END IF;

END LOOP;

-- Step 5: Copy functions from the template schema to the new schema
FOR func IN
SELECT
  proname AS function_name,
  pg_get_functiondef(p.oid) AS function_def
FROM
  pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
  n.nspname = 'iva_ca_template' LOOP -- Modify the function definition to use the new schema
  EXECUTE replace(
    func.function_def,
    'iva_ca_template.',
    format('%I.', new_schema_name)
  );

END LOOP;

-- Assign DB Grants to user group customer_ca

EXECUTE 'GRANT USAGE ON SCHEMA ' || quote_ident(new_schema_name) || ' TO container_ca' ;
EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ' || quote_ident(new_schema_name) || ' TO container_ca' ;
  	

END;

$$;
