'use strict'

/**
 * Controller for /charge-elements endpoints
 * @module ChargeElementsController
 */

const AddLicencesToWorkflowService = require('../services/charge-elements/add-licences-to-workflow.service.js')

async function workflowTimeLimitedLicences (request, h) {
  AddLicencesToWorkflowService.go()

  return h.response().code(204)
}

module.exports = {
  workflowTimeLimitedLicences
}
