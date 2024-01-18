'use strict'

/**
 * Removes all data created for acceptance tests from the idm schema
 * @module IdmSchemaService
 */

const { db } = require('../../../../db/db.js')

async function go () {
  const startTime = process.hrtime.bigint()

  await _disableTriggers()

  const query = db
    .from('idm.users')
    .whereJsonPath('user_data', '$.source', '=', 'acceptance-test-setup')
    .orWhereLike('userName', '%@example.com')
    .del().toString()
  console.log('🚀 ~ IDM:', query)

  await db
    .from('idm.users')
    .whereJsonPath('user_data', '$.source', '=', 'acceptance-test-setup')
    .orWhereLike('userName', '%@example.com')
    .del()

  await _enableTriggers()

  _calculateAndLogTime(startTime)
}

async function _disableTriggers () {
  await db.raw('ALTER TABLE idm.users DISABLE TRIGGER ALL')
}

async function _enableTriggers () {
  await db.raw('ALTER TABLE idm.users ENABLE TRIGGER ALL')
}

function _calculateAndLogTime (startTime) {
  const endTime = process.hrtime.bigint()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n

  global.GlobalNotifier.omg('IDM complete', { timeTakenMs })
}

module.exports = {
  go
}
