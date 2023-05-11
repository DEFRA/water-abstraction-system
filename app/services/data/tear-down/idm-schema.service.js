'use strict'

/**
 * Removes all data created for acceptance tests from the idm schema
 * @module IdmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  await db
    .from('idm.users')
    .where(db.raw("user_data->>'source' = 'acceptance-test-setup'"))
    .orWhereLike('userName', '%@example.com')
    .del()
}

module.exports = {
  go
}
