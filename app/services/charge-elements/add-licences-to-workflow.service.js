'use strict'

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in 50 days or less
 * @module AddLicencesToWorkflowService
 */

const FetchLicencesService = require('./fetch-licences.service.js')
const Workflow = require('../../models/water/workflow.model.js')

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in 50 days or less
 */
async function go () {
  const licencesForWorkflow = await FetchLicencesService.go()

  if (licencesForWorkflow.length) {
    await _addLicenceToWorkflow(licencesForWorkflow)
  }
}

async function _addLicenceToWorkflow (licencesForWorkflow) {
  // Attach additional data to the array that the chargeVersionWorkflow table requires to create a valid record
  licencesForWorkflow.forEach((licenceForWorkflow) => {
    licenceForWorkflow.status = 'to_setup'
    licenceForWorkflow.data = { chargeVersion: null }
    licenceForWorkflow.createdAt = new Date()
    licenceForWorkflow.updatedAt = new Date()
  })

  await Workflow.query().insert(licencesForWorkflow)
}

module.exports = {
  go
}
