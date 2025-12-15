'use strict'

/**
 * Initiates the session record used for setting up a new billing account journey
 * @module InitiateSessionService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up a new billing account journey
 *
 * During the setup for a new billing account we temporarily store the data in a `SessionModel`
 * instance. It is expected that on each page of the journey the GET will fetch the session record and use it to
 * populate the view.
 * When the page is submitted the session record will be updated with the next piece of data.
 *
 * At the end when the journey is complete the data from the session will be used to update the billing account information
 * and the session record itself deleted.
 *
 * @param {string} billingAccountId - The UUID of the billing account
 *
 * @returns {Promise<string>} the url to redirect to
 */
async function go(billingAccountId) {
  const data = { billingAccountId }

  return SessionModel.query().insert({ data }).returning('id')
}

module.exports = {
  go
}
