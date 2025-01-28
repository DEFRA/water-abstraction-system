'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup review page
 * @module ReviewService
 */

const DedupeRecipientsService = require('./dedupe-recipients.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const RecipientsService = require('./fetch-recipients.service.js')
const ReviewPresenter = require('../../../presenters/notifications/setup/review.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup review page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 * @param {number|string} [page=1] - The currently selected page (if paginated)
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId, page = 1) {
  const session = await SessionModel.query().findById(sessionId)

  const { returnsPeriod } = session
  const selectedReturnsPeriod = _extractReturnPeriod(returnsPeriod)
  const summer = _summer(returnsPeriod)

  const recipients = await RecipientsService.go(selectedReturnsPeriod.dueDate, summer)

  const dedupeRecipients = DedupeRecipientsService.go(recipients)

  const pagination = PaginatorPresenter.go(
    dedupeRecipients.length,
    Number(page),
    `/system/notifications/setup/${sessionId}/review`
  )

  const formattedData = ReviewPresenter.go(dedupeRecipients, page, pagination)

  return {
    activeNavBar: 'manage',
    ...formattedData,
    pagination,
    page
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
