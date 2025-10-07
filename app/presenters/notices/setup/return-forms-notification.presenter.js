'use strict'

/**
 * Formats recipients into notifications for a return form
 * @module ReturnFormsNotificationPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats recipients into notifications for a return form
 *
 * The 'pageData' is the result of the presenter used when creating the PDF file. It uses different keys, and returns
 * different values specific to creating the file. We cannot just save its 'personalisation' to the DB as it differs
 * from what the legacy code persisted and uses. So, we use this presenter to map that output to what is needed when
 * saving the notification.
 *
 * @param {object} recipient - A single recipient with the contact / address
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {string} eventId - The event if that joins all the notifications
 * @param {object} dueReturnLog - The return log to populate the form data
 *
 * @returns {object} The data formatted persisting as a `notice` record
 */
function go(recipient, licenceRef, eventId, dueReturnLog) {
  return {
    eventId,
    licences: [licenceRef],
    messageRef: 'pdf.return_form',
    messageType: 'letter',
    personalisation: _personalisation(dueReturnLog, recipient, licenceRef),
    returnLogIds: [dueReturnLog.returnId],
    status: 'pending'
  }
}

function _personalisation(dueReturnLog, recipient, licenceRef) {
  const {
    dueDate,
    endDate,
    naldAreaCode,
    purpose,
    regionCode,
    regionName,
    returnLogId,
    returnReference,
    returnsFrequency,
    siteDescription,
    startDate,
    twoPartTariff
  } = dueReturnLog

  return {
    ..._address(recipient),
    due_date: formatLongDate(dueDate),
    end_date: formatLongDate(endDate),
    format_id: returnReference,
    is_two_part_tariff: twoPartTariff,
    licence_ref: licenceRef,
    naldAreaCode,
    purpose,
    qr_url: returnLogId,
    region_code: regionCode,
    region_name: regionName,
    returns_frequency: returnsFrequency,
    site_description: siteDescription,
    start_date: formatLongDate(startDate)
  }
}

function _address(recipient) {
  return NotifyAddressPresenter.go(recipient.contact)
}

module.exports = {
  go
}
