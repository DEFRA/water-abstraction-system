'use strict'

/**
 * Determines the PDF return forms data to send to notify and save to the database
 * @module DetermineReturnFormsService
 */

const ReturnFormsNotificationPresenter = require('../../../presenters/notices/setup/return-forms-notification.presenter.js')

/**
 * Determines the PDF return forms data to send to notify and save to the database
 *
 * @param {object} session - The session instance
 * @param {object[]} recipients - List of recipient objects, each containing recipient details like email / address.
 * @param {string} eventId - the event id to link all the notifications to an event
 *
 * @returns {object[]} - Resolves an array of return forms notifications
 */
async function go(session, recipients, eventId) {
  const { licenceRef, dueReturns, selectedReturns } = session

  const dueReturnLogs = _dueReturnLog(dueReturns, selectedReturns)

  const notifications = []

  for (const dueReturn of dueReturnLogs) {
    for (const recipient of recipients) {
      const notification = ReturnFormsNotificationPresenter.go(recipient, licenceRef, eventId, dueReturn)

      notifications.push(notification)
    }
  }

  return notifications
}

/**
 * The user has to select at least one return. This will be set in the 'selectedReturns' array as the return id.
 *
 * So we will always expect this to work.
 *
 * @private
 */
function _dueReturnLog(dueReturns, selectedReturns) {
  return dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnId)
  })
}

module.exports = {
  go
}
