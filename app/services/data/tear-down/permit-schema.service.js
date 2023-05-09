'use strict'

/**
 * Removes all data created for acceptance tests from the permit schema
 * @module TearDownPermitSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  await db
    .from('permit.licence')
    .where(db.raw("metadata->>'source' = 'acceptance-test-setup'"))
    .del()
}
module.exports = {
  go
}
