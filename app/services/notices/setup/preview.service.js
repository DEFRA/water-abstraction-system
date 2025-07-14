'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 * @module PreviewService
 */

const AbstractionAlertsNotificationsPresenter = require('../../../presenters/notices/setup/abstraction-alerts-notifications.presenter.js')
const DetermineRecipientsService = require('./determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('./fetch-abstraction-alert-recipients.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')
const PreviewPresenter = require('../../../presenters/notices/setup/preview.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} licenceMonitoringStationId - The UUID of the licence monitoring station record. This is only
 * populated for abstraction alerts
 * @param {string} sessionId - The UUID of the returns notices session record
 *
 * @returns {Promise<object>} The view data for the preview page
 */
async function go(contactHashId, licenceMonitoringStationId, sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const recipient = await _recipient(contactHashId, session)
  const notification = _notification(licenceMonitoringStationId, recipient, session)

  const formattedData = await PreviewPresenter.go(
    contactHashId,
    session.journey,
    licenceMonitoringStationId,
    notification,
    sessionId
  )

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

function _notification(licenceMonitoringStationId, recipient, session) {
  let notification

  if (session.journey === 'abstraction-alert') {
    const unfilteredNotifications = AbstractionAlertsNotificationsPresenter.go(recipient, session)

    notification = unfilteredNotifications.filter((unfilteredNotification) => {
      return unfilteredNotification.personalisation.licenceMonitoringStationId === licenceMonitoringStationId
    })
  } else {
    notification = NotificationsPresenter.go(recipient, session)
  }

  // The `notifications` array will always only contain one record so we return it as an object rather than an array
  return notification[0]
}

async function _recipient(contactHashId, session) {
  let recipientsData

  if (session.journey === 'abstraction-alert') {
    recipientsData = await FetchAbstractionAlertRecipientsService.go(session)
  } else {
    recipientsData = await FetchRecipientsService.go(session)
  }

  const recipients = DetermineRecipientsService.go(recipientsData)

  // Using `filter` rather than `find` ensures we return an array which makes it simpler to reuse existing logic
  return recipients.filter((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
