'use strict'

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 * @module ProcessTimeLimitedLicencesService
 */

const FetchTimeLimitedLicencesService = require('./fetch-time-limited-licences.service.js')
const {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  timestampForPostgres
} = require('../../../lib/general.lib.js')
const Workflow = require('../../../models/workflow.model.js')

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
    global.GlobalNotifier.omfg('Time limited job failed', null, error)
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

module.exports = {
  go
}
