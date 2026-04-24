'use strict'

const SendRenewalInvitations = require('./send-renewal-invitations.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitations notifications
 * @module ProcessRenewalInvitationsService
 */

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitations notifications
 *
 * @param {number} days - The number of ahead of today
 */
async function go(days) {
  try {
    const startTime = currentTimeInNanoseconds()

    const recipients = await SendRenewalInvitations.go(days)

    calculateAndLogTimeTaken(startTime, 'Renewals invitation status job complete', { count: recipients.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Notification status job failed', null, error)
  }
}

module.exports = {
  go
}
