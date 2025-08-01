'use strict'

/**
 * Formats notification data ready for presenting in the view notification page
 * @module ViewNotificationPresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Formats notification data ready for presenting in the view notification page
 *
 * @param {module:ScheduledNotificationModel} notificationData - The scheduled notification and related licence data
 *
 * @returns {object} The data formatted for the view template
 */
function go(notificationData) {
  const { messageType, plaintext, personalisation, sendAfter, createdAt } = notificationData.notification
  const { id: licenceId, licenceRef } = notificationData.licence

  return {
    address: messageType === 'letter' ? _address(personalisation) : null,
    contents: plaintext,
    licenceId,
    licenceRef,
    messageType,
    pageTitle: _pageTitle(notificationData.notification),
    sentDate: sendAfter ? formatLongDate(sendAfter) : formatLongDate(createdAt)
  }
}

function _address(personalisation) {
  const addressLines = [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['postcode']
  ]

  return addressLines.filter((addressLine) => {
    return addressLine
  })
}

function _pageTitle(notification) {
  if (notification.event.metadata.name === 'Water abstraction alert') {
    return `${sentenceCase(notification.event.metadata.options.sendingAlertType)} - ${notification.event.metadata.name}`
  }

  return notification.event.metadata.name
}

module.exports = {
  go
}
