'use strict'

/**
 * Formats notification data ready for presenting in the view notification page
 * @module ViewNotificationPresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

/**
 * Formats notification data ready for presenting in the view notification page
 *
 * @param {module:NotificationModel} notificationData - The notification and related licence data
 *
 * @returns {object} The data formatted for the view template
 */
function go(notificationData) {
  const { createdAt, hasPdf, id, messageType, personalisation, plaintext, recipient } = notificationData.notification
  const { id: licenceId, licenceRef } = notificationData.licence

  return {
    address: messageType === 'letter' ? _address(personalisation) : recipient,
    backLink: `/system/licences/${licenceId}/communications`,
    contents: plaintext,
    licenceRef,
    messageType,
    pageTitle: _pageTitle(notificationData.notification),
    returnForm: _returnForm(id, hasPdf),
    sentDate: formatLongDate(createdAt)
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

function _returnForm(id, hasPdf) {
  if (hasPdf) {
    return {
      link: `/system/notifications/${id}/download`,
      text: 'Preview paper return'
    }
  }

  return {
    text: 'No preview available'
  }
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
