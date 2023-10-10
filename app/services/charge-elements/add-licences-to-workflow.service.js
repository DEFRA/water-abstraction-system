'use strict'

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 * @module AddLicencesToWorkflowService
 */

const FetchLicencesForWorkflowService = require('./fetch-licences-for-workflow.service.js')
const { timestampForPostgres } = require('../../../app/lib/general.lib.js')
const Workflow = require('../../models/water/workflow.model.js')

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in less than 50 days
 */
async function go () {
  try {
    const licencesForWorkflow = await FetchLicencesForWorkflowService.go()

    if (licencesForWorkflow.length) {
      await _addLicenceToWorkflow(licencesForWorkflow)
    }
  } catch (error) {
    global.GlobalNotifier.omfg('AddLicencesToWorkflowService failed to run', null, error)
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
