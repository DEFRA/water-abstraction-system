'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/confirmed-received` page
 * @module ConfirmedReceivedService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const SessionModel = require('../../../models/session.model.js')
const ConfirmedReceivedPresenter = require('../../../presenters/return-logs/setup/confirmed-received.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/confirmed-received` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _markConfirmationPageVisited(session)

  const formattedData = ConfirmedReceivedPresenter.go(session)

  await ReturnLogModel.query()
    .findById(session.returnLogId)
    .patch({ receivedDate: session.receivedDate, status: 'completed' })

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

async function _markConfirmationPageVisited(session) {
  session.confirmedReceivedPageVisited = true

  return session.$update()
}

module.exports = {
  go
}
