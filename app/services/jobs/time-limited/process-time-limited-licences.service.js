/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 * @module ProcessTimeLimitedLicencesService
 */

import FetchTimeLimitedLicencesService from './fetch-time-limited-licences.service.js'
import { calculateAndLogTimeTaken, currentTimeInNanoseconds, timestampForPostgres } from '../../../lib/general.lib.js'
import Workflow from '../../../models/workflow.model.js'

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const timeLimitedResults = await FetchTimeLimitedLicencesService.go()

    await _addWorkflowRecords(timeLimitedResults)

    calculateAndLogTimeTaken(startTime, 'Time limited job complete', { count: timeLimitedResults.length })
  } catch (error) {
    const message = 'Time limited job failed'

    globalThis.GlobalNotifier.omfg(message, null, error)
    globalThis.GlobalNotifier.redAlert(message)
  }
}

async function _addWorkflowRecords(timeLimitedResults) {
  const timestamp = timestampForPostgres()

  for (const timeLimitedResult of timeLimitedResults) {
    const { id: licenceId, chargeVersionId: timeLimitedChargeVersionId, licenceVersionId } = timeLimitedResult

    await Workflow.query().insert({
      data: { chargeVersion: null, timeLimitedChargeVersionId },
      licenceId,
      licenceVersionId,
      status: 'to_setup',
      createdAt: timestamp,
      updatedAt: timestamp
    })
  }
}

export default {
  go
}
