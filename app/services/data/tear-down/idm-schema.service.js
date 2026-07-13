/**
 * Removes all data created for acceptance tests from the idm schema
 * @module IdmSchemaService
 */

import { db } from '../../../../db/db.js'

/**
 * Removes all data created for acceptance tests from the idm schema
 *
 * @returns {Promise<object>}
 */
export default async function idmSchema() {
  return _deleteAllTestData()
}

async function _deleteAllTestData() {
  return db.raw(`
  DELETE
  FROM
    "idm"."users"
  WHERE
    jsonb_path_query_first(
      "user_data",
      '$.source'
    ) #>> '{}' = 'acceptance-test-setup'
    OR "user_name" LIKE '%@example.com'
    OR "user_name" LIKE '%@e'
    OR "user_name" LIKE 'regression.tests%';
  `)
}
