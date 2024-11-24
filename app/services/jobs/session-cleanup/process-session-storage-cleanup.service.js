'use strict'

/**
 * Deletes any temporary session records where the `created_at` date is more than 1 day ago
 * @module ProcessSessionStorageCleanupService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Deletes any temporary session records where the `created_at` date is more than 1 day ago
 */
async function go() {
  const startTime = currentTimeInNanoseconds()

  const numberOfRowsDeleted = await _deleteSessionRecords()

  calculateAndLogTimeTaken(startTime, 'Session storage cleanup job complete', { rowsDeleted: numberOfRowsDeleted })
}

async function _deleteSessionRecords() {
  const maxAgeInDays = 1
  const maxSessionAge = new Date(new Date().setDate(new Date().getDate() - maxAgeInDays)).toISOString()

  const numberOfRowsDeleted = await SessionModel.query().delete().where('created_at', '<', maxSessionAge)

  return numberOfRowsDeleted
}

module.exports = {
  go
}
