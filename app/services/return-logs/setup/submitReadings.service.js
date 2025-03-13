'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module SubmitReadingsService
 */

const ReadingsPresenter = require('../../../presenters/return-logs/setup/readings.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} an object representing the data needed for the readings template
 */
async function go(sessionId, payload, yearMonth) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ReadingsPresenter.go(session, yearMonth)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
