'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}`
 * page
 * @module VolumesService
 */

const VolumesPresenter = require('../../../presenters/return-logs/setup/volumes.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}`
 * page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} The view data for the volumes page
 */
async function go(sessionId, yearMonth) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = VolumesPresenter.go(session, yearMonth)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
