'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup review page
 * @module ReviewService
 */

const DetermineRecipientsService = require('./determine-recipients.service.js')
const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const RecipientsService = require('./fetch-recipients.service.js')
const ReviewPresenter = require('../../../presenters/notifications/setup/review.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

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

  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  const removeLicences = transformStringOfLicencesToArray(session.removeLicences)

  const recipientsData = await RecipientsService.go(returnsPeriod.dueDate, summer, removeLicences)

  const recipients = DetermineRecipientsService.go(recipientsData)

  const pagination = PaginatorPresenter.go(
    recipients.length,
    Number(page),
    `/system/notifications/setup/${sessionId}/review`
  )

  const formattedData = ReviewPresenter.go(recipients, page, pagination, sessionId)

  return {
    activeNavBar: 'manage',
    ...formattedData,
    pagination,
    page
  }
}

module.exports = {
  go
}
