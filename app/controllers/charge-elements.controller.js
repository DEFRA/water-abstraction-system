'use strict'

/**
 * Controller for /charge-elements endpoints
 * @module ChargeElementsController
 */

const AddLicencesToWorkflowService = require('../services/charge-elements/add-licences-to-workflow.service.js')

async function workflowTimeLimitedLicences (request, h) {
  const result = await AddLicencesToWorkflowService.go()

  return h.response(result).code(200)
}

module.exports = {
  workflowTimeLimitedLicences
}
