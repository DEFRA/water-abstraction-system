'use strict'

/**
 * Removes all data created for acceptance tests
 * @module TearDownService
 */

const { db } = require('../../../../db/db.js')
const TearDownWaterSchemaService = require('./tear-down-water-schema.service.js')
const TearDownCrmSchemaService = require('./tear-down-crm-schema.service.js')

async function go () {
  await TearDownWaterSchemaService.go()
  await TearDownCrmSchemaService.go()

  // returns schema
  await _deleteReturns()

  // permit schema
  await _deletePermit()

  // idm schema
  await _deleteUsers()

  return 'Test data deleted!'
}

async function _deleteReturns () {
  await db
    .from('returns.lines as l')
    .innerJoin('returns.versions as v', 'l.versionId', 'v.versionId')
    .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
    .where('r.isTest', true)
    .del()

  await db
    .from('returns.versions as v')
    .innerJoin('returns.returns as r', 'v.returnId', 'r.returnId')
    .where('r.isTest', true)
    .del()

  await _deleteTestData('returns.returns')
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

async function _deleteTestData (tableName) {
  await db
    .from(tableName)
    .where('isTest', true)
    .del()
}

module.exports = {
  go
}
