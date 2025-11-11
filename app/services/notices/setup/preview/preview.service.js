'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 * @module PreviewService
 */

const AbstractionAlertNotificationsPresenter = require('../../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js')
const FetchRecipientsService = require('../fetch-recipients.service.js')
const NotificationsPresenter = require('../../../../presenters/notices/setup/notifications.presenter.js')
const PreviewPresenter = require('../../../../presenters/notices/setup/preview/preview.presenter.js')
const SessionModel = require('../../../../models/session.model.js')
const { NoticeType } = require('../../../../lib/static-lookups.lib.js')

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 *
 * @param {string} sessionId - The UUID of the returns notices session record
 * @param {string} contactHashId - The recipient's unique identifier
 * @param {string} [licenceMonitoringStationId=null] - The UUID of the licence monitoring station record (This is only
 * populated for abstraction alerts)
 *
 * @returns {Promise<object>} The view data for the preview page
 */
async function go(sessionId, contactHashId, licenceMonitoringStationId = null) {
  const session = await SessionModel.query().findById(sessionId)

  const recipient = await _recipient(contactHashId, session)
  const notification = _notification(recipient, session, licenceMonitoringStationId)

  const formattedData = await PreviewPresenter.go(
    contactHashId,
    session.noticeType,
    notification,
    sessionId,
    licenceMonitoringStationId,
    session.referenceCode
  )

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

function _notification(recipient, session, licenceMonitoringStationId) {
  let notification

  if (session.noticeType === NoticeType.ABSTRACTION_ALERTS) {
    const unfilteredNotifications = AbstractionAlertNotificationsPresenter.go(session, [recipient], null)

    notification = unfilteredNotifications.find((unfilteredNotification) => {
      return unfilteredNotification.personalisation.licenceGaugingStationId === licenceMonitoringStationId
    })
  } else {
    notification = NotificationsPresenter.go(session, [recipient], null)[0]
  }

  return notification
}

async function _recipient(contactHashId, session) {
  const recipients = await FetchRecipientsService.go(session)

  return recipients.find((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

module.exports = {
  go
}
