'use strict'

/**
 * Removes all data created for acceptance tests from the returns schema
 * @module TearDownReturnsSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  await _deleteReturns()
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

async function _deleteTestData (tableName) {
  await db
    .from(tableName)
    .where('isTest', true)
    .del()
}

module.exports = {
  go
}
