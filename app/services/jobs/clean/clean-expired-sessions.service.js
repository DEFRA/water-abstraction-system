'use strict'

/**
 * Deletes expired temporary sessions where the `created_at` date is more than 1 day ago
 * @module CleanExpiredSessionsService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Deletes expired temporary sessions where the `created_at` date is more than 1 day ago
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  let deletedCount = 0

  try {
    const maxAgeInDays = 1
    const maxSessionAge = new Date(new Date().setDate(new Date().getDate() - maxAgeInDays)).toISOString()

    deletedCount = await SessionModel.query().delete().where('created_at', '<', maxSessionAge)
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', { job: 'clean-expired-sessions' }, error)
  }

  return deletedCount
}

module.exports = {
  go
}
