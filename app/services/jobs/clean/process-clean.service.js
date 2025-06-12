'use strict'

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 * @module ProcessCleanService
 */

const CleanExpiredSessionsService = require('./clean-expired-sessions.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const expiredSessionsCount = await CleanExpiredSessionsService.go()

    calculateAndLogTimeTaken(startTime, 'Clean job complete', {
      counts: { expiredSessions: expiredSessionsCount }
    })
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', {}, error)
  }
}

module.exports = {
  go
}
