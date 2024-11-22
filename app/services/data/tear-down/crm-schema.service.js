'use strict'

/**
 * Removes all data created for acceptance tests from the crm and crm_v2 schemas
 * @module CrmV2SchemaService
 */

const { db } = require('../../../../db/db.js')

/**
 * Removes all data created for acceptance tests from the crm schema
 *
 * @returns {Promise<object>}
 */
async function go() {
  return _deleteAllTestData()
}

async function _deleteAllTestData() {
  return db.raw(`
  ALTER TABLE crm.document_header DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.addresses DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.companies DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_addresses DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_contacts DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.contacts DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.documents DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.document_roles DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_accounts DISABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_account_addresses DISABLE TRIGGER ALL;

  DELETE
  FROM
    "crm_v2"."document_roles"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."company_addresses"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."invoice_account_addresses" AS "iaa"
      USING "crm_v2"."invoice_accounts" AS "ia",
    "crm_v2"."companies" AS "c"
  WHERE
    "c"."is_test" = TRUE
    AND "iaa"."invoice_account_id" = "ia"."invoice_account_id"
    AND "ia"."company_id" = "c"."company_id";

  DELETE
  FROM
    "crm_v2"."invoice_account_addresses"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."invoice_accounts" AS "ia"
      USING "crm_v2"."companies" AS "c"
  WHERE
    "c"."is_test" = TRUE
    AND "ia"."company_id" = "c"."company_id";

  DELETE
  FROM
    "crm_v2"."company_contacts"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."companies"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."addresses"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."documents"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."documents" AS "d"
      USING "crm"."document_header" AS "dh"
  WHERE
    jsonb_path_query_first(
      "dh"."metadata",
      '$.dataType'
    ) #>> '{}' = 'acceptance-test-setup'
    AND "d"."document_ref" = "dh"."system_external_id";

  DELETE
  FROM
    "crm_v2"."contacts"
  WHERE
    "is_test" = TRUE;

  DELETE
  FROM
    "crm_v2"."companies"
  WHERE
    "name" LIKE 'Big Farm Co Ltd%';

  DELETE
  FROM
    "crm"."entity_roles"
  WHERE
    "created_by" = 'acceptance-test-setup';

  DELETE
  FROM
    "crm"."entity"
  WHERE
    "entity_nm" LIKE 'acceptance-test.%'
    OR "entity_nm" LIKE '%@example.com'
    OR "entity_nm" LIKE 'regression.tests.%'
    OR "entity_nm" LIKE 'Big Farm Co Ltd%'
    OR "source" = 'acceptance-test-setup';

  DELETE
  FROM
    "crm"."document_header"
  WHERE
    jsonb_path_query_first(
      "metadata",
      '$.dataType'
    ) #>> '{}' = 'acceptance-test-setup';

    ALTER TABLE crm.document_header ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.addresses ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.companies ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_addresses ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.company_contacts ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.contacts ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.documents ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.document_roles ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_accounts ENABLE TRIGGER ALL;
  ALTER TABLE crm_v2.invoice_account_addresses ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}
