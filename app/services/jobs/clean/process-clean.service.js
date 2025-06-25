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
 *
 * > The calls are wrapped in a try/catch but they should never be called. Each task is written to handle its own
 * > errors. This is a safety net in case me miss something. An error here would be an uncaught exception as it is not
 * > handled by the controller. This would cause the app itself to fall over.
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
