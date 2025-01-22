'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup review page
 * @module ReviewService
 */

const RecipientsService = require('./fetch-recipients.service.js')
const ReviewPresenter = require('../../../presenters/notifications/setup/review.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')
const DeDupeRecipientsService = require('./dedupe-recipients.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup review page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const { returnsPeriod } = session
  const selectedReturnsPeriod = _extractReturnPeriod(returnsPeriod)
  const summer = _summer(returnsPeriod)

  const recipients = await RecipientsService.go(selectedReturnsPeriod.dueDate, summer)

  const deDupeRecipientsS = DeDupeRecipientsService.go(recipients)

  const formattedData = ReviewPresenter.go(deDupeRecipientsS)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

function _extractReturnPeriod(returnsPeriod) {
  const periods = determineUpcomingReturnPeriods()

  return periods.find((period) => {
    return period.name === returnsPeriod
  })
}

function _summer(returnsPeriod) {
  return returnsPeriod === 'summer' ? 'true' : 'false'
}

module.exports = {
  go
}
