'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/licence-monitoring-station/setup/{sessionId}/licence-number`
 * page
 *
 * @module LicenceNumberService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const LicenceNumberPresenter = require('../../../presenters/licence-monitoring-station/setup/licence-number.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = LicenceNumberPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
