'use strict'

/**
 * Removes all data created for acceptance tests from the idm schema
 * @module IdmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  return _users()
}

async function _users () {
  return db.raw(`
  DELETE
  FROM
    "idm"."users"
  WHERE
    jsonb_path_query_first(
      "user_data",
      '$.source'
    ) #>> '{}' = 'acceptance-test-setup'
    OR "user_name" LIKE '%@example.com';
  `)
}

module.exports = {
  go
}
