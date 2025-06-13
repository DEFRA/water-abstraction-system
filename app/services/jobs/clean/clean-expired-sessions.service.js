'use strict'

/**
 * Deletes expired temporary sessions where the `created_at` date is more than 1 day ago
 * @module CleanNotSubmittedVoidReturnsService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Deletes expired temporary sessions where the `created_at` date is more than 1 day ago
 *
 * @returns {Promise<number>} The number of rows deleted
 */
async function go() {
  const maxAgeInDays = 1
  const maxSessionAge = new Date(new Date().setDate(new Date().getDate() - maxAgeInDays)).toISOString()

  return SessionModel.query().delete().where('created_at', '<', maxSessionAge)
}

module.exports = {
  go
}
