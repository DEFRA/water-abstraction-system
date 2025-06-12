'use strict'

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 * @module ProcessCleanService
 */

const CleanEmptyVoidReturnLogsService = require('./clean-empty-void-return-logs.service.js')
const CleanExpiredSessionsService = require('./clean-expired-sessions.service.js')
const CleanEmptyVoidReturnLogsService = require('./clean-empty-void-return-logs.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const emptyVoidReturnLogsCount = await CleanEmptyVoidReturnLogsService.go()
    const expiredSessionsCount = await CleanExpiredSessionsService.go()

    calculateAndLogTimeTaken(startTime, 'Clean job complete', {
      counts: { emptyVoidReturnLogs: emptyVoidReturnLogsCount, expiredSessions: expiredSessionsCount }
    })
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', {}, error)
  }
}

module.exports = {
  go
}
