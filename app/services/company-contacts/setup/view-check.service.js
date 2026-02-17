'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module ViewCheckService
 */

const CheckPresenter = require('../../../presenters/company-contacts/setup/check.presenter.js')
const FetchCompanyContactsService = require('./fetch-company-contacts.service.js')
const FetchNotificationsService = require('./fetch-notifications.service.js')
const SessionModel = require('../../../models/session.model.js')
const { markCheckPageVisited } = require('../../../lib/check-page.lib.js')
const { readFlashNotification } = require('../../../lib/general.lib.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const companyContacts = await FetchCompanyContactsService.go(session.company.id, session.companyContact)

  const notifications = await FetchNotificationsService.go(session.email)

  await markCheckPageVisited(session)

  const pageData = CheckPresenter.go(session, companyContacts, notifications)

  const notification = readFlashNotification(yar)

  return {
    ...pageData,
    notification
  }
}

module.exports = {
  go
}
