'use strict'

/**
 * Formats notifications data ready for presenting in the view notification page
 * @module ViewNotificationPresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Formats notifications data ready for presenting in the view notification page
 *
 * @param {module:ScheduledNotificationModel} notificationData - The scheduled notification and related licence data
 *
 * @returns {object} The data formatted for the view template
 */
function go(notificationData) {
  const { messageType, plaintext, personalisation, sendAfter } = notificationData.notification
  const { id: licenceId, licenceRef } = notificationData.licence

  return {
    address: messageType === 'letter' ? _address(personalisation) : null,
    contents: plaintext,
    licenceId,
    licenceRef,
    messageType,
    pageTitle: _pageTitle(notificationData.notification),
    sentDate: formatLongDate(sendAfter)
  }
}

function _address(personalisation) {
  const addressLines = [
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'postcode'
  ]

  const address = addressLines.map((line) => personalisation[line])

  return address.filter((line) => line)
}

function _pageTitle(notification) {
  if (notification.event.metadata.name === 'Water abstraction alert') {
    return (
      `${sentenceCase(notification.event.metadata.options.sendingAlertType)}` + ` - ${notification.event.metadata.name}`
    )
  }

  return notification.event.metadata.name
}

module.exports = {
  go
}
