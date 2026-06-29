'use strict'

/**
 * Removes all data created for acceptance tests from the idm schema
 * @module IdmSchemaService
 */

const { db } = require('../../../../db/db.js')

/**
 * Removes all data created for acceptance tests from the idm schema
 *
 * @param {string} [userEmail] - specific user email to delete from public.users
 * @returns {Promise<object>}
 */
async function go(userEmail) {
  return _deleteAllTestData(userEmail)
}

async function _deleteAllTestData(userEmail) {
  const userEmailClause = userEmail ? `OR "username" = '${userEmail}'` : ''

  return db.raw(`
  DELETE
  FROM
    "public"."users"
  WHERE
    "username" LIKE '%@example.com'
    OR "username" LIKE '%@e'
    OR "username" LIKE 'regression.tests%'
    ${userEmailClause};

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

module.exports = {
  go
}
