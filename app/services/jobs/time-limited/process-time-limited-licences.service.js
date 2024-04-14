'use strict'

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 * @module ProcessTimeLimitedLicencesService
 */

const FetchTimeLimitedLicencesService = require('./fetch-time-limited-licences.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds, timestampForPostgres } = require('../../../lib/general.lib.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 */
async function go () {
  try {
    const startTime = currentTimeInNanoseconds()

    const licencesForWorkflow = await FetchTimeLimitedLicencesService.go()

    if (licencesForWorkflow.length) {
      await _addLicenceToWorkflow(licencesForWorkflow)
    }

    calculateAndLogTimeTaken(startTime, 'Time limited job complete', { count: licencesForWorkflow.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Time limited job failed', null, error)
  }
}

async function _addLicenceToWorkflow (licencesForWorkflow) {
  const timestamp = timestampForPostgres()

  // Attach additional data to the array that the chargeVersionWorkflow table requires to create a valid record
  licencesForWorkflow.forEach((licenceForWorkflow) => {
    licenceForWorkflow.status = 'to_setup'
    licenceForWorkflow.data = { chargeVersion: null }
    licenceForWorkflow.createdAt = timestamp
    licenceForWorkflow.updatedAt = timestamp
  })

  await Workflow.query().insert(licencesForWorkflow)
}

module.exports = {
  go
}
