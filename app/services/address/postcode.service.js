'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/postcode` page
 *
 * @module PostcodeService
 */

const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/postcode` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  return {
    activeNavBar: 'search',
    pageTitle: 'Enter a UK postcode',
    ...(session.address?.postcode && { postcode: session.address.postcode }),
    sessionId: session.id
  }
}

module.exports = {
  go
}
