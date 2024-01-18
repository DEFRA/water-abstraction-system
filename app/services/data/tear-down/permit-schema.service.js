'use strict'

/**
 * Removes all data created for acceptance tests from the permit schema
 * @module PermitSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  return _licence()
}

async function _licence () {
  return db.raw(`
  ALTER TABLE permit.licence DISABLE TRIGGER ALL;

  delete from "permit"."licence" where jsonb_path_query_first("metadata", '$.source') #>> '{}' = 'acceptance-test-setup';

  ALTER TABLE permit.licence ENABLE TRIGGER ALL;
  `)
}

module.exports = {
  go
}
