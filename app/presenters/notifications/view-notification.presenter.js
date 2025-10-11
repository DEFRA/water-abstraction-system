'use strict'

/**
 * Formats notification data ready for presenting in the view notification page
 * @module ViewNotificationPresenter
 */

const { formatLongDate, formatRestrictionType, formatValueUnit, titleCase } = require('../base.presenter.js')
const { notifyErrors, noticeMappings } = require('../../lib/static-lookups.lib.js')

/**
 * Formats notification data ready for presenting in the view notification page
 *
 * @param {module:LicenceModel} licence - The related licence
 * @param {module:NotificationModel} notification - The selected notification with attached notice
 *
 * @returns {object} The data formatted for the view template
 */
function go(licence, notification) {
  const { createdAt, event, messageType, plaintext } = notification
  const { id: licenceId, licenceRef } = licence

  return {
    address: _address(notification),
    alertDetails: _alertDetails(notification),
    backLink: { href: `/system/licences/${licenceId}/communications`, text: 'Go back to communications' },
    contents: plaintext,
    errorDetails: _errorDetails(notification),
    licenceRef,
    messageType,
    pageTitle: _pageTitle(notification),
    pageTitleCaption: `Licence ${licenceRef}`,
    paperForm: _paperForm(notification),
    reference: event.referenceCode,
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
    alertType,
    label,
    monitoring_station_name: name,
    thresholdUnit,
    thresholdValue
  } = notification.personalisation

  return {
    alertType: alertType ? formatRestrictionType(alertType) : 'Not recorded',
    monitoringStation: label ?? name,
    threshold: formatValueUnit(thresholdValue, thresholdUnit)
  }
}

/**
 * Generally the `notifyError` will get populated when a notification fails to send to Notify, for whatever reason
 * (issue on our side or Notify rejects it).
 *
 * This means notifyStatus will not get populated. If we have managed to send it, then we are interested in what
 * `notifyStatus` says, because we've marked the notification as errored because of it.
 *
 * We relay the description Notify provides in its docs when this is the case. We default to a generic message for
 * system errors because we're dealing with old records that might have all sorts in those error messages!
 * @private
 */
function _errorDetails(notification) {
  const { messageType, notifyError, notifyStatus, status } = notification

  if (status !== 'error') {
    return null
  }

  if (notifyError) {
    return {
      status: notifyStatus ?? 'Not sent',
      description: 'Internal system error'
    }
  }

  return {
    status: notifyStatus,
    description: notifyErrors[messageType][notifyStatus]
  }
}

function _pageTitle(notification) {
  const { alertType, subtype } = notification.event

  let title = noticeMappings[subtype]

  if (alertType) {
    title = `${titleCase(alertType)} alert`
  }

  return title
}

function _paperForm(notification) {
  // Very early paper form notifications used 'pdf.return_form' It looks like for a period we also sent paper reminders
  // but that functionality has since been hidden. All the latest paper forms use the subtype 'paperReturnForms'.
  if (!['pdf.return_form', 'pdf.return_reminder', 'paperReturnForms'].includes(notification.event.subtype)) {
    return null
  }

  const { id, hasPdf, personalisation } = notification

  return {
    downloadLink: hasPdf ? `/system/notifications/${id}/download` : null,
    link: `/system/return-logs?id=${personalisation.qr_url}`,
    period: `${personalisation.start_date} to ${personalisation.end_date}`,
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
