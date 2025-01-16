'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewService
 */

const SessionModel = require('../../../models/session.model.js')
const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')
const RecipientsService = require('./recipients.service.js')
const ReviewPresenter = require('../../../presenters/notifications/setup/review.presenter.js')

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { returnsPeriod } = session
  const selectedReturnsPeriod = _extractReturnPeriod(returnsPeriod)
  const isSummer = _isSummer(returnsPeriod)

  const recipients = await RecipientsService.go(selectedReturnsPeriod.dueDate, isSummer)

  const pageData = ReviewPresenter.go(recipients)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

function _isSummer(returnsPeriod) {
  return returnsPeriod === 'summer' ? 'true' : 'false'
}

function _extractReturnPeriod(returnsPeriod) {
  const periods = determineUpcomingReturnPeriods()
  return periods.find((period) => period.name === returnsPeriod)
}

module.exports = {
  go
}
