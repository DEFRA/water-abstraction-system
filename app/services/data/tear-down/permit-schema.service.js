'use strict'

/**
 * Removes all data created for acceptance tests from the permit schema
 * @module PermitSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  await _disableTriggers()

  const query = db
    .from('permit.licence')
    .whereJsonPath('metadata', '$.source', '=', 'acceptance-test-setup')
    .del()
    .toString()
  console.log('🚀 ~ PERMIT:', query)

  await db
    .from('permit.licence')
    .whereJsonPath('metadata', '$.source', '=', 'acceptance-test-setup')
    .del()

  await _enableTriggers()

  _calculateAndLogTime(startTime)
}

async function _disableTriggers () {
  await db.raw('ALTER TABLE permit.licence DISABLE TRIGGER ALL')
}

async function _enableTriggers () {
  await db.raw('ALTER TABLE permit.licence ENABLE TRIGGER ALL')
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('Permit complete', { timeTakenMs })
}

module.exports = {
  go
}
