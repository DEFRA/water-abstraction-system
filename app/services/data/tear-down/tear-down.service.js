'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const { db } = require('../../../../db/db.js')
const WaterSchemaService = require('./water-schema.service.js')
const CrmSchemaService = require('./crm-schema.service.js')
const ReturnsSchemaService = require('./returns-schema.service.js')

async function go () {
  await WaterSchemaService.go()
  await CrmSchemaService.go()
  await ReturnsSchemaService.go()

  // permit schema
  await _deletePermit()

  // idm schema
  await _deleteUsers()

  return 'Test data deleted!'
}

async function _deletePermit () {
  await db
    .from('permit.licence')
    .where(db.raw("metadata->>'source' = 'acceptance-test-setup'"))
    .del()
}

async function _deleteUsers () {
  await db
    .from('idm.users')
    .where(db.raw("user_data->>'source' = 'acceptance-test-setup'"))
    .orWhereLike('userName', '%@example.com')
    .del()
}

module.exports = {
  go
}
