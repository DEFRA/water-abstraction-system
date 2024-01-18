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
  delete from "idm"."users" where jsonb_path_query_first("user_data", '$.source') #>> '{}' = 'acceptance-test-setup' or "user_name" like '%@example.com';
  `)
}

module.exports = {
  go
}
