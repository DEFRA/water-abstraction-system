'use strict'

/**
 * Formats recipients and return logs into notifications for a paper return
 * @module PaperReturnNotificationsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats recipients and return logs into notifications for a paper return
 *
 * @param {object} session - The session instance containing all due return logs for the licence, and which ones have
 * been selected for sending as a paper return notification
 * @param {object[]} recipients - List of recipients, each containing details such as the address of the recipient
 * @param {string} noticeId - The UUID of the notice these notifications should be linked to
 *
 * @returns {object[]} the recipients and return logs transformed into notifications
 */
function go(session, recipients, noticeId) {
  const notifications = []

  const { licenceRef } = session
  const selectedReturnLogs = _selectedReturnLogs(session)

  for (const selectedReturnLog of selectedReturnLogs) {
    for (const recipient of recipients) {
      const notification = _notification(recipient, selectedReturnLog, noticeId, licenceRef)

      notifications.push(notification)
    }
  }

  return notifications
}

function _address(recipient) {
  return NotifyAddressPresenter.go(recipient.contact)
}

function _notification(recipient, selectedReturnLog, noticeId, licenceRef) {
  return {
    eventId: noticeId,
    licences: [licenceRef],
    messageRef: 'pdf.return_form',
    messageType: 'letter',
    personalisation: _personalisation(recipient, selectedReturnLog, licenceRef),
    returnLogIds: [selectedReturnLog.returnId],
    status: 'pending'
  }
}

function _personalisation(recipient, selectedReturnLog, licenceRef) {
  const {
    dueDate,
    endDate,
    naldAreaCode,
    purpose,
    regionCode,
    regionName,
    returnId,
    returnReference,
    returnsFrequency,
    siteDescription,
    startDate,
    twoPartTariff
  } = selectedReturnLog

  return {
    ..._address(recipient),
    due_date: formatLongDate(dueDate),
    end_date: formatLongDate(endDate),
    format_id: returnReference,
    is_two_part_tariff: twoPartTariff,
    licence_ref: licenceRef,
    naldAreaCode,
    purpose,
    qr_url: returnId,
    region_code: regionCode,
    region_name: regionName,
    returns_frequency: returnsFrequency,
    site_description: siteDescription,
    start_date: formatLongDate(startDate)
  }
}

function _selectedReturnLogs(session) {
  const { dueReturns: dueReturnLogs, selectedReturns: selectedReturnLogIds } = session

  return dueReturnLogs.filter((dueReturnLog) => {
    return selectedReturnLogIds.includes(dueReturnLog.returnId)
  })
}

module.exports = {
  go
}
