'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  // eslint-disable-next-line no-unused-vars
  const { returnsPeriod } = session

  return {
    activeNavBar: 'manage',
    pageTitle: 'Review the mailing list'
  }
}

module.exports = {
  go
}
