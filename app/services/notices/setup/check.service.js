'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup check page
 * @module CheckService
 */

const CheckPresenter = require('../../../presenters/notices/setup/check.presenter.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const RecipientsService = require('./fetch-recipients.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notifications setup check page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 * @param {number|string} [page=1] - The currently selected page (if paginated)
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId, page = 1) {
  const session = await SessionModel.query().findById(sessionId)

  const recipientsData = await RecipientsService.go(session)

  const recipients = DetermineRecipientsService.go(recipientsData)

  const pagination = PaginatorPresenter.go(recipients.length, Number(page), `/system/notices/setup/${sessionId}/check`)

  const formattedData = CheckPresenter.go(recipients, page, pagination, session)

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
