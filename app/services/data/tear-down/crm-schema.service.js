'use strict'

/**
 * Removes all data created for acceptance tests from the crm schema
 * @module CrmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  return _deleteAllTestData()
}

async function _deleteAllTestData () {
  return db.raw(`
  ALTER TABLE crm.document_header DISABLE TRIGGER ALL;

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
  `)
}

module.exports = {
  go
}
