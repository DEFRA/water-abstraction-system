'use strict'

/**
 * Formats notification data ready for presenting in the view notification page
 * @module ViewNotificationPresenter
 */

const NotificationErrorPresenter = require('./notification-error.presenter.js')
const { formatLongDate, formatNoticeType, formatRestrictionType, formatValueUnit } = require('../base.presenter.js')

/**
 * Formats notification data ready for presenting in the view notification page
 *
 * If linked to from the view licence communications page, the ID of the licence will be included in the link and the
 * page will display the notification from within that context, for example, `pageTitleCaption` will be the licence ref.
 *
 * If no licence ID is provided then it is assumed we are linked from the view notice page. Now the page will display
 * in the context of just the notice, for example, `pageTitleCaption` will be the notice reference and we won't bother
 * repeating it in the metadata.
 *
 * @param {module:NotificationModel} notification - The selected notification with attached notice
 * @param {module:LicenceModel} [licence=null] - The related licence if coming from the view licence communications page
 *
 * @returns {object} The data formatted for the view template
 */
function go(notification, licence = null) {
  const { createdAt, event, messageType, plaintext, returnedAt } = notification

  return {
    activeNavBar: licence ? 'search' : 'notices',
    address: _address(notification),
    alertDetails: _alertDetails(notification),
    backLink: _backLink(notification, licence),
    contents: plaintext,
    errorDetails: NotificationErrorPresenter.go(notification),
    messageType,
    pageTitle: formatNoticeType(event.subtype, event.sendingAlertType),
    pageTitleCaption: _pageTitleCaption(notification, licence),
    paperForm: _paperForm(notification),
    reference: licence ? event.referenceCode : null,
    returnedDate: returnedAt ? formatLongDate(returnedAt) : null,
    sentDate: formatLongDate(createdAt),
    sentBy: event.issuer,
    sentTo: _sentTo(notification),
    status: notification.status
  }
}

function _address(notification) {
  const { personalisation } = notification

  const addressLines = [
    personalisation['address_line_1'],
    personalisation['address_line_2'],
    personalisation['address_line_3'],
    personalisation['address_line_4'],
    personalisation['address_line_5'],
    personalisation['address_line_6'],
    personalisation['address_line_7'],
    personalisation['postcode']
  ]

  return addressLines.filter((addressLine) => {
    return addressLine
  })
}

function _alertDetails(notification) {
  if (notification.event.subtype !== 'waterAbstractionAlerts') {
    return null
  }

  const {
    label,
    monitoring_station_name: name,
    alertType,
    thresholdUnit,
    thresholdValue
  } = notification.personalisation

  return {
    alertType: alertType ? formatRestrictionType(alertType) : 'Not recorded',
    monitoringStation: label ?? name,
    threshold: formatValueUnit(thresholdValue, thresholdUnit)
  }
}

function _backLink(notification, licence) {
  if (licence) {
    return { href: `/system/licences/${licence.id}/communications`, text: 'Go back to communications' }
  }

  const { event } = notification

  return { href: `/system/notices/${event.id}`, text: `Go back to notice ${event.referenceCode}` }
}

function _pageTitleCaption(notification, licence) {
  if (licence) {
    return `Licence ${licence.licenceRef}`
  }

  return `Notice ${notification.event.referenceCode}`
}

function _paperForm(notification) {
  // Very early paper form notifications used 'pdf.return_form' It looks like for a period we also sent paper reminders
  // but that functionality has since been hidden. All the latest paper forms use the subtype 'paperReturnForms'.
  if (!['pdf.return_form', 'pdf.return_reminder', 'paperReturnForms'].includes(notification.event.subtype)) {
    return null
  }

  const { id, hasPdf, personalisation } = notification
  const startDate = new Date(personalisation.start_date)
  const endDate = new Date(personalisation.end_date)

  return {
    downloadLink: hasPdf ? `/system/notifications/${id}/download` : null,
    link: `/system/return-logs?id=${personalisation.qr_url}`,
    period: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    purpose: personalisation.purpose,
    reference: personalisation.format_id,
    siteDescription: personalisation.site_description ?? ''
  }
}

function _sentTo(notification) {
  const { messageType, personalisation, recipient } = notification

  if (messageType === 'email') {
    return recipient
  }

  return personalisation['address_line_1']
}

module.exports = {
  go
}
