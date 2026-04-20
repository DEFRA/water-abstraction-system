'use strict'

const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Orchestrates the process of fetching, sending, and updating renewal reminder notifications
 * @module ProcessRenewalRemindersService
 */

/**
 * Orchestrates the process of fetching, sending, and updating renewal reminder notifications
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    calculateAndLogTimeTaken(startTime, 'Renewal reminders status job complete')
  } catch (error) {
    global.GlobalNotifier.omfg('Notification status job failed', null, error)
  }
}

module.exports = {
  go
}
