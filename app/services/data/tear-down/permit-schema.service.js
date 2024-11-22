'use strict'

/**
 * Removes all data created for acceptance tests from the permit schema
 * @module PermitSchemaService
 */

const { db } = require('../../../../db/db.js')

/**
 * Removes all data created for acceptance tests from the permit schema
 *
 * @returns {Promise<object>}
 */
async function go() {
  return _deleteAllTestData()
}

async function _deleteAllTestData() {
  return db.raw(`
  ALTER TABLE permit.licence DISABLE TRIGGER ALL;

  DELETE
  FROM
    "permit"."licence"
  WHERE
    jsonb_path_query_first(
      "metadata",
      '$.source'
    ) #>> '{}' = 'acceptance-test-setup';

  ALTER TABLE permit.licence ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}
