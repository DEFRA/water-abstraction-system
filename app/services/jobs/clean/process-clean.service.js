'use strict'

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 * @module ProcessCleanService
 */

const CleanEmptyBillRunsService = require('./clean-empty-bill-runs.service.js')
const CleanEmptyVoidReturnLogsService = require('./clean-empty-void-return-logs.service.js')
const CleanExpiredSessionsService = require('./clean-expired-sessions.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const emptyBillRunsCount = await CleanEmptyBillRunsService.go()
    const emptyVoidReturnLogsCount = await CleanEmptyVoidReturnLogsService.go()
    const expiredSessionsCount = await CleanExpiredSessionsService.go()

    calculateAndLogTimeTaken(startTime, 'Clean job complete', {
      counts: {
        emptyBillRuns: emptyBillRunsCount,
        emptyVoidReturnLogs: emptyVoidReturnLogsCount,
        expiredSessions: expiredSessionsCount
      }
    })
  } catch (error) {
    global.GlobalNotifier.omfg('Clean job failed', {}, error)
  }
}

module.exports = {
  go
}
