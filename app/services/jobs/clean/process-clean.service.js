/**
 * Processes deletion from the service of redundant records, for example, old sessions
 * @module ProcessCleanService
 */

import CleanEmptyBillRunsService from './clean-empty-bill-runs.service.js'
import CleanEmptyVoidReturnLogsService from './clean-empty-void-return-logs.service.js'
import CleanExpiredSessionsService from './clean-expired-sessions.service.js'
import CleanIncompleteCompanyContactsService from './clean-incomplete-company-contacts.service.js'
import CleanOrphanedContactsService from './clean-orphaned-contacts.service.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds } from '../../../lib/general.lib.js'

/**
 * Processes deletion from the service of redundant records, for example, old sessions
 *
 * > The calls are wrapped in a try/catch but they should never be called. Each task is written to handle its own
 * > errors. This is a safety net in case me miss something. An error here would be an uncaught exception as it is not
 * > handled by the controller. This would cause the app itself to fall over.
 */
export default async function processClean() {
  try {
    const startTime = currentTimeInNanoseconds()

    const emptyBillRunsCount = await CleanEmptyBillRunsService()
    const emptyVoidReturnLogsCount = await CleanEmptyVoidReturnLogsService()
    const expiredSessionsCount = await CleanExpiredSessionsService()
    const incompleteCompanyContactsCount = await CleanIncompleteCompanyContactsService()
    const orphanedContactsCount = await CleanOrphanedContactsService()

    calculateAndLogTimeTaken(startTime, 'Clean job complete', {
      counts: {
        emptyBillRuns: emptyBillRunsCount,
        emptyVoidReturnLogs: emptyVoidReturnLogsCount,
        expiredSessions: expiredSessionsCount,
        incompleteCompanyContacts: incompleteCompanyContactsCount,
        orphanedContacts: orphanedContactsCount
      }
    })
  } catch (error) {
    globalThis.GlobalNotifier.omfg('Clean job failed', {}, error)
  }
}
