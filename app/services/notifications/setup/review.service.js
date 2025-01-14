'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module ReviewService
 */

const SessionModel = require('../../../models/session.model.js')
const { determineUpcomingReturnPeriods } = require('../../../lib/return-periods.lib.js')
const RecipientsService = require('./recipients.service.js')
const ReviewPresenter = require('../../../presenters/notifications/setup/review.presenter.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')

/**
 * Formats data for the `/notifications/setup/review` page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId, page) {
  const session = await SessionModel.query().findById(sessionId)

  const { returnsPeriod } = session

  const selectedReturnsPeriod = _extractReturnPeriod(returnsPeriod)

  const { recipients, total } = await RecipientsService.go(selectedReturnsPeriod.dueDate, 'true', page)

  const recipientData = ReviewPresenter.go(recipients, total)

  const pagination = PaginatorPresenter.go(total, Number(page), `/system/notifications/setup/${sessionId}/review`)

  return {
    activeNavBar: 'manage',
    pageTitle: 'Review the mailing list',
    ...recipientData,
    pagination
  }
}

function _extractReturnPeriod(returnsPeriod) {
  const periods = determineUpcomingReturnPeriods()
  return periods.find((period) => period.name === returnsPeriod)
}

module.exports = {
  go
}
