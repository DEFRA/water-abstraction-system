'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup check page
 * @module CheckService
 */

const CheckPresenter = require('../../../presenters/notices/setup/check.presenter.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const RecipientsService = require('./recipients.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup check page
 *
 * @param {string} sessionId - The UUID for returns notices session record
 * @param {number|string} [page=1] - The currently selected page (if paginated)
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {object} The view data for the review page
 */
async function go(sessionId, page = 1, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const recipients = await RecipientsService.go(session, false)

  _thing(recipients, session)

  const pagination = PaginatorPresenter.go(recipients.length, Number(page), `/system/notices/setup/${sessionId}/check`)

  const formattedData = CheckPresenter.go(recipients, page, pagination, session)

  const notification = yar.flash('notification')[0]

  return {
    ...formattedData,
    activeNavBar: 'manage',
    notification,
    page,
    pagination
  }
}

function _thing(recipients, session) {
  if (!session.selectedRecipients) {
    session.selectedRecipients = recipients.map((recipient) => {
      return recipient.contact_hash_id
    })
  }

  return session.$update()
}

module.exports = {
  go
}
