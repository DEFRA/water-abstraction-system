'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 * @module PreviewService
 */

const DetermineRecipientsService = require('./determine-recipients.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')
const PreviewPresenter = require('../../../presenters/notices/setup/preview.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} sessionId - The UUID for returns notices session record
 *
 * @returns {Promise<object>} The view data for the preview page
 */
async function go(contactHashId, sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const recipient = await _recipient(contactHashId, session)
  const notification = _notification(recipient, session)

  const formattedData = await PreviewPresenter.go(notification, sessionId)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

function _notification(recipient, session) {
  const { determinedReturnsPeriod, referenceCode, journey } = session

  const notifications = NotificationsPresenter.go(recipient, determinedReturnsPeriod, referenceCode, journey)

  return notifications[0] // Only one record will be returned as we are looking for a single recipient
}

async function _recipient(contactHashId, session) {
  const recipientsData = await FetchRecipientsService.go(session)

  const recipients = DetermineRecipientsService.go(recipientsData)

  // Using `filter` rather than `find` ensures we return an array which makes it simpler to reuse existing logic
  return recipients.filter((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
