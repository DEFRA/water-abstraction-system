'use strict'

const SendRenewalInvitations = require('./send-renewal-invitations.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitations notifications
 * @module ProcessRenewalInvitationsService
 */

/**
 * Orchestrates the process of fetching, sending, and updating renewal invitations notifications
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    await SendRenewalInvitations.go()

    calculateAndLogTimeTaken(startTime, 'Renewal invitations status job complete')
  } catch (error) {
    global.GlobalNotifier.omfg('Notification status job failed', null, error)
  }
}

module.exports = {
  go
}
