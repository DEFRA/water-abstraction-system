'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 * @module PreviewService
 */

const AbstractionAlertNotificationsPresenter = require('../../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js')
const NotificationsPresenter = require('../../../../presenters/notices/setup/notifications.presenter.js')
const PreviewPresenter = require('../../../../presenters/notices/setup/preview/preview.presenter.js')
const RecipientsService = require('../recipients.service.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} sessionId - The UUID of the returns notices session record
 * @param {string} [licenceMonitoringStationId=null] - The UUID of the licence monitoring station record (This is only
 * populated for abstraction alerts)
 *
 * @returns {Promise<object>} The view data for the preview page
 */
async function go(contactHashId, sessionId, licenceMonitoringStationId) {
  const session = await SessionModel.query().findById(sessionId)

  const recipient = await _recipient(contactHashId, session)
  const notification = _notification(recipient, session, licenceMonitoringStationId)

  const formattedData = await PreviewPresenter.go(
    contactHashId,
    session.noticeType,
    notification,
    sessionId,
    licenceMonitoringStationId
  )

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

function _notification(recipient, session, licenceMonitoringStationId) {
  let notification

  if (session.noticeType === 'abstractionAlerts') {
    const unfilteredNotifications = AbstractionAlertNotificationsPresenter.go(recipient, session)

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
  const recipients = await RecipientsService.go(session)

  // Using `filter` rather than `find` ensures we return an array which makes it simpler to reuse existing logic
  return recipients.filter((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
