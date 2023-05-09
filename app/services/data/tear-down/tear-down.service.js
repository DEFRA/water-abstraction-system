'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const { db } = require('../../../../db/db.js')
const TearDownWaterSchemaService = require('./tear-down-water-schema.service.js')
const TearDownCrmSchemaService = require('./tear-down-crm-schema.service.js')
const TearDownReturnsSchemaService = require('./tear-down-returns-schema.service.js')

async function go () {
  await TearDownWaterSchemaService.go()
  await TearDownCrmSchemaService.go()
  await TearDownReturnsSchemaService.go()

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
